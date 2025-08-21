import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import Container, { ContainerInstance } from "typedi";
import { BankAccountEntity } from "../../enterprise";
import { DeleteAccountUseCase } from "./delete-account.use-case";
import { BankAccountRepository, UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { BankAccountInMemoryRepository, UserInMemoryRepository, WalletInMemoryRepository } from "@/infrastructure/database/in-memory";
import { createBankAccount, createUser, createWallet } from "@/test/seed.test";
import { UniqueEntityId } from "@/core/object-values";
import { expect } from "chai";

describe("Application - Delete bank account - Use case", () => {
  let testContainer: ContainerInstance;
    let user: UserEntity;
    let wallet: WalletEntity;
    let bankAccount: BankAccountEntity;
    let sut: DeleteAccountUseCase;
  
    const inMemoryUsers: UserEntity[] = [];
    const inMemoryWallets: WalletEntity[] = [];
    const inMemoryBankAccounts: BankAccountEntity[] = [];
  
    before(() => {
      testContainer = Container.of("test-container");
  
      testContainer.set(WalletRepository, new WalletInMemoryRepository(inMemoryWallets));
      testContainer.set(UserRepository, new UserInMemoryRepository(inMemoryUsers));
      testContainer.set(BankAccountRepository, new BankAccountInMemoryRepository(inMemoryBankAccounts, inMemoryWallets));
  
      sut = testContainer.get(DeleteAccountUseCase);
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

    it("should be able to disable a bank account correctly", async () => {
      const result = await sut.execute({ bankAccountId: bankAccount.id, userId: user.id });

      expect(result.message).to.be.equal("The bank account was successfully disabled.")
      expect(inMemoryBankAccounts[0]!.isDisable).to.be.true
      expect(inMemoryBankAccounts[0]!.updatedAt).to.be.not.null;
    })

    it("should return internal server error if the user were not found", async () => {
      try {
        await sut.execute({ bankAccountId: bankAccount.id, userId: 'invalid-id' });
      } catch (error: any) {
        expect(error.message).to.be.equal("The user or the bank account were not found. Please contact support.")
        expect(error.statusCode).to.be.equal(500)
        expect(error.errorType).to.be.equal("INTERNAL_SERVER")
      }
    })

    it("should return internal server error if the bank account were not found", async () => {
      try {
        await sut.execute({ bankAccountId: 'invalid-id', userId: user.id });
      } catch (error: any) {
        expect(error.message).to.be.equal("The user or the bank account were not found. Please contact support.")
        expect(error.statusCode).to.be.equal(500)
        expect(error.errorType).to.be.equal("INTERNAL_SERVER")
      }
    })

    it("should return unauthorized error if the user don't have permission to delete the account", async () => {
      const bankAccountWithoutUser = createBankAccount({})
      inMemoryBankAccounts.push(bankAccountWithoutUser);
      
      try {
        await sut.execute({ bankAccountId: bankAccountWithoutUser.id, userId: user.id });
      } catch (error: any) {
        expect(error.message).to.be.equal("You don't have permission to disable this account.")
        expect(error.statusCode).to.be.equal(401)
        expect(error.errorType).to.be.equal("UNAUTHORIZED")
      }
    })
    
})