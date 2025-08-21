import { BankAccountEntity } from "../../enterprise";

export interface IBankAccountRepository {
  save(bankAccount: BankAccountEntity): Promise<void>;
  findManyByWalletId(walletId: string): Promise<BankAccountEntity[]>;
  findById(bankAccountId: string): Promise<BankAccountEntity | null>;
  belongsToUser(bankAccountId: string, userId: string): Promise<boolean>;
}
