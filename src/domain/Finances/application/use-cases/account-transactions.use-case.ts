import { BankAccountRepository, TransactionRepository, UserRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { AccountTransactionsModel } from "../model";
import { AccountTransactionsMapper } from "../mapper/finances.mapper";

export interface AccountTransactionsUseCaseRequest {
  userId: string;
  bankAccountId: string;
}

@Service()
export class AccountTransactionsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(data: AccountTransactionsUseCaseRequest): Promise<AccountTransactionsModel> {
    const user = await this.userRepository.findById(data.userId);
    const bankAccount = await this.bankAccountRepository.findById(data.bankAccountId);

    if (!user || !bankAccount) {
      throw new Error();
    }

    const transactions = await this.transactionRepository.findManyByAccount(data.bankAccountId);

    return AccountTransactionsMapper.toModel(transactions, bankAccount);
  }
}
