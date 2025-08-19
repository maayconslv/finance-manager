import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import Container, { ContainerInstance } from "typedi";
import { GetAccountsUseCase } from "./get-accounts.use-case";
import { BankAccountEntity } from "../../enterprise";
import { BankAccountRepository, UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { BankAccountInMemoryRepository, UserInMemoryRepository, WalletInMemoryRepository } from "@/infrastructure/database/in-memory";
import { createBankAccount, createUser, createWallet } from "@/test/seed.test";
import { Money, UniqueEntityId } from "@/core/object-values";
import { expect } from "chai";

describe("Application - Get accounts - Use case", () => {
  let testContainer: ContainerInstance;
  let user: UserEntity;
  let walletData: WalletEntity;
  let bankAccountsData: BankAccountEntity[];
  let sut: GetAccountsUseCase;

  const inMemoryUsers: UserEntity[] = [];
  const inMemoryWallets: WalletEntity[] = [];
  let inMemoryBankAccounts: BankAccountEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");

    testContainer.set(WalletRepository, new WalletInMemoryRepository(inMemoryWallets));
    testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
    testContainer.set(BankAccountRepository, new BankAccountInMemoryRepository(inMemoryBankAccounts));

    sut = testContainer.get(GetAccountsUseCase);
  });

  beforeEach(async () => {
    user = await createUser();
    walletData = await createWallet({ userId: user.id });
    bankAccountsData = [
      createBankAccount({ walletId: new UniqueEntityId(walletData.id) }),
      createBankAccount({ walletId: new UniqueEntityId(walletData.id) }),
      createBankAccount({ walletId: new UniqueEntityId(walletData.id) }),
      createBankAccount({ walletId: new UniqueEntityId(walletData.id) }),
    ]

    inMemoryBankAccounts.push(...bankAccountsData);
    inMemoryWallets.push(walletData);
    inMemoryUsers.push(user);
  });

  afterEach(() => {
    inMemoryBankAccounts.length = 0;
    inMemoryUsers.length = 0;
    inMemoryWallets.length = 0;
  })

  it("should be able to get all user accounts correctly", async () => {
    const { bankAccounts, totalAmount, wallet } = await sut.execute({ userId: user.id })

    const bankTotalAmount = bankAccountsData.reduce((acc, account) => acc + account.currentBalance.getInCents(), 0)
    const walletTotalAmount = walletData.currentBalance.getInCents();
    const totalAmountData = Money.fromCents(bankTotalAmount + walletTotalAmount);
    expect(totalAmountData.toBRL()).to.be.equal(totalAmount);
    expect(bankAccounts).to.have.lengthOf(inMemoryBankAccounts.length);
    bankAccounts.forEach((item, index) => {
      expect(item.id).to.be.equal(bankAccounts[index]!.id);
      expect(item.accountName).to.be.equal(bankAccounts[index]!.accountName);
      expect(item.bankName).to.be.equal(bankAccounts[index]!.bankName);
      expect(item.currentBalance).to.be.equal(bankAccounts[index]!.currentBalance);
      expect(item.initialBalance).to.be.equal(bankAccounts[index]!.initialBalance);
    });
    expect(wallet.id).to.be.equal(walletData.id);
    expect(wallet.currentBalance).to.be.equal(walletData.currentBalance.toBRL());
    expect(wallet.userId).to.be.equal(wallet.userId);
  })

  it("should not be able to get users account if the user does not exist in database", async () => {
    try {
      await sut.execute({ userId: 'invalid-id' })
    } catch (error: any) {
      expect(error.message).to.be.equal("User not found");
      expect(error.statusCode).to.be.equal(404);
      expect(error.errorType).to.be.equal("NOT_FOUND")
    }
  })

  it("should not be able to get users account if the user does not have a wallet", async () => {
    const userWithoutWallet = await createUser({})
    inMemoryUsers.push(userWithoutWallet)
    
    try {
      await sut.execute({ userId: userWithoutWallet.id })
    } catch (error: any) {
      expect(error.message).to.be.equal("Wallet not found");
      expect(error.statusCode).to.be.equal(404);
      expect(error.errorType).to.be.equal("NOT_FOUND")
    }
  })
});
