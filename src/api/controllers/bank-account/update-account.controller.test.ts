import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { RequestMaker, TestServer } from "@/test";
import { PrismaClient } from "@prisma/client";
import { UpdateBankAccountRequest } from "./bank-account.dto";
import jwt from "jsonwebtoken";
import { createBankAccount, createUser, createWallet } from "@/test/seed.test";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { Money, UniqueEntityId } from "@/core/object-values";
import { BankAccountModel } from "@/domain/Accounts/application/model";
import { expect } from "chai";

describe("Controller - Update bank account - POST", () => {
  let testServer: TestServer;
  let prismaRepository: PrismaClient;
  let requestMaker: RequestMaker;
  let userData: UserEntity;
  let walletData: WalletEntity;
  let bankAccountData: BankAccountEntity;
  let updateBankAccountRequest: UpdateBankAccountRequest;
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
    bankAccountData = createBankAccount({ walletId: new UniqueEntityId(walletData.id) });

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
    await prismaRepository.bankAccount.create({
      data: {
        id: bankAccountData.id,
        accountName: bankAccountData.accountName,
        bankName: bankAccountData.bankName,
        currentBalance: bankAccountData.currentBalance.getInCents(),
        initialBalance: bankAccountData.initialBalance.getInCents(),
        walletId: walletData.id,
        createdAt: bankAccountData.createdAt,
      },
    });

    updateBankAccountRequest = {
      bankName: "Banco do Brasil",
      accountName: "Conta Corrente",
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

  it("should be able to update a bank account correctly", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "put",
      body: updateBankAccountRequest,
      path: `/accounts/${bankAccountData.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bankAccountAfterUpdate = await prismaRepository.bankAccount.findFirstOrThrow();
    expect(response.body.data).to.be.deep.equal({
      id: bankAccountAfterUpdate.id,
      accountName: bankAccountAfterUpdate.accountName,
      bankName: bankAccountAfterUpdate.bankName,
      initialBalance: Money.fromCents(bankAccountAfterUpdate.initialBalance).toBRL(),
      currentBalance: Money.fromCents(bankAccountAfterUpdate.currentBalance).toBRL(),
    });
    expect(bankAccountAfterUpdate.accountName).to.be.equal(updateBankAccountRequest.accountName);
    expect(bankAccountAfterUpdate.bankName).to.be.equal(updateBankAccountRequest.bankName);
  });

  it("should be ble to update a bank account sending only account name", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "put",
      body: { accountName: 'new account name' },
      path: `/accounts/${bankAccountData.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bankAccountAfterUpdate = await prismaRepository.bankAccount.findFirstOrThrow();
    expect(response.body.data).to.be.deep.equal({
      id: bankAccountAfterUpdate.id,
      accountName: bankAccountAfterUpdate.accountName,
      bankName: bankAccountAfterUpdate.bankName,
      initialBalance: Money.fromCents(bankAccountAfterUpdate.initialBalance).toBRL(),
      currentBalance: Money.fromCents(bankAccountAfterUpdate.currentBalance).toBRL(),
    });
    expect(bankAccountAfterUpdate.accountName).to.be.equal('new account name');
  });

  it("should be ble to update a bank account sending only bank name", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "put",
      body: { bankName: 'new bank name' },
      path: `/accounts/${bankAccountData.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bankAccountAfterUpdate = await prismaRepository.bankAccount.findFirstOrThrow();
    expect(response.body.data).to.be.deep.equal({
      id: bankAccountAfterUpdate.id,
      accountName: bankAccountAfterUpdate.accountName,
      bankName: bankAccountAfterUpdate.bankName,
      initialBalance: Money.fromCents(bankAccountAfterUpdate.initialBalance).toBRL(),
      currentBalance: Money.fromCents(bankAccountAfterUpdate.currentBalance).toBRL(),
    });
    expect(bankAccountAfterUpdate.bankName).to.be.equal('new bank name');
  });

  it("should return unauthorized error if the user is using a invalid id", async () => {
    const response = await requestMaker.execute<BankAccountModel>({
      method: "put",
      body: { accountName: 'new account name' },
      path: `/accounts/${bankAccountData.id}`,
      headers: {
        Authorization: `Bearer invalid-id`,
      },
    });

    expect(response.body.errors.message).to.be.equal("Invalid token");
    expect(response.body.errors.errorType).to.be.equal("UNAUTHORIZED");
    expect(response.body.errors.statusCode).to.be.equal(401);
  });
});
