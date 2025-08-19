import { RequestMaker, TestServer } from "@/test";
import { PrismaClient } from "@prisma/client";
import { AuthenticateUserRequest } from "./auth.dto";
import { createUser, createWallet } from "@/test/seed.test";
import { AuthenticatedUserModel } from "@/domain/Auth/application/model";
import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { expect } from "chai";

describe("Controller - Authenticate an user - POST", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;
  let userData: UserEntity;
  let walletData: WalletEntity;
  let authenticateUserData: AuthenticateUserRequest;

  before(() => {
    requestMaker = new RequestMaker();
    testServer = new TestServer();
    prismaRepository = new PrismaClient();
    testServer.start();
  });

  beforeEach(async () => {
    userData = await createUser({ password: "123456" });
    walletData = await createWallet({ userId: userData.id.toString() });

    await prismaRepository.user.create({
      data: {
        id: userData.id.toString(),
        name: userData.name,
        email: userData.email.toString(),
        passwordHash: userData.password,
        salt: userData.salt,
      },
    });
    await prismaRepository.wallet.create({
      data: {
        id: walletData.id.toString(),
        currentBalance: walletData.currentBalance.getInCents(),
        initialBalance: walletData.initialBalance.getInCents(),
        userId: userData.id.toString(),
      },
    });

    authenticateUserData = {
      email: userData.email.toString(),
      password: "123456",
    };
  });

  afterEach(async () => {
    await prismaRepository.wallet.deleteMany();
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  it("should be able to authenticate an user", async () => {
    const response = await requestMaker.execute<AuthenticatedUserModel>({
      method: "post",
      body: authenticateUserData,
      path: "/auth/authenticate",
    });
    const { token, user } = response.body.data;

    expect(user.id).to.be.equal(user.id.toString());
    expect(user.name).to.be.equal(user.name);
    expect(user.email).to.be.equal(user.email.toString());
    expect(user.wallet.id).to.be.equal(walletData.id.toString());
    expect(user.wallet.currentBalance).to.be.equal(walletData.currentBalance.toBRL());
    expect(user.wallet.userId).to.be.equal(userData.id.toString());
    expect(token).to.be.equal(token);
  });
});
