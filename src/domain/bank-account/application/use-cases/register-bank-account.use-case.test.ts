import { UserEntity, WalletEntity } from "@/domain/auth/enterprise/entities";
import { BankAccountEntity } from "../../enterprise";
import Container, { ContainerInstance } from "typedi";
import { UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { UserInMemoryRepository, WalletInMemoryRepository } from "@/infrastructure/database/in-memory";
import { RegisterBankAccountUseCase } from "./register-bank-account.use-case";
import { BankAccountRepository } from "@/infrastructure/database/prisma/bank-account.prisma.repository";
import { InMemoryBankAccountRepository } from "@/infrastructure/database/in-memory/in-memory-bank.in-memory.repository";
import { createUser, createWallet } from "@/test/seed.test";
import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { BadRequestError } from "@/domain/errors";

describe("Application - Register bank account - Use cases", () => {
  let testContainer: ContainerInstance;
  let user: UserEntity;
  let wallet: WalletEntity;
  let sut: RegisterBankAccountUseCase;

  const inMemoryUsers: UserEntity[] = [];
  const inMemoryWallets: WalletEntity[] = [];
  const inMemoryBankAccounts: BankAccountEntity[] = [];

  before(() => {
    testContainer = Container.of("test-container");

    testContainer.set(WalletRepository, new WalletInMemoryRepository(inMemoryWallets));
    testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
    testContainer.set(BankAccountRepository, new InMemoryBankAccountRepository(inMemoryBankAccounts));

    sut = testContainer.get(RegisterBankAccountUseCase);
  });

  beforeEach(async () => {
    user = await createUser();
    wallet = await createWallet({ userId: user.id });

    inMemoryWallets.push(wallet);
    inMemoryUsers.push(user);
  });

  it("should register a bank correctly", async () => {
    const result = await sut.execute({
      userId: user.id,
      bankName: faker.lorem.word(),
      accountName: faker.lorem.word(),
      amount: "10.000,00",
    });

    const initialBalanceInWallet = wallet.initialBalance.getInCents();
    const currentBalanceInWallet = wallet.currentBalance.getInCents();
    const initialBalanceInBankAccount = inMemoryBankAccounts[0]!.initialBalance.getInCents();
    expect(inMemoryBankAccounts).to.have.lengthOf(1);
    expect(inMemoryBankAccounts[0]?.accountName).to.be.equal(result.accountName);
    expect(inMemoryBankAccounts[0]?.id).to.be.equal(result.id);
    expect(inMemoryBankAccounts[0]?.name).to.be.equal(result.bankName);
    expect(inMemoryBankAccounts[0]?.walletId).to.be.equal(result.walletId);
    expect(inMemoryBankAccounts[0]?.initialBalance.toBRL()).to.be.equal(result.initialBalance);
    expect(inMemoryBankAccounts[0]?.currentBalance.toBRL()).to.be.equal(result.currentBalance);
    expect(currentBalanceInWallet).to.be.equal(initialBalanceInWallet + initialBalanceInBankAccount);
  });

  it("should return a internal server error if the wallet is not related with the user", async () => {
    wallet = await createWallet({ userId: "wrong-id" });

    try {
      await sut.execute({
        userId: user.id,
        bankName: faker.lorem.word(),
        accountName: faker.lorem.word(),
        amount: "10.000,00",
      });
    } catch (error: any) {
      expect(error).to.be.instanceOf(InternalServerError);
      expect(error.message).to.be.equal("This user does not have an associated wallet.");
    }
  });

  it("should return an error if is using invalid money format", async () => {
    try {
      await sut.execute({
        userId: user.id,
        bankName: faker.lorem.word(),
        accountName: faker.lorem.word(),
        amount: "10000", // invalid format
      });
    } catch (error: any) {
      expect(error).to.be.an.instanceOf(BadRequestError);
      expect(error.message).to.equal("Invalid money format. Use format like 12.398,90");
    }
  });
});
