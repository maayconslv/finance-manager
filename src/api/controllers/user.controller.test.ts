import { expect } from "chai";
import { TestServer } from "../../test/server.test";
import { PrismaClient } from "@prisma/client";
import { RequestMaker } from "@/test";
import { CreateUserRequest } from "@/application/dto";
import { UserModel } from "@/application/model";

describe("POST - Create User - E2E", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;

  before(() => {
    requestMaker = new RequestMaker();
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

    const response = await requestMaker.execute<UserModel>({ method: 'post', path: '/users', body: userData });
    const user = await prismaRepository.user.findMany();

    expect(response.body.data).to.not.be.null;
    expect(user).to.not.be.empty;
  });
});
