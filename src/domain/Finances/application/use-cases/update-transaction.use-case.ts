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
    return !!(data.amount ?? data.type);
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

    const newAmount = amount ? new Money(amount) : null;
    if (newAmount && !newType) {
      // caso esteja atualizando o valor da transaçao, preciso remover da conta bancaria o valor da transaçao atual e acrescentar um novo valor
      if (transaction.type === Type.income) {
        bankAccount.decreaseAmountInCents = transaction.amount.getInCents();
        bankAccount.increaseAmountInCents = newAmount.getInCents();
      } else {
        bankAccount.increaseAmountInCents = transaction.amount.getInCents();
        bankAccount.decreaseAmountInCents = newAmount.getInCents();
      }
    } else if (newType && !newAmount) {
      // caso mude apenas o tipo, preciso reverter os valores da transaçao. Ou seja... se mudar o valor da transaçao para income, preciso acrescentar o valor da transaçao atual
      if (newType === Type.income) {
        bankAccount.decreaseAmountInCents = transaction.amount.getInCents();
      } else {
        bankAccount.increaseAmountInCents = transaction.amount.getInCents();
      }
    } else if (newAmount && newType) {
      // caso mude o tipo de o valor, preciso reverter o valor da conta bancaria e adicionar um novo valor
      if (newType === Type.income) {
        bankAccount.decreaseAmountInCents = transaction.amount.getInCents();
      } else {
        bankAccount.increaseAmountInCents = transaction.amount.getInCents();
      }

      if (transaction.type === Type.income) {
        bankAccount.decreaseAmountInCents = transaction.amount.getInCents();
        bankAccount.increaseAmountInCents = newAmount.getInCents();
      } else {
        bankAccount.increaseAmountInCents = transaction.amount.getInCents();
        bankAccount.decreaseAmountInCents = newAmount.getInCents();
      }
    }

    await this.bankAccountRepository.save(bankAccount);
  }
}
