import { BankAccount, PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "../database.config";
import { IBankAccountRepository } from "@/domain/Accounts/application/repositories";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { Money, UniqueEntityId } from "@/core/object-values";

@Service()
export class BankAccountRepository implements IBankAccountRepository {
  private readonly prisma: PrismaClient;
  constructor() {
    this.prisma = datasource;
  }

  async save(bankAccount: BankAccountEntity): Promise<void> {
    await this.prisma.bankAccount.upsert({
      where: { id: bankAccount.id },
      create: {
        accountName: bankAccount.accountName,
        bankName: bankAccount.bankName,
        currentBalance: bankAccount.currentBalance.getInCents(),
        initialBalance: bankAccount.initialBalance.getInCents(),
        id: bankAccount.id,
        walletId: bankAccount.walletId,
      },
      update: {
        accountName: bankAccount.accountName,
        bankName: bankAccount.bankName,
        currentBalance: bankAccount.currentBalance.getInCents(),
        initialBalance: bankAccount.initialBalance.getInCents(),
      },
    });
  }

  async findManyByWalletId(walletId: string): Promise<BankAccountEntity[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });

    return bankAccounts.map((item) => this.serializeBankAccount(item));
  }

  async findById(bankAccountId: string): Promise<BankAccountEntity | null> {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: {
        id: bankAccountId,
      },
    });

    if (!bankAccount) {
      return null;
    }

    return this.serializeBankAccount(bankAccount);
  }

  private serializeBankAccount(data: BankAccount): BankAccountEntity {
    return BankAccountEntity.create(
      {
        accountName: data.accountName,
        bankName: data.bankName,
        currentBalance: Money.fromCents(data.currentBalance),
        initialBalance: Money.fromCents(data.initialBalance),
        walletId: new UniqueEntityId(data.walletId),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      new UniqueEntityId(data.id),
    );
  }
}
