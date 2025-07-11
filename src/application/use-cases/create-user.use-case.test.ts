import { expect } from "chai";
import { CreateUserUseCase } from "./create-user.use-case";
import { IUserRepository } from "../../domain/repositories";
import { CreateUserRequest } from "../../domain/entities";

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      create: async () => ({
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        password: "password123",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findByEmail: async () => null,
      findById: async () => null,
    };

    createUserUseCase = new CreateUserUseCase(mockUserRepository);
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
