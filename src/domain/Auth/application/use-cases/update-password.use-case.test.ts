import Container, { ContainerInstance } from "typedi";
import { ResetPasswordEntity, UserEntity } from "../../enterprise/entities";
import { ResetPasswordRepository, UserRepository } from "@/infrastructure/database/prisma";
import { ResetPasswordInMemoryRepository, UserInMemoryRepository } from "@/infrastructure/database/in-memory";
import { CryptoService } from "@/domain/services/crypto.service";
import { UpdatePasswordUseCase } from "./update-password.use-case";
import { createResetPassword, createUser } from "@/test/seed.test";
import { UniqueEntityId } from "@/core/object-values";
import { expect } from "chai";
import { BadRequestError } from "@/domain/errors";

describe("Application - Update user password - Use cases", () => {
  let testContainer: ContainerInstance;
  let cryptoService: CryptoService;
  let sut: UpdatePasswordUseCase;

  let user: UserEntity;
  let resetPassword: ResetPasswordEntity;
  let token: string;

  const inMemoryUsers: UserEntity[] = [];
  const inMemoryResetPasswords: ResetPasswordEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");
    testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
    testContainer.set(ResetPasswordRepository, new ResetPasswordInMemoryRepository(inMemoryResetPasswords));
    testContainer.set(CryptoService, new CryptoService());

    sut = testContainer.get(UpdatePasswordUseCase);
    cryptoService = testContainer.get(CryptoService);
  });

  beforeEach(async () => {
    token = cryptoService.createSalt();
    user = await createUser({ password: "123456" });
    resetPassword = await createResetPassword({ userId: new UniqueEntityId(user.id), token });

    inMemoryUsers.push(user);
    inMemoryResetPasswords.push(resetPassword);
  });

  afterEach(() => {
    inMemoryUsers.length = 0;
    inMemoryResetPasswords.length = 0;
  });

  after(() => {
    testContainer.reset();
  });

  it("should be able to update a user password correctly", async () => {
    const passwordBeforeUpdate = user.password;
    const saltBeforeUpdate = user.salt;
    const resetPasswordAttempt = inMemoryResetPasswords;

    const result = await sut.execute({ password: "new-password", token });

    const userAfterUpdate = inMemoryUsers;
    expect(result).to.have.property("message");
    expect(result.message).to.be.equal("Password updated successfully.");
    expect(userAfterUpdate[0]?.password).to.be.not.equal(passwordBeforeUpdate);
    expect(userAfterUpdate[0]?.salt).to.be.not.equal(saltBeforeUpdate);
    expect(resetPasswordAttempt[0]?.invalidatedAt).to.not.be.null;
    expect(resetPasswordAttempt[0]?.usedAt).to.not.be.null;
  });

  describe("validating reset password token", () => {
    it("should return an error if the token was expired", async () => {
      resetPassword = await createResetPassword({
        userId: new UniqueEntityId(user.id),
        token,
        expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      });

      try {
        await sut.execute({ password: "new-password", token });
      } catch (error: any) {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.be.equal("This link has expired. Request a new reset link.");
      }
    });

    it("should return an error if is a invalid token", async () => {
      resetPassword = await createResetPassword({
        userId: new UniqueEntityId(user.id),
        token,
        invalidatedAt: new Date(),
      });

      try {
        await sut.execute({ password: "new-password", token });
      } catch (error: any) {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.be.equal("Invalid link. Please make a new reset request.");
      }
    });

    it("should return an error if the token was used", async () => {
      resetPassword = await createResetPassword({
        userId: new UniqueEntityId(user.id),
        token,
        usedAt: new Date(),
      });

      try {
        await sut.execute({ password: "new-password", token });
      } catch (error: any) {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.be.equal("This link has already been used. Request a new one if necessary.");
      }
    });
  });

  it("should receive error if password is in invalid format", async () => {
    resetPassword = await createResetPassword({ userId: new UniqueEntityId(user.id), token });
    const invalidPassword = "12345";

    try {
      await sut.execute({ password: invalidPassword, token });
    } catch (error: any) {
      expect(error).to.be.instanceOf(BadRequestError);
      expect(error.message).to.be.equal("Password must be at least 6 characters long");
    }
  });
});
