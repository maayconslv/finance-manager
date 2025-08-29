import { Service } from "typedi";
import { TransactionEntity, Type } from "../../enterprise";
import { BankAccountRepository, TransactionRepository, UserRepository } from "@/infrastructure/database/prisma";
import { NotFoundError } from "@/domain/errors";
import { Money, UniqueEntityId } from "@/core/object-values";
import { TransactionModel } from "../model/finances.model";
import { TransactionMapper } from "../mapper/finances.mapper";
import { CategoryRepository } from "@/infrastructure/database/prisma/category.prisma.repository";
import { UnauthorizedError } from "routing-controllers";

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
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async execute(data: CreateTransactionUseCaseRequest): Promise<TransactionModel> {
    const user = await this.userRepository.findById(data.userId);
    const category = await this.categoryRepository.findById(data.categoryId);
    const bankAccount = await this.bankAccountRepository.findById(data.bankAccountId);

    if (!user || !bankAccount || !category) {
      throw new NotFoundError();
    }

    if (bankAccount.isDisable) {
      throw new UnauthorizedError();
    }

    const transaction = TransactionEntity.create({
      amount: new Money(data.amount),
      type: data.type,
      description: data.description,
      bankAccountId: new UniqueEntityId(data.bankAccountId),
      category,
    });

    if (transaction.type == "income") {
      bankAccount.currentBalance.increaseAmount(transaction.amount.getInCents());
    } else {
      bankAccount.currentBalance.decreaseAmount(transaction.amount.getInCents());
    }

    console.log(bankAccount.currentBalance);

    await this.bankAccountRepository.save(bankAccount);
    await this.transactionRepository.save(transaction);

    return TransactionMapper.toModel(transaction);
  }
}
