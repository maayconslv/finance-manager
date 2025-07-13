import { expect } from "chai";
import { CreateUserUseCase } from "./create-user.use-case";
import { CreateUserRequest } from "../../domain/entities";
import { TestContainer } from "@/test";
import Container from "typedi";

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    TestContainer.register();
    createUserUseCase = Container.get(CreateUserUseCase);
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
