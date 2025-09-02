import { expect } from "chai";
import { CreateUserUseCase } from "./create-user.use-case";
import { Container, ContainerInstance } from "typedi";
import { faker } from "@faker-js/faker";
import { BadRequestError, ConflictError } from "@/domain/errors";
import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { CryptoService } from "@/domain/services/crypto.service";
import { checkUser, checkWallet } from "@/test/checker.test";
import { WalletInMemoryRepository } from "@/infrastructure/database/in-memory/wallet.in-memory.repository";
import { UserInMemoryRepository } from "@/infrastructure/database/in-memory";
import {
  UserRepository,
  WalletRepository,
} from "@/infrastructure/database/prisma";

describe("Application - Create a new user - Use cases", () => {
  let testContainer: ContainerInstance;
  let createUserUseCase: CreateUserUseCase;
  const inMemoryDatabase: UserEntity[] = [];
  const inMemoryWallets: WalletEntity[] = [];

  const userData = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
  };

  before(() => {
    testContainer = Container.of("test-container");

    testContainer.set(
      UserRepository,
      new UserInMemoryRepository(inMemoryDatabase),
    );
    testContainer.set(
      WalletRepository,
      new WalletInMemoryRepository(inMemoryWallets),
    );
    testContainer.set(CryptoService, new CryptoService());

    createUserUseCase = testContainer.get(CreateUserUseCase);
  });

  beforeEach(() => {
    inMemoryDatabase.length = 0;
    inMemoryWallets.length = 0;
  });

  afterEach(() => {
    testContainer.reset();
  });

  describe("validating user data", () => {
    it("should not be able to create a user with an invalid email", async () => {
      const invalidUserData = {
        ...userData,
        email: "invalid-email",
        initialBalance: "100,00",
      };

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.message).to.equal("Please, provide a valid email");
      }
    });

    it("should not be able to create a user with an invalid password", async () => {
      const invalidUserData = {
        ...userData,
        password: "123",
        initialBalance: "100,00",
      };

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.message).to.equal(
          "Password must be at least 6 characters long",
        );
      }
    });

    it("should not be able to create a user with an invalid initial balance", async () => {
      const invalidUserData = {
        ...userData,
        initialBalance: "invalid-balance",
      };
      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.message).to.equal(
          "Invalid money format. Use format like 12.398,90",
        );
      }
    });

    it("should not be able to create a user with an wrong initial balance format", async () => {
      const invalidUserData = {
        ...userData,
        initialBalance: "10.00,00",
      };

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.message).to.equal(
          "Invalid money format. Use format like 12.398,90",
        );
      }
    });
  });

  describe("when a user is created", () => {
    it("should create a user with a valid email, name and password", async () => {
      const result = await createUserUseCase.execute(userData);
      const userInDatabase = inMemoryDatabase[0];
      const walletInDatabase = inMemoryWallets[0];

      checkUser(result, userInDatabase!);
      checkWallet(result.wallet, walletInDatabase!);
      expect(userInDatabase!.password).to.be.a("string");
      expect(userInDatabase!.salt).to.be.a("string");
      expect(userInDatabase!.createdAt).to.be.a("date");
    });

    it("should not be able to create a user with an email already in use", async () => {
      try {
        await createUserUseCase.execute(userData);
        await createUserUseCase.execute(userData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ConflictError);
        expect(error.message).to.equal("User with this email already exists");
      }
    });
  });
});
