import Container, { ContainerInstance } from "typedi";
import { AuthenticateUseCase } from "./authenticate.use-case";
import { UserEntity } from "../../enterprise/entities";
import { WalletEntity } from "../../enterprise/entities/wallet.entity";
import { UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { UserInMemoryRepository, WalletInMemoryRepository } from "@/infrastructure/database/in-memory";
import { CryptoService } from "@/domain/services/crypto.service";
import { createUser, createWallet } from "@/test/seed.test";
import { expect } from "chai";
import { UnauthorizedError } from "@/domain/errors";

describe("Application - Authenticate an user - Use Case", () => {
  let testContainer: ContainerInstance;
  let sut: AuthenticateUseCase;

  let user: UserEntity;
  let wallet: WalletEntity;

  const inMemoryUsers: UserEntity[] = [];
  const inMemoryWallets: WalletEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");
    testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
    testContainer.set(WalletRepository, new WalletInMemoryRepository(inMemoryWallets));
    testContainer.set(CryptoService, new CryptoService());

    sut = testContainer.get(AuthenticateUseCase);
  });

  beforeEach(async () => {
    user = await createUser({ password: "123456" });
    wallet = await createWallet({ userId: user.id.toString() });

    inMemoryUsers.push(user);
    inMemoryWallets.push(wallet);
  });

  afterEach(() => {
    inMemoryUsers.length = 0;
    inMemoryWallets.length = 0;

    // TODO: mover função para after()
    testContainer.reset();
  });

  describe("when the execution is successful", () => {
    it("should be able to authenticate a user", async () => {
      const result = await sut.execute({ email: user.email.toString(), password: "123456" });

      expect(result.user.id).to.equal(user.id.toString());
      expect(result.user.email).to.equal(user.email.toString());
      expect(result.user.name).to.equal(user.name);
      expect(result.user.wallet.id).to.equal(wallet.id.toString());
      expect(result.user.wallet.userId).to.equal(wallet.userId.toString());
      expect(result.user.wallet.currentBalance).to.equal(wallet.currentBalance.toBRL());
      expect(result.token).to.be.a("string");
    });
  });

  describe("when the user does not exist", () => {
    it("should not be able to authenticate a user with invalid email", async () => {
      try {
        await sut.execute({ email: "invalid@email.com", password: "123456" });
      } catch (error: any) {
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("Invalid credentials. Please check your email and password.");
      }
    });

    it("should not be able to authenticate a user with invalid password", async () => {
      try {
        await sut.execute({ email: user.email.toString(), password: "invalid-password" });
      } catch (error: any) {
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("Invalid credentials. Please check your email and password.");
      }
    });
  });
});
