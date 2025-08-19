import { BankAccountEntity } from "../../enterprise";

export interface IBankAccountRepository {
  save(bankAccount: BankAccountEntity): Promise<void>;
  getMany(userId: string): Promise<BankAccountEntity[]>;
}
