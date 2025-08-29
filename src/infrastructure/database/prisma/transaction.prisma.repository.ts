import { ITransactionRepository } from "@/domain/Finances/application/repositories";
import { CategoryEntity, TransactionEntity, Type } from "@/domain/Finances/enterprise";
import { Service } from "typedi";
import { datasource } from "../database.config";
import { Prisma, PrismaClient } from "@prisma/client";
import { Money, UniqueEntityId } from "@/core/object-values";

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;

@Service()
export class TransactionRepository implements ITransactionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: TransactionEntity): Promise<void> {
    await this.prisma.transaction.upsert({
      where: {
        id: data.id,
      },
      create: {
        id: data.id,
        amount: data.amount.getInCents(),
        description: data.description,
        type: data.type,
        categoryId: data.category.id,
        bankAccountId: data.bankAccountId.toString(),
      },
      update: {
        id: data.id,
        amount: data.amount.getInCents(),
        description: data.description,
        type: data.type,
        categoryId: data.category.id,
      },
    });
  }

  async findManyByAccount(bankAccountId: string): Promise<TransactionEntity[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { bankAccountId },
      include: { category: true },
    });

    return transactions.map(this.serializeTransaction);
  }

  async findById(transactionId: string): Promise<TransactionEntity | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true },
    });

    if (!transaction) {
      return null;
    }

    return this.serializeTransaction(transaction);
  }

  async belongsToUser(transactionId: string, userId: string): Promise<boolean> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { bankAccount: { include: { wallet: true } } },
    });

    return transaction?.bankAccount.wallet.userId === userId;
  }

  private serializeTransaction(data: TransactionWithCategory): TransactionEntity {
    return TransactionEntity.create(
      {
        amount: Money.fromCents(data.amount),
        bankAccountId: new UniqueEntityId(data.bankAccountId),
        description: data.description,
        type: data.type as Type,
        createdAt: data.createdAt,
        category: CategoryEntity.create(
          {
            name: data.category.name,
            colorCode: data.category.colorCode,
            userId: new UniqueEntityId(data.category.userId),
            createdAt: data.category.createdAt,
          },
          new UniqueEntityId(data.category.id),
        ),
      },
      new UniqueEntityId(data.id),
    );
  }
}
