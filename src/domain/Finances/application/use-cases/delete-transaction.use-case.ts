import { UnauthorizedError } from "@/domain/errors";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { BankAccountRepository, TransactionRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { Type } from "@prisma/client/edge";
import { Service } from "typedi";

export interface DeleteTransactionUseCaseRequest {
  userId: string;
  transactionId: string;
}

@Service()
export class DeleteTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(data: DeleteTransactionUseCaseRequest): Promise<void> {
    const transaction = await this.transactionRepository.findByIdAndUser(data.transactionId, data.userId);
    if (!transaction) {
      throw new UnauthorizedError();
    }

    const [bankAccount, wallet] = await Promise.all([
      this.bankAccountRepository.findById(transaction.bankAccountId.toString()),
      this.walletRepository.findByUserId(data.userId),
    ]);
    if (!bankAccount || !wallet) {
      throw new InternalServerError();
    }

    if (transaction.type === Type.income) {
      bankAccount.decreaseAmountInCents = transaction.amount.getInCents();
      wallet.decreaseAmountInCents = transaction.amount.getInCents();
    } else {
      bankAccount.increaseAmountInCents = transaction.amount.getInCents();
      wallet.increaseAmountInCents = transaction.amount.getInCents();
    }

    await Promise.all([
      this.transactionRepository.delete(transaction.id),
      this.bankAccountRepository.save(bankAccount),
      this.walletRepository.save(wallet),
    ]);
  }
}
