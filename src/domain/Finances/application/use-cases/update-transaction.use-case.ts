import { Service } from "typedi";
import { TransactionEntity, Type } from "../../enterprise";
import { BankAccountRepository, TransactionRepository, UserRepository } from "@/infrastructure/database/prisma";
import { CategoryRepository } from "@/infrastructure/database/prisma/category.prisma.repository";
import { TransactionModel } from "../model";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { Money } from "@/core/object-values";
import { TransactionMapper } from "../mapper/finances.mapper";
import { UnauthorizedError } from "@/domain/errors";

export interface UpdateTransactionUseCaseRequest {
  userId: string;
  transactionId: string;
  amount?: string;
  type?: Type;
  description?: string;
  categoryId?: string;
}

@Service()
export class UpdateTransactionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async execute(data: UpdateTransactionUseCaseRequest): Promise<TransactionModel> {
    const { transaction, user } = await this.validateUserAndTransaction(data.userId, data.transactionId);

    await this.validateTransactionOwnership(transaction.id, user.id);

    if (this.shouldUpdateBalance(data)) {
      await this.updateBankAccountBalance(transaction, data.amount, data.type);
    }

    const category = data.categoryId ? await this.categoryRepository.findById(data.categoryId) : null;
    transaction.amount = data.amount ? new Money(data.amount) : transaction.amount;
    transaction.description = data.description?.trim() ?? transaction.description;
    transaction.type = data.type ?? transaction.type;
    transaction.category = category ?? transaction.category;

    await this.transactionRepository.save(transaction);

    return TransactionMapper.toModel(transaction);
  }

  private async validateUserAndTransaction(userId: string, transactionId: string) {
    const [user, transaction] = await Promise.all([
      this.userRepository.findById(userId),
      this.transactionRepository.findById(transactionId),
    ]);

    if (!user || !transaction) {
      throw new InternalServerError();
    }

    return { user, transaction };
  }

  private async validateTransactionOwnership(transactionId: string, userId: string): Promise<void> {
    const belongsToUser = await this.transactionRepository.belongsToUser(transactionId, userId);
    if (!belongsToUser) {
      throw new UnauthorizedError("Transaction does not belong to user");
    }
  }

  private shouldUpdateBalance(data: UpdateTransactionUseCaseRequest) {
    return !!(data.type || data.amount);
  }

  private async updateBankAccountBalance(
    transaction: TransactionEntity,
    amount: string | undefined,
    newType: Type | undefined,
  ): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findById(transaction.bankAccountId.toString());
    if (!bankAccount) {
      throw new InternalServerError("Bank account not found");
    }

    const oldType = transaction.type;
    const oldAmount = transaction.amount;
    const newAmount = amount ? new Money(amount) : null;
    const finalType = newType ?? oldType;
    const finalAmount = newAmount ?? oldAmount;

    if (oldType === Type.income) {
      bankAccount.decreaseAmountInCents = oldAmount.getInCents();
    } else {
      bankAccount.increaseAmountInCents = oldAmount.getInCents();
    }

    if (finalType === Type.income) {
      bankAccount.increaseAmountInCents = finalAmount.getInCents();
    } else {
      bankAccount.decreaseAmountInCents = finalAmount.getInCents();
    }

    await this.bankAccountRepository.save(bankAccount);
  }
}
