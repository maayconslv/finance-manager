import { TransactionEntity } from "../../enterprise";

interface findManyByAccountRequest {
  bankAccountId: string;
  page: number;
  limit: number;
}

export interface ITransactionRepository {
  save(data: TransactionEntity): Promise<void>;
  findManyByAccount(data: findManyByAccountRequest): Promise<{ transactions: TransactionEntity[]; total: number }>;
  findById(transactionId: string): Promise<TransactionEntity | null>;
  findByIdAndUser(transactionId: string, userId: string): Promise<TransactionEntity | null>;
  belongsToUser(transactionId: string, userId: string): Promise<boolean>;
  delete(transactionId: string): Promise<void>;
}
