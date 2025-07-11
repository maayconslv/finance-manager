import { expect } from "chai";
import { CreateUserRequest } from "../../domain/entities";
import { TestServer } from "../../test/server-test";
import { PrismaClient } from "@prisma/client";

describe("POST - Create User - E2E", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;

  before(() => {
    testServer = new TestServer();
    prismaRepository = new PrismaClient();
    testServer.start();
  });

  afterEach(async () => {
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  it("should be able to create a new user", async () => {
    const userData: CreateUserRequest = {
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    };

    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();
    const user = await prismaRepository.user.findMany();

    expect(responseData).to.not.be.null;
    expect(user).to.not.be.empty;
    expect(response.status).to.equal(201);
  });
});
