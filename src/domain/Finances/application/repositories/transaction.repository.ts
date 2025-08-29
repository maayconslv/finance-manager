import { TransactionEntity } from "../../enterprise";

export interface ITransactionRepository {
  save(data: TransactionEntity): Promise<void>;
}
