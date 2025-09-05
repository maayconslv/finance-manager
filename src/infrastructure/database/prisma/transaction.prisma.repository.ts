import { ITransactionRepository } from "@/domain/Finances/application/repositories";
import { CategoryEntity, TransactionEntity, Type } from "@/domain/Finances/enterprise";
import { Service } from "typedi";
import { datasource } from "../database.config";
import { Prisma, PrismaClient } from "@prisma/client";
import { Money, UniqueEntityId } from "@/core/object-values";

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { bankAccount: { include: { wallet: true } }; category: true };
}>;

interface findManyByAccountRequest {
  bankAccountId: string;
  page: number;
  limit: number;
  startDate: Date;
  endDate: Date;
}

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

  async findManyByAccount(
    data: findManyByAccountRequest,
  ): Promise<{ transactions: TransactionEntity[]; total: number }> {
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          bankAccountId: data.bankAccountId,
          createdAt: {
            gte: data.startDate,
            lt: data.endDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        include: { bankAccount: { include: { wallet: true } }, category: true },
      }),
      this.prisma.transaction.count({
        where: { bankAccountId: data.bankAccountId },
      }),
    ]);

    return {
      transactions: transactions.map(this.serializeTransaction),
      total,
    };
  }

  async findById(transactionId: string): Promise<TransactionEntity | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { bankAccount: { include: { wallet: true } }, category: true },
    });

    if (!transaction) {
      return null;
    }

    return this.serializeTransaction(transaction);
  }

  async findByIdAndUser(transactionId: string, userId: string): Promise<TransactionEntity | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId, bankAccount: { wallet: { userId } } },
      include: { bankAccount: { include: { wallet: true } }, category: true },
    });

    if (!transaction) {
      return null;
    }

    return this.serializeTransaction(transaction);
  }

  async belongsToUser(transactionId: string, userId: string): Promise<boolean> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { bankAccount: { include: { wallet: true } }, category: true },
    });

    return transaction?.bankAccount.wallet.userId === userId;
  }

  async delete(transactionId: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  }

  async findManyByMonthAndUser(userId: string, month: number, year: number): Promise<TransactionEntity[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        bankAccount: {
          wallet: {
            userId,
          },
        },
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        bankAccount: {
          include: { wallet: true },
        },
        category: true,
      },
    });

    return transactions.map(this.serializeTransaction);
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
