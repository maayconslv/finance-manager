import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import Container, { ContainerInstance } from "typedi";
import { UpdateAccountUseCase } from "./update-account.use-case";
import { BankAccountEntity } from "../../enterprise";
import { BankAccountRepository, UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import {
  BankAccountInMemoryRepository,
  UserInMemoryRepository,
  WalletInMemoryRepository,
} from "@/infrastructure/database/in-memory";
import { createBankAccount, createUser, createWallet } from "@/test/seed.test";
import { UniqueEntityId } from "@/core/object-values";
import { expect } from "chai";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { UnauthorizedError } from "@/domain/errors";

describe("Application - Update bank account - Use cases", () => {
  let testContainer: ContainerInstance;
  let user: UserEntity;
  let wallet: WalletEntity;
  let bankAccount: BankAccountEntity;
  let sut: UpdateAccountUseCase;

  const inMemoryUsers: UserEntity[] = [];
  const inMemoryWallets: WalletEntity[] = [];
  const inMemoryBankAccounts: BankAccountEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");

    testContainer.set(WalletRepository, new WalletInMemoryRepository(inMemoryWallets));
    testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
    testContainer.set(BankAccountRepository, new BankAccountInMemoryRepository(inMemoryBankAccounts));

    sut = testContainer.get(UpdateAccountUseCase);
  });

  beforeEach(async () => {
    user = await createUser();
    wallet = await createWallet({ userId: user.id });
    bankAccount = createBankAccount({ walletId: new UniqueEntityId(wallet.id) });

    inMemoryWallets.push(wallet);
    inMemoryUsers.push(user);
    inMemoryBankAccounts.push(bankAccount);
  });

  afterEach(() => {
    inMemoryUsers.length = 0;
    inMemoryWallets.length = 0;
    inMemoryBankAccounts.length = 0;
  });

  after(() => {
    testContainer.reset();
  });

  it("should be able to update a bank account correctly", async () => {
    const result = await sut.execute({
      userId: user.id,
      bankAccountId: bankAccount.id,
      accountName: "New account name",
      bankName: "New bank name",
    });

    const bankAccountAfterUpdate = inMemoryBankAccounts[0];
    expect(result).to.be.deep.equal({
      id: bankAccountAfterUpdate!.id,
      accountName: bankAccountAfterUpdate!.accountName,
      bankName: bankAccountAfterUpdate!.bankName,
      initialBalance: bankAccountAfterUpdate!.initialBalance.toBRL(),
      currentBalance: bankAccountAfterUpdate!.currentBalance.toBRL(),
      isDisabled: bankAccountAfterUpdate!.isDisable
    });
    expect(bankAccountAfterUpdate!.accountName).to.be.equal("New account name");
    expect(bankAccountAfterUpdate!.bankName).to.be.equal("New bank name");
  });

  it("should be ble to update a bank account sending only bank name", async () => {
    const bankAccountBeforeUpdate = bankAccount;

    const result = await sut.execute({
      userId: user.id,
      bankAccountId: bankAccount.id,
      bankName: "New bank name",
    });

    const bankAccountAfterUpdate = inMemoryBankAccounts[0];
    expect(result).to.be.deep.equal({
      id: bankAccountAfterUpdate!.id,
      accountName: bankAccountAfterUpdate!.accountName,
      bankName: bankAccountAfterUpdate!.bankName,
      initialBalance: bankAccountAfterUpdate!.initialBalance.toBRL(),
      currentBalance: bankAccountAfterUpdate!.currentBalance.toBRL(),
      isDisabled: bankAccountAfterUpdate!.isDisable
    });
    expect(bankAccountAfterUpdate!.accountName).to.be.equal(bankAccountBeforeUpdate.accountName);
    expect(bankAccountAfterUpdate!.bankName).to.be.equal("New bank name");
  });

  it("should be ble to update a bank account sending only account name", async () => {
    const bankAccountBeforeUpdate = bankAccount;

    const result = await sut.execute({
      userId: user.id,
      bankAccountId: bankAccount.id,
      accountName: "New account name",
    });

    const bankAccountAfterUpdate = inMemoryBankAccounts[0];
    expect(result).to.be.deep.equal({
      id: bankAccountAfterUpdate!.id,
      accountName: bankAccountAfterUpdate!.accountName,
      bankName: bankAccountAfterUpdate!.bankName,
      initialBalance: bankAccountAfterUpdate!.initialBalance.toBRL(),
      currentBalance: bankAccountAfterUpdate!.currentBalance.toBRL(),
      isDisabled: bankAccountAfterUpdate!.isDisable
    });
    expect(bankAccountAfterUpdate!.bankName).to.be.equal(bankAccountBeforeUpdate.bankName);
    expect(bankAccountAfterUpdate!.accountName).to.be.equal("New account name");
  });

  it("should return an error if the userId does not saved in database", async () => {
    try {
      await sut.execute({
        userId: "invalid-id",
        bankAccountId: bankAccount.id,
        accountName: "New account name",
        bankName: "New bank name",
      });
    } catch (error: any) {
      expect(error).to.be.instanceOf(InternalServerError);
      expect(error.message).to.be.equal("The user or the bank account were not found. Please contact support.");
      expect(error.statusCode).to.be.equal(500);
      expect(error.errorType).to.be.equal("INTERNAL_SERVER");
    }
  });

  it("should return an error if the walletId does not saved in database", async () => {
    try {
      await sut.execute({
        userId: user.id,
        bankAccountId: "invalid-id",
        accountName: "New account name",
        bankName: "New bank name",
      });
    } catch (error: any) {
      expect(error).to.be.instanceOf(InternalServerError);
      expect(error.message).to.be.equal("The user or the bank account were not found. Please contact support.");
      expect(error.statusCode).to.be.equal(500);
      expect(error.errorType).to.be.equal("INTERNAL_SERVER");
    }
  });

  it("should return an error if the bank account was disabled", async () => {
    const disabledBankAccount = createBankAccount({ deletedAt: new Date(), walletId: new UniqueEntityId(wallet.id) });
    inMemoryBankAccounts.push(disabledBankAccount)

    try {
      await sut.execute({
        userId: user.id,
        bankAccountId: disabledBankAccount.id,
        accountName: "New account name",
        bankName: "New bank name",
      });
    } catch (error: any) {
      expect(error).to.be.instanceOf(UnauthorizedError);
      expect(error.message).to.be.equal("This bank account was disabled.");
      expect(error.statusCode).to.be.equal(401);
      expect(error.errorType).to.be.equal("UNAUTHORIZED");
    }
  });
});
