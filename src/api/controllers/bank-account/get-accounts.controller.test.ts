import { Money, UniqueEntityId } from "@/core/object-values";
import { UserAccountsModel } from "@/domain/Accounts/application/model";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { RequestMaker, TestServer } from "@/test";
import { createBankAccount, createUser, createWallet } from "@/test/seed.test";
import { PrismaClient } from "@prisma/client";
import { expect } from "chai";
import jwt from "jsonwebtoken";

describe("Controller - Get user accounts - GET", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;
  let userData: UserEntity;
  let walletData: WalletEntity;
  let bankAccountsData: BankAccountEntity[];
  let token: string;

  before(() => {
    requestMaker = new RequestMaker();
    testServer = new TestServer();
    prismaRepository = new PrismaClient();
    testServer.start();
  });

  beforeEach(async () => {
    userData = await createUser();
    walletData = await createWallet({ userId: userData.id });
    bankAccountsData = [
      createBankAccount({ walletId: new UniqueEntityId(walletData.id) }),
      createBankAccount({ walletId: new UniqueEntityId(walletData.id) }),
    ];

    walletData.increaseAmountInCents = bankAccountsData[0]!.initialBalance.getInCents();
    walletData.increaseAmountInCents = bankAccountsData[1]!.initialBalance.getInCents();

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
    await prismaRepository.bankAccount.createMany({
      data: bankAccountsData.map((item) => ({
        id: item.id,
        walletId: item.walletId,
        bankName: item.bankName,
        accountName: item.accountName,
        initialBalance: item.initialBalance.getInCents(),
        currentBalance: item.currentBalance.getInCents(),
        createdAt: item.createdAt,
      })),
    });

    token = jwt.sign({ userId: userData.id }, process.env["JWT_SECRET"]!);
  });

  afterEach(async () => {
    await prismaRepository.bankAccount.deleteMany();
    await prismaRepository.wallet.deleteMany();
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  it("should be able to get users accounts correctly", async () => {
    const response = await requestMaker.execute<UserAccountsModel>({
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: "/accounts",
    });

    const bankTotalAmount = bankAccountsData.reduce((acc, account) => acc + account.currentBalance.getInCents(), 0);
    const totalAmountData = Money.fromCents(bankTotalAmount + walletData.initialBalance.getInCents());
    expect(totalAmountData.toBRL()).to.be.equal(response.body.data.wallet.currentBalance);
    expect(response.body.data.wallet.id).to.be.equal(walletData.id);
    expect(response.body.data.wallet.currentBalance).to.be.equal(walletData.currentBalance.toBRL());
    expect(response.body.data.wallet.userId).to.be.equal(walletData.userId);
  });

  it("should return unauthorized error if the user is using a invalid token", async () => {
    const response = await requestMaker.execute<UserAccountsModel>({
      method: "get",
      headers: {
        Authorization: `Bearer invalid-token`,
      },
      path: "/accounts",
    });

    expect(response.body.errors.message).to.be.equal("Invalid token");
    expect(response.body.errors.errorType).to.be.equal("UNAUTHORIZED");
    expect(response.body.errors.statusCode).to.be.equal(401);
  });
});
