import { UserEntity } from "@/domain/Auth/enterprise/entities";
import { SendEmailService } from "@/domain/services/emails";
import { RequestMaker, TestServer } from "@/test";
import { SendEmailMockService } from "@/test/email-service.mock";
import { createUser } from "@/test/seed.test";
import { PrismaClient } from "@prisma/client";
import { expect } from "chai";
import Container from "typedi";

describe("Controller - Forgot password - POST", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;

  let user: UserEntity;

  before(() => {
    requestMaker = new RequestMaker();
    testServer = new TestServer();
    prismaRepository = new PrismaClient();

    Container.set(SendEmailService, new SendEmailMockService());
    testServer.start();
  });

  beforeEach(async () => {
    user = await createUser();
  });

  afterEach(async () => {
    await prismaRepository.resetPassword.deleteMany();
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  it("should be able to request a reset password", async () => {
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

    const response = await requestMaker.execute<string>({
      method: "post",
      body: { email: user.email.toString() },
      path: `/auth/password/forgot`,
    });

    const resetPasswordAttemptData = await prismaRepository.resetPassword.findMany();

    expect(resetPasswordAttemptData).to.have.lengthOf(1);
    expect(resetPasswordAttemptData[0]?.token).to.be.a("string");
    expect(resetPasswordAttemptData[0]?.usedAt).to.be.null;
    expect(resetPasswordAttemptData[0]?.invalidatedAt).to.be.null;
    expect(resetPasswordAttemptData[0]?.userId).to.be.equal(user.id);
    expect(response.body.data).to.be.equal("Email sent successfully");
  });

  it("should return an error if the email is invalid", async () => {
    const response = await requestMaker.execute<string>({
      method: "post",
      body: { email: "invalid-email" },
      path: `/auth/password/forgot`,
    });

    expect(response.body.errors.errorType).to.equal("VALIDATION_ERROR");
    expect(response.body.errors.statusCode).to.equal(400);
    expect(response.body.errors.details[0]).to.be.equal("Please provide a valid email address");
  });
});
