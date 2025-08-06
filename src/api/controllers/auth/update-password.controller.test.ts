import { UniqueEntityId } from "@/core/object-values";
import { UpdatePasswordModel } from "@/domain/auth/application/model";
import { ResetPasswordEntity, UserEntity } from "@/domain/auth/enterprise/entities";
import { CryptoService } from "@/domain/services/crypto.service";
import { SendEmailService } from "@/domain/services/emails";
import { RequestMaker, TestServer } from "@/test";
import { SendEmailMockService } from "@/test/email-service.mock";
import { createResetPassword, createUser } from "@/test/seed.test";
import { PrismaClient } from "@prisma/client";
import { expect } from "chai";
import Container from "typedi";

describe("Controller - Update password - PUT", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;
  let cryptoService: CryptoService;

  let user: UserEntity;
  let token: string;
  let resetPassword: ResetPasswordEntity;

  before(() => {
    requestMaker = new RequestMaker();
    testServer = new TestServer();
    prismaRepository = new PrismaClient();
    cryptoService = Container.get(CryptoService);
    Container.set(SendEmailService, new SendEmailMockService());
    testServer.start();
  });

  beforeEach(async () => {
    token = cryptoService.createSalt();
    user = await createUser();
    resetPassword = await createResetPassword({ token, userId: new UniqueEntityId(user.id) });

    await prismaRepository.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email.toString(),
        salt: user.salt,
        passwordHash: user.password,
        createdAt: user.createdAt,
      },
    });
    await prismaRepository.resetPassword.create({
      data: {
        id: resetPassword.id,
        token: resetPassword.token,
        userId: user.id,
        expiresAt: resetPassword.expiresAt,
        createdAt: resetPassword.createdAt,
      },
    });
  });

  afterEach(async () => {
    await prismaRepository.resetPassword.deleteMany();
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  it("should be able to update the password", async () => {
    const response = await requestMaker.execute<UpdatePasswordModel>({
      method: "put",
      body: { password: "new-password" },
      path: `/auth/password?token=${token}`,
    });

    const userAttemptAfterUpdate = await prismaRepository.resetPassword.findFirst();
    const userAfterUpdate = await prismaRepository.user.findUnique({
      where: { id: user.id },
    });
    const passwordHash = await cryptoService.createHashWithSalt("new-password", userAfterUpdate!.salt);
    expect(userAfterUpdate?.passwordHash).to.be.equal(passwordHash);
    expect(userAttemptAfterUpdate?.usedAt).to.not.null;
    expect(userAttemptAfterUpdate?.invalidatedAt).to.not.null;
    expect(response.body.data).to.be.deep.equal({ message: "Password updated successfully." });
  });

  it("should return an error if the password is invalid", async () => {
    const response = await requestMaker.execute<UpdatePasswordModel>({
      method: "put",
      body: { password: "12345" },
      path: `/auth/password?token=${token}`,
    });

    expect(response.body.errors).to.not.be.null;
    expect(response.body.errors.message).to.equal("Validation failed");
    expect(response.body.errors.details).to.not.be.empty;
    expect(response.body.errors.errorType).to.equal("VALIDATION_ERROR");
    expect(response.body.errors.statusCode).to.equal(400);
    expect(response.body.errors.details[0]).to.be.equal("Password must be at least 6 characters long");
  });
});
