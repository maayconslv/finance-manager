import { IBankAccountRepository } from "@/domain/Accounts/application/repositories";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { WalletEntity } from "@/domain/Auth/enterprise/entities";

export class BankAccountInMemoryRepository implements IBankAccountRepository {
  constructor(private bankAccounts: BankAccountEntity[], private wallets?: WalletEntity[]) {}

  async save(bankAccount: BankAccountEntity): Promise<void> {
    const index = this.bankAccounts.findIndex((item) => item.id === bankAccount.id);
    if (index !== -1) {
      this.bankAccounts[index] = bankAccount;
    } else {
      this.bankAccounts.push(bankAccount);
    }
  }

  async findManyByWalletId(walletId: string): Promise<BankAccountEntity[]> {
    return this.bankAccounts
      .filter((item) => item.walletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(bankAccountId: string): Promise<BankAccountEntity | null> {
    const bankAccount = this.bankAccounts.find((account) => account.id === bankAccountId);
    if (!bankAccount) {
      return null;
    }

    return bankAccount;
  }

  async belongsToUser(bankAccountId: string, userId: string): Promise<boolean> {
    const bankAccount = this.bankAccounts.find((a) => a.id === bankAccountId);
    if (!bankAccount) {
      return false;
    };

    const wallet = this.wallets?.find((item) => item.id === bankAccount.walletId);
    if(!wallet || wallet.userId !== userId) {
      return false;
    }

    return true;
  }
}
