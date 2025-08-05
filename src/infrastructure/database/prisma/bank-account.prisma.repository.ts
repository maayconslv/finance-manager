import { IBankAccountRepository } from "@/domain/bank-account/application/repositories";
import { BankAccountEntity } from "@/domain/bank-account/enterprise";
import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "../database.config";

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
}
