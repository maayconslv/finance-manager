import { expect } from "chai";
import { CreateUserUseCase } from "./create-user.use-case";
import { CreateUserRequest } from "../../domain/entities";
import { UserInMemoryRepository } from "@/infrastructure/database";
import { ContainerInstance } from "typedi";

describe("CreateUserUseCase", () => {
  let testContainer: ContainerInstance;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    testContainer = new ContainerInstance('test-container');
    testContainer.set('UserRepository', new UserInMemoryRepository());

    createUserUseCase = new CreateUserUseCase(testContainer.get('UserRepository'));
  });

  it("should create a user with valid data", async () => {
    const userData: CreateUserRequest = {
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    };

    const result = await createUserUseCase.execute(userData);

    expect(result).to.have.property("id");
    expect(result.email).to.equal(userData.email);
    expect(result.name).to.equal(userData.name);
    expect(result).to.not.have.property("password");
  });
});
