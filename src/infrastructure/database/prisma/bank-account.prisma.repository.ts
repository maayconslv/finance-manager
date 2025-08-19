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
    await this.prisma.bankAccount.create({
      data: {
        accountName: bankAccount.accountName,
        bankName: bankAccount.name,
        currentBalance: bankAccount.currentBalance.getInCents(),
        initialBalance: bankAccount.initialBalance.getInCents(),
        id: bankAccount.id,
        walletId: bankAccount.walletId,
      },
    });
  }

  async findManyByWalletId(walletId: string): Promise<BankAccountEntity[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { walletId },
    });

    return bankAccounts.map((item) => this.serializeBankAccount(item));
  }

  private serializeBankAccount(data: BankAccount): BankAccountEntity {
    return BankAccountEntity.create({
      id: new UniqueEntityId(data.id),
      accountName: data.accountName,
      bankName: data.bankName,
      currentBalance: Money.fromCents(data.currentBalance),
      initialBalance: Money.fromCents(data.initialBalance),
      walletId: new UniqueEntityId(data.walletId),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
