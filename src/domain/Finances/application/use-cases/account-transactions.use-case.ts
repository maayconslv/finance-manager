import { BankAccountRepository, TransactionRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { AccountTransactionsModel } from "../model";
import { TransactionMapper } from "../mapper/finances.mapper";
import { BankAccountMapper } from "@/domain/Accounts/application/mapper";
import { InternalServerError } from "@/domain/errors/internal-server.error";

export interface AccountTransactionsUseCaseRequest {
  userId: string;
  bankAccountId: string;
  page: number;
  limit: number;
  month: number;
  year: number;
}

@Service()
export class AccountTransactionsUseCase {
  constructor(
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({
    bankAccountId,
    userId,
    limit,
    page,
    month,
    year,
  }: AccountTransactionsUseCaseRequest): Promise<AccountTransactionsModel> {
    const bankAccount = await this.bankAccountRepository.findByIdAndUser(bankAccountId, userId);

    if (!bankAccount) {
      throw new InternalServerError("This bank account was not found. Please, contact the support.");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const { transactions, total } = await this.transactionRepository.findManyByAccount({
      bankAccountId,
      limit,
      page,
      endDate,
      startDate,
    });
    const hasMoreAfter = page * limit < total;
    const hasMoreBefore = page > 1;

    return {
      account: BankAccountMapper.toModel(bankAccount),
      transactions: transactions.map(TransactionMapper.toModel),
      hasMoreAfter,
      hasMoreBefore,
    };
  }
}
