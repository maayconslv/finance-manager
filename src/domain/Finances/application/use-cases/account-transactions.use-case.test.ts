import Container, { ContainerInstance } from "typedi";
import { AccountTransactionsUseCase } from "./account-transactions.use-case";
import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { BankAccountRepository, TransactionRepository } from "@/infrastructure/database/prisma";
import { BankAccountInMemoryRepository, TransactionInMemoryRepository } from "@/infrastructure/database/in-memory";
import { CategoryEntity, TransactionEntity } from "../../enterprise";
import { createTransaction, createBankAccount, createUser, createWallet } from "@/test/seed.test";
import { UniqueEntityId } from "@/core/object-values";
import { expect } from "chai";

describe("Application - Account transactions - Use cases", () => {
  let testContainer: ContainerInstance;
  let user: UserEntity;
  let wallet: WalletEntity;
  let bankAccount: BankAccountEntity;
  let transactions: TransactionEntity[];
  let sut: AccountTransactionsUseCase;

  const inMemoryBankAccounts: BankAccountEntity[] = [];
  const inMemoryTransactions: TransactionEntity[] = [];
  const inMemoryWallets: WalletEntity[] = [];
  const inMemoryUsers: UserEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");

    testContainer.set(
      TransactionRepository,
      new TransactionInMemoryRepository(inMemoryTransactions, inMemoryWallets, inMemoryBankAccounts, inMemoryUsers),
    );
    testContainer.set(BankAccountRepository, new BankAccountInMemoryRepository(inMemoryBankAccounts, inMemoryWallets));

    sut = testContainer.get(AccountTransactionsUseCase);
  });

  beforeEach(async () => {
    user = await createUser();
    wallet = await createWallet({ userId: user.id });
    bankAccount = createBankAccount({ walletId: new UniqueEntityId(wallet.id) });
    const category = CategoryEntity.create({
      colorCode: "C1C1C1",
      name: "trabalho",
      userId: new UniqueEntityId(user.id),
    });

    transactions = await Promise.all([
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 0, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 0, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 0, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 0, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 1, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 2, 1),
      }),
      createTransaction({
        bankAccountId: new UniqueEntityId(bankAccount.id),
        category,
        createdAt: new Date(2025, 2, 1),
      }),
    ]);

    inMemoryBankAccounts.push(bankAccount);
    inMemoryWallets.push(wallet);
    inMemoryTransactions.push(...transactions);
    inMemoryUsers.push(user);
  });

  it("should be able to get transactions", async () => {
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result = await sut.execute({
      bankAccountId: bankAccount.id,
      userId: user.id,
      page: 1,
      limit: 100,
      month: 2,
      year: 2025,
    });

    expect(result.account.id).to.be.equal(bankAccount.id);
    expect(result.account.bankName).to.be.equal(bankAccount.bankName);
    expect(result.account.accountName).to.be.equal(bankAccount.accountName);
    expect(result.account.currentBalance).to.be.equal(bankAccount.currentBalance.toBRL());
    expect(result.account.initialBalance).to.be.equal(bankAccount.initialBalance.toBRL());
    expect(result.account.isDisable).to.be.equal(bankAccount.isDisable);
    expect(result.transactions).to.have.lengthOf(12);
    expect(result.hasMoreAfter).to.be.false;
    expect(result.hasMoreBefore).to.be.false;
    result.transactions.forEach((transaction, index) => {
      expect(transaction.amount).to.be.equal(transactions[index]!.amount.toBRL());
      expect(transaction.description).to.be.equal(transactions[index]!.description);
      expect(transaction.id).to.be.equal(transactions[index]!.id);
      expect(transaction.type).to.be.equal(transactions[index]!.type);
      expect(transaction.category.id).to.be.equal(transactions[index]!.category.id);
      expect(transaction.category.name).to.be.equal(transactions[index]!.category.name);
      expect(transaction.category.colorCode).to.be.equal(transactions[index]!.category.colorCode);
    });
  });

  describe("during error", () => {
    it("should return error if the bank account is not registred in database", async () => {
      try {
        await sut.execute({ bankAccountId: "invalid-id", limit: 10, page: 1, userId: user.id, month: 5, year: 5 });
      } catch (error: any) {
        expect(error.message).to.be.equal("This bank account was not found. Please, contact the support.");
        expect(error.statusCode).to.be.equal(500);
        expect(error.errorType).to.be.equal("INTERNAL_SERVER");
      }
    });

    it("should return error if the user is not registred in database", async () => {
      try {
        await sut.execute({
          bankAccountId: bankAccount.id,
          limit: 10,
          page: 1,
          userId: "invalid-id",
          month: 5,
          year: 5,
        });
      } catch (error: any) {
        expect(error.message).to.be.equal("This bank account was not found. Please, contact the support.");
        expect(error.statusCode).to.be.equal(500);
        expect(error.errorType).to.be.equal("INTERNAL_SERVER");
      }
    });

    it("should return error if the user is not related with the bank account", async () => {
      const bankAccountWithoutRelationship = createBankAccount({});

      try {
        await sut.execute({
          bankAccountId: bankAccountWithoutRelationship.id,
          limit: 10,
          page: 1,
          userId: user.id,
          month: 5,
          year: 5,
        });
      } catch (error: any) {
        expect(error.message).to.be.equal("This bank account was not found. Please, contact the support.");
        expect(error.statusCode).to.be.equal(500);
        expect(error.errorType).to.be.equal("INTERNAL_SERVER");
      }
    });
  });

  describe("pagination", async () => {
    it("should be able to get transations in page 1", async () => {
      transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const result = await sut.execute({
        bankAccountId: bankAccount.id,
        userId: user.id,
        page: 1,
        limit: 5,
        month: 2,
        year: 2025,
      });

      expect(result.hasMoreAfter).to.be.true;
      expect(result.hasMoreBefore).to.be.false;
    });

    it("should be able to get transations in page 2", async () => {
      transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const result = await sut.execute({
        bankAccountId: bankAccount.id,
        userId: user.id,
        page: 2,
        limit: 5,
        month: 2,
        year: 2025,
      });

      expect(result.hasMoreAfter).to.be.true;
      expect(result.hasMoreBefore).to.be.true;
    });
  });
});
