import { IBankAccountRepository } from "@/domain/Accounts/application/repositories";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";

export class BankAccountInMemoryRepository implements IBankAccountRepository {
  constructor(private bankAccounts: BankAccountEntity[]) {}

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
}
