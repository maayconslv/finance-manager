import { expect } from "chai";
import { PrismaClient } from "@prisma/client";
import { RequestMaker, TestServer } from "@/test";
import { CreateUserRequest } from "@/application/dto";
import { UserModel } from "@/application/model";
import { faker } from "@faker-js/faker";

describe.only("Controller - Register a new user - POST", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;

  const userData: CreateUserRequest = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    userPassword: faker.internet.password(),
    initialBalance: "10.000,00",
  };

  before(() => {
    requestMaker = new RequestMaker();
    testServer = new TestServer();
    prismaRepository = new PrismaClient();
    testServer.start();
  });

  afterEach(async () => {
    await prismaRepository.wallet.deleteMany();
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  describe("validating user data", () => {
    it("should not be able to create a user with an invalid email", async () => {
      const invalidUserData = {
        ...userData,
        email: "invalid-email",
      };

      const response = await requestMaker.execute<UserModel>({
        method: "post",
        body: invalidUserData,
        path: "/users",
      });

      expect(response.body.errors).to.not.be.null;
      expect(response.body.errors.message).to.equal("Validation failed");
      expect(response.body.errors.details).to.not.be.empty;
      expect(response.body.errors.errorType).to.equal("VALIDATION_ERROR");
      expect(response.body.errors.statusCode).to.equal(400);
      expect(response.body.errors.details[0]).to.be.equal("Please provide a valid email address");
    });

    it("should not be able to create a user with an invalid name", async () => {
      const invalidUserData = {
        ...userData,
        name: 12312,
      };

      const response = await requestMaker.execute<UserModel>({
        method: "post",
        body: invalidUserData,
        path: "/users",
      });

      expect(response.body.errors).to.not.be.null;
      expect(response.body.errors.message).to.equal("Validation failed");
      expect(response.body.errors.details).to.not.be.empty;
      expect(response.body.errors.errorType).to.equal("VALIDATION_ERROR");
      expect(response.body.errors.statusCode).to.equal(400);
      expect(response.body.errors.details[0]).to.be.equal("Please provide a valid name");
    });

    it("should not be able to create a user with an invalid password", async () => {
      const invalidUserData = {
        ...userData,
        password: "123",
      };

      const response = await requestMaker.execute<UserModel>({
        method: "post",
        body: invalidUserData,
        path: "/users",
      });

      console.log("response: ", response);

      expect(response.body.errors).to.not.be.null;
      expect(response.body.errors.message).to.equal("Validation failed");
      expect(response.body.errors.details).to.not.be.empty;
      expect(response.body.errors.errorType).to.equal("VALIDATION_ERROR");
      expect(response.body.errors.statusCode).to.equal(400);
      expect(response.body.errors.details[0]).to.be.equal("Password must be at least 6 characters long");
    });
  });

  describe("saving in database", () => {
    it("should be able to create a new user", async () => {
      const response = await requestMaker.execute<UserModel>({
        method: "post",
        path: "/users",
        body: userData,
      });

      const userResponse = response.body.data;
      const userDatabase = await prismaRepository.user.findUniqueOrThrow({ where: { email: userData.email } });

      expect(userResponse.email).to.equal(userData.email);
      expect(userData.email).to.equal(userDatabase.email);
      expect(userResponse.name).to.equal(userData.name);
      expect(userData.name).to.equal(userDatabase.name);
      expect(userResponse.id).to.not.be.null;
      expect(userDatabase.id).to.not.be.equal(userResponse.id);
      expect(userDatabase.passwordHash).to.be.equal(userData.userPassword);
    });

    it("should not be able to create a new user with an email that already exists", async () => {
      await prismaRepository.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          passwordHash: userData.userPassword,
          salt: "salt",
        },
      });
      const response = await requestMaker.execute<UserModel>({
        method: "post",
        path: "/users",
        body: userData,
      });

      expect(response.body.errors).to.not.be.null;
      expect(response.body.errors.message).to.equal("User with this email already exists");
      expect(response.body.errors.errorType).to.equal("CONFLICT");
      expect(response.body.errors.statusCode).to.equal(409);
    });
  });
});
