import { Money } from "@/core/object-values";
import { BankAccountMapper } from "@/domain/Accounts/application/mapper";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { UserSummaryModel } from "@/domain/Finances/application/model";
import { TransactionEntity, Type } from "@/domain/Finances/enterprise";
import { BankAccountRepository, TransactionRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";

export interface GetUserUseCaseRequest {
  userId: string;
  year: number;
  month: number;
}

@Service()
export class GetUserSummaryUseCase {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({ userId, month, year }: GetUserUseCaseRequest): Promise<UserSummaryModel> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new InternalServerError("Wallet not found. Please, contact support.");
    }

    const [bankAccounts, transactions] = await Promise.all([
      this.bankAccountRepository.findManyByWalletId(wallet.id),
      this.transactionRepository.findManyByMonthAndUser(userId, month, year),
    ]);

    const disabledBankAccountIds = new Set(
      bankAccounts.filter((account) => account.isDisable).map((account) => account.id),
    );

    const { totalIncome, totalOutcome } = this.calculeTransactionsAmount(transactions);

    const transactionsWithDisabledFlag = transactions.map((transaction) =>
      this.sim(transaction, disabledBankAccountIds),
    );

    return {
      summary: {
        totalIncome,
        totalOutcome,
        balance: wallet.currentBalance.toBRL(),
      },
      bankAccounts: bankAccounts.map(BankAccountMapper.toModel),
      transactions: transactionsWithDisabledFlag,
    };
  }

  private calculeTransactionsAmount(transactions: TransactionEntity[]) {
    const totalIncome = transactions.reduce((acc, transaction) => {
      if (transaction.type === Type.income) {
        acc += transaction.amount.getInCents();
      }
      return acc;
    }, 0);
    const totalOutcome = transactions.reduce((acc, transaction) => {
      if (transaction.type === Type.outcome) {
        acc += transaction.amount.getInCents();
      }
      return acc;
    }, 0);

    return {
      totalIncome: Money.fromCents(totalIncome).toBRL(),
      totalOutcome: Money.fromCents(totalOutcome).toBRL(),
    };
  }

  private sim(transaction: TransactionEntity, disabledBankAccountIds: Set<string>) {
    return {
      id: transaction.id,
      amount: transaction.amount.toBRL(),
      createdAt: transaction.createdAt,
      description: transaction.description,
      type: transaction.type,
      isFromDisabledAccount: disabledBankAccountIds.has(transaction.bankAccountId),
      category: {
        id: transaction.category.id,
        colorCode: transaction.category.colorCode,
        name: transaction.category.name,
      },
    };
  }
}
