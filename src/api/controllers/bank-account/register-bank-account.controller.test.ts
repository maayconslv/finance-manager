import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { RequestMaker, TestServer } from "@/test";
import { PrismaClient } from "@prisma/client";
import { RegisterBankAccountRequest } from "./bank-account.dto";
import { createUser, createWallet } from "@/test/seed.test";
import { BankAccountModel } from "@/domain/Accounts/application/model";
import { expect } from "chai";
import jwt from "jsonwebtoken";

describe("Controller - Register bank account - POST", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;
  let userData: UserEntity;
  let walletData: WalletEntity;
  let registerBankAccountData: RegisterBankAccountRequest;
  let token: string;

  before(() => {
    requestMaker = new RequestMaker();
    testServer = new TestServer();
    prismaRepository = new PrismaClient();
    testServer.start();
  });

  beforeEach(async () => {
    userData = await createUser();
    walletData = await createWallet({ userId: userData.id });

    await prismaRepository.user.create({
      data: {
        id: userData.id.toString(),
        name: userData.name,
        email: userData.email.toString(),
        passwordHash: userData.password,
        salt: userData.salt,
      },
    });
    await prismaRepository.wallet.create({
      data: {
        id: walletData.id.toString(),
        currentBalance: walletData.currentBalance.getInCents(),
        initialBalance: walletData.initialBalance.getInCents(),
        userId: userData.id.toString(),
      },
    });

    registerBankAccountData = {
      bankName: "Banco do Brasil",
      accountName: "Conta Corrente",
      amount: "100,89",
    };

    token = jwt.sign({ userId: userData.id }, process.env["JWT_SECRET"]!);
  });

  afterEach(async () => {
    await prismaRepository.bankAccount.deleteMany();
    await prismaRepository.wallet.deleteMany();
    await prismaRepository.user.deleteMany();
  });

  after(() => {
    testServer.stop();
  });

  it("should register a bank account", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "post",
      body: registerBankAccountData,
      path: "/bank-account",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bankAccountData = await prismaRepository.bankAccount.findFirst();
    const bankAccountResponse = response.body.data;
    expect(bankAccountResponse.id).to.be.equal(bankAccountData?.id);
    expect(bankAccountResponse.bankName).to.be.equal(registerBankAccountData.bankName);
    expect(bankAccountResponse.accountName).to.be.equal(registerBankAccountData.accountName);
    expect(bankAccountResponse.currentBalance.replace("R$ ", "")).to.be.equal(registerBankAccountData.amount);
    expect(bankAccountResponse.initialBalance.replace("R$ ", "")).to.be.equal(registerBankAccountData.amount);
  });

  it("should not be able to register a bank account with a invalid format for amount", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "post",
      body: { ...registerBankAccountData, amount: "100,890" },
      path: `/bank-account`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bankAccountData = await prismaRepository.bankAccount.findMany();
    expect(response.body.errors.message).to.be.equal("Invalid money format. Use format like 12.398,90");
    expect(response.body.errors.errorType).to.be.equal("BAD_REQUEST");
    expect(response.body.errors.statusCode).to.be.equal(400);
    expect(bankAccountData).to.be.empty;
  });

  it("should return a unauthorized error if the user is using a invalid token", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "post",
      body: registerBankAccountData,
      path: "/bank-account",
      headers: {
        Authorization: `Bearer invalid-token`,
      },
    });

    expect(response.body.errors.message).to.be.equal("Invalid token");
    expect(response.body.errors.errorType).to.be.equal("UNAUTHORIZED");
    expect(response.body.errors.statusCode).to.be.equal(401);
  });
});
