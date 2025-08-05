import { IBankAccountRepository } from "@/domain/bank-account/application/repositories";
import { BankAccountEntity } from "@/domain/bank-account/enterprise";

export class InMemoryBankAccountRepository implements IBankAccountRepository {
  constructor(private bankAccounts: BankAccountEntity[]) {}

  async save(bankAccount: BankAccountEntity): Promise<void> {
    const index = this.bankAccounts.findIndex((item) => item.id === bankAccount.id);
    if (index !== -1) {
      this.bankAccounts[index] = bankAccount;
    } else {
      this.bankAccounts.push(bankAccount);
    }
  }
}
