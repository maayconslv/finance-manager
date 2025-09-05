import { Service } from "typedi";
import { CategoryEntity, TransactionEntity, Type } from "../../enterprise";
import {
  BankAccountRepository,
  TransactionRepository,
  UserRepository,
  WalletRepository,
} from "@/infrastructure/database/prisma";
import { NotFoundError } from "@/domain/errors";
import { Money, UniqueEntityId } from "@/core/object-values";
import { TransactionModel } from "../model/finances.model";
import { TransactionMapper } from "../mapper/finances.mapper";
import { CategoryRepository } from "@/infrastructure/database/prisma/category.prisma.repository";
import { UnauthorizedError } from "routing-controllers";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { WalletEntity } from "@/domain/Auth/enterprise/entities";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";

export interface CreateTransactionUseCaseRequest {
  userId: string;
  amount: string;
  type: Type;
  description: string;
  categoryId: string;
  bankAccountId: string;
}

@Service()
export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(data: CreateTransactionUseCaseRequest): Promise<TransactionModel> {
    const [wallet, category, bankAccount] = await Promise.all([
      this.walletRepository.findByUserId(data.userId),
      this.categoryRepository.findById(data.categoryId),
      this.bankAccountRepository.findByIdAndUser(data.bankAccountId, data.userId),
    ]);

    if (!bankAccount || !category || !wallet) {
      throw new InternalServerError("We dont found the recourse that you searching. Please, contact support.");
    }
    if (bankAccount.isDisable) {
      throw new UnauthorizedError("You can't register a transaction in a disabled bank account.");
    }

    const transaction = this.createTransaction(data, category);
    this.updateBalances(wallet, bankAccount, transaction);

    await Promise.all([
      this.bankAccountRepository.save(bankAccount),
      this.transactionRepository.save(transaction),
      this.walletRepository.save(wallet),
    ]);

    return TransactionMapper.toModel(transaction);
  }

  private createTransaction(data: CreateTransactionUseCaseRequest, category: CategoryEntity): TransactionEntity {
    return TransactionEntity.create({
      amount: new Money(data.amount),
      type: data.type,
      description: data.description,
      bankAccountId: new UniqueEntityId(data.bankAccountId),
      category,
    });
  }

  private updateBalances(wallet: WalletEntity, bankAccount: BankAccountEntity, transaction: TransactionEntity): void {
    const amountInCents = transaction.amount.getInCents();

    if (transaction.type === Type.income) {
      wallet.increaseAmountInCents = amountInCents;
      bankAccount.increaseAmountInCents = amountInCents;
    } else {
      wallet.decreaseAmountInCents = amountInCents;
      bankAccount.decreaseAmountInCents = amountInCents;
    }
  }
}
