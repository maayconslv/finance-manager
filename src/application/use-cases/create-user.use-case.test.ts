import { expect } from "chai";
import { CreateUserUseCase } from "./create-user.use-case";
import { UserInMemoryRepository } from "@/infrastructure/database";
import { ContainerInstance } from "typedi";
import { faker } from "@faker-js/faker";
import { ConflictError, ValidationError } from "@/domain/errors";
import { CreateUserRequest } from "@/application/dto";


describe("Application - Create a new user - Use cases", () => {
  let testContainer: ContainerInstance;
  let createUserUseCase: CreateUserUseCase;

  const userData: CreateUserRequest = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
  }

  beforeEach(() => {
    testContainer = new ContainerInstance('test-container');
    testContainer.set('UserRepository', new UserInMemoryRepository());

    createUserUseCase = new CreateUserUseCase(testContainer.get('UserRepository'));
  });

  afterEach(() => {
    testContainer.reset();
  })

  describe("validating user data", () => {
    it("should not be able to create a user with an invalid email", async () => {
      const invalidUserData = {
        ...userData,
        email: '',
      }

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ValidationError);
        expect(error.message).to.equal('This field is required');
      }
    })

    it("should not be able to create a user with an invalid name", async () => {
      const invalidUserData = {
        ...userData,
        name: '',
      }

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ValidationError);
        expect(error.message).to.equal('This field is required');
      }
    })

    it("should not be able to create a user with an invalid password", async () => {
      const invalidUserData = {
        ...userData,
        password: '123',
      }

      try {
        await createUserUseCase.execute(invalidUserData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ValidationError);
        expect(error.message).to.equal('Password must be at least 6 characters long');
      }
    })
  });

  describe("when a user is created", () => {
    it("should create a user with a valid email, name and password", async () => {
      const result = await createUserUseCase.execute(userData);
  
      expect(result).to.have.property("id").to.be.and.string;
      expect(result.email).to.equal(userData.email);
      expect(result.name).to.equal(userData.name);
      expect(result).to.not.have.property("password");
    })

    it("should not be able to create a user with an email already in use", async () => {
      try {
        await createUserUseCase.execute(userData);
        await createUserUseCase.execute(userData);
      } catch (error: any) {
        expect(error).to.be.an.instanceOf(ConflictError);
        expect(error.message).to.equal('User with this email already exists');
      }
    })
  })
});
