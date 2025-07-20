import { expect } from "chai";
import { CreateUserUseCase } from "./create-user.use-case";
import { UserInMemoryRepository } from "@/infrastructure/database";
import { ContainerInstance } from "typedi";
import { faker } from "@faker-js/faker";
import { ConflictError, ValidationError } from "@/domain/errors";
import { UserEntity } from "@/domain/entities";
import { CryptoService } from "@/domain/services/crypto.service";
import { checkUser } from "@/test/checker.test";

describe("Application - Create a new user - Use cases", () => {
  let testContainer: ContainerInstance;
  let createUserUseCase: CreateUserUseCase;
  const inMemoryDatabase: UserEntity[] = [];

  const userData = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    userPassword: faker.internet.password(),
  };

  before(() => {
    testContainer = new ContainerInstance("test-container");
    testContainer.set("UserRepository", new UserInMemoryRepository(inMemoryDatabase));

    createUserUseCase = new CreateUserUseCase(testContainer.get("UserRepository"), new CryptoService());
  });

  beforeEach(() => {
    inMemoryDatabase.length = 0;
  });

  afterEach(() => {
    testContainer.reset();
  });

  describe("validating user data", () => {
    it("should not be able to create a user with an invalid email", async () => {
      const invalidUserData = {
        ...userData,
        email: "",
      };

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ValidationError);
        expect(error.message).to.equal("This field is required");
      }
    });

    it("should not be able to create a user with an invalid name", async () => {
      const invalidUserData = {
        ...userData,
        name: "",
      };

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ValidationError);
        expect(error.message).to.equal("This field is required");
      }
    });

    it("should not be able to create a user with an invalid password", async () => {
      const invalidUserData = {
        ...userData,
        password: "123",
      };

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ValidationError);
        expect(error.message).to.equal("Password must be at least 6 characters long");
      }
    });
  });

  describe("when a user is created", () => {
    it("should create a user with a valid email, name and password", async () => {
      const result = await createUserUseCase.execute(userData);
      const userInDatabase = inMemoryDatabase[0];

      checkUser(result, userInDatabase!);
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
