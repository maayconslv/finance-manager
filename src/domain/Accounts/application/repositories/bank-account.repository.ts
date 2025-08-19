import { BankAccountEntity } from "../../enterprise";

export interface IBankAccountRepository {
  save(bankAccount: BankAccountEntity): Promise<void>;
  findManyByWalletId(walletId: string): Promise<BankAccountEntity[]>;
}
