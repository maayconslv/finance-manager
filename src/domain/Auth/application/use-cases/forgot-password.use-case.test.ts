import Container, { ContainerInstance } from "typedi";
import { ForgotPasswordUseCase } from "./forgot-password.use-case";
import { ResetPasswordEntity, UserEntity } from "../../enterprise/entities";
import { ResetPasswordRepository, UserRepository } from "@/infrastructure/database/prisma";
import { UserInMemoryRepository, ResetPasswordInMemoryRepository } from "@/infrastructure/database/in-memory";
import { CryptoService } from "@/domain/services/crypto.service";
import { createUser } from "@/test/seed.test";
import { expect } from "chai";
import { BadRequestError } from "@/domain/errors";
import { SendEmailInMemoryService, SendEmailService } from "@/domain/services/emails";

describe("Application - Forgot Password - Use Case", () => {
  let testContainer: ContainerInstance;
  let sut: ForgotPasswordUseCase;

  let user: UserEntity;

  const inMemoryUsers: UserEntity[] = [];
  const inMemoryResetPasswords: ResetPasswordEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");
    testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
    testContainer.set(ResetPasswordRepository, new ResetPasswordInMemoryRepository(inMemoryResetPasswords));
    testContainer.set(CryptoService, new CryptoService());
    testContainer.set(SendEmailService, new SendEmailInMemoryService());

    sut = testContainer.get(ForgotPasswordUseCase);
  });

  beforeEach(async () => {
    user = await createUser();
    inMemoryUsers.push(user);
  });

  afterEach(() => {
    inMemoryUsers.length = 0;
    inMemoryResetPasswords.length = 0;
  });

  after(() => {
    testContainer.reset();
  });

  describe("when the execution is successful", () => {
    it("should be able to send forgot password email for existing user", async () => {
      const result = await sut.execute({ email: user.email.toString() });

      const resetCode = inMemoryResetPasswords[0]!;
      const diffMs = resetCode.expiresAt.getTime() - resetCode.createdAt.getTime();

      expect(result).to.equal("Email sent successfully");
      expect(resetCode.userId?.toString()).to.be.equal(user.id);
      expect(resetCode.token).to.be.a("string");
      expect(resetCode.id).to.be.a("string");
      expect(diffMs).to.equal(30 * 60 * 1000);
    });

    it("should return success message even when user does not exist", async () => {
      const result = await sut.execute({ email: "nonexistent@email.com" });

      expect(result).to.equal("Email sent successfully");
      expect(inMemoryResetPasswords).to.have.lengthOf(0);
    });
  });

  describe("when user has too many recent attempts", () => {
    it("should throw BadRequestError when user has 3 or more recent attempts", async () => {
      const resetPasswordRepo = testContainer.get(ResetPasswordRepository);

      for (let i = 0; i < 3; i++) {
        const resetPassword = {
          userId: user.id.toString(),
          createdAt: new Date(),
          token: `token-${i}`,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        };
        await resetPasswordRepo.save(resetPassword as any);
      }

      try {
        await sut.execute({ email: user.email.toString() });
        expect.fail("Should have thrown BadRequestError");
      } catch (error: any) {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(inMemoryResetPasswords).to.have.lengthOf(3);
        expect(error.message).to.equal("Too many attempts. Please try again later.");
      }
    });
  });

  describe("when email service fails", () => {
    it("should handle email service errors gracefully", async () => {
      const mockSendEmailService = {
        sendEmail: async () => {
          throw new Error("Email service error");
        },
      };
      testContainer.set(SendEmailService, mockSendEmailService);
      const sutWithError = testContainer.get(ForgotPasswordUseCase);

      try {
        await sutWithError.execute({ email: user.email.toString() });
      } catch (error: any) {
        expect(error.message).to.equal("Email service error");
      }
    });
  });
});
