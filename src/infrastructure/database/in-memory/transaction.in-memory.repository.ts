import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { ITransactionRepository } from "@/domain/Finances/application/repositories";
import { TransactionEntity } from "@/domain/Finances/enterprise";

interface findManyByAccountRequest {
  bankAccountId: string;
  page: number;
  limit: number;
  startDate: Date;
  endDate: Date;
}

export class TransactionInMemoryRepository implements ITransactionRepository {
  constructor(
    private transactions: TransactionEntity[],
    private wallets?: WalletEntity[],
    private bankAccounts?: BankAccountEntity[],
    private users?: UserEntity[],
  ) {}

  async belongsToUser(transactionId: string, userId: string): Promise<boolean> {
    const transaction = this.transactions.find((item) => item.id === transactionId);
    if (!transaction) {
      return false;
    }

    const bankAccount = this.bankAccounts?.find((item) => item.id === transaction.bankAccountId);
    if (!bankAccount) {
      return false;
    }

    const wallet = this.wallets?.find((item) => item.id === bankAccount.walletId);
    if (!wallet) {
      return false;
    }
    const user = this.users?.find((item) => item.id === wallet.userId);
    if (!user) {
      return false;
    }

    if (user.id !== userId) {
      return false;
    }

    return true;
  }
  async delete(transactionId: string): Promise<void> {
    const index = this.transactions.findIndex((item) => item.id === transactionId);
    if (index === -1) {
      return;
    }

    this.transactions.slice(index, 1);
  }
  async findById(transactionId: string): Promise<TransactionEntity | null> {
    const transaction = this.transactions.find((item) => item.id === transactionId);

    return transaction ? transaction : null;
  }

  async findByIdAndUser(transactionId: string, userId: string): Promise<TransactionEntity | null> {
    const transaction = this.transactions.find((item) => item.id === transactionId);
    if (!transaction) {
      return null;
    }

    const bankAccount = this.bankAccounts?.find((item) => item.id === transaction.bankAccountId);
    if (!bankAccount) {
      return null;
    }

    const wallet = this.wallets?.find((item) => item.id === bankAccount.walletId);
    if (!wallet) {
      return null;
    }
    const user = this.users?.find((item) => item.id === wallet.userId);
    if (!user) {
      return null;
    }

    if (user.id !== userId) {
      return null;
    }

    return transaction;
  }
  async findManyByAccount(
    data: findManyByAccountRequest,
  ): Promise<{ transactions: TransactionEntity[]; total: number }> {
    const { bankAccountId, page, limit, startDate, endDate } = data;

    let transactions = this.transactions.filter((transaction) => transaction.bankAccountId === bankAccountId);

    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter((transaction) => new Date(transaction.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      transactions = transactions.filter((transaction) => new Date(transaction.createdAt) <= end);
    }

    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const offset = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    return {
      total: transactions.length,
      transactions: paginatedTransactions,
    };
  }
  async save(data: TransactionEntity): Promise<void> {
    this.transactions.push(data);
  }
}
