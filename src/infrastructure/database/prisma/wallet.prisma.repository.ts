import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { WalletEntity } from "@/domain/user/enterprise/entities/wallet.entity";
import { IWalletRepository } from "@/domain/user/application/repositories/wallet.repository";
import { datasource } from "../database.config";

@Service()
export class WalletRepository implements IWalletRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: WalletEntity): Promise<void> {
    await this.prisma.wallet.create({ data: this.getWalletDataFromEntity(data) });
  }

  private getWalletDataFromEntity(wallet: WalletEntity) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      initialBalance: wallet.initialBalance.getInCents(),
      currentBalance: wallet.currentBalance.getInCents(),
      createdAt: wallet.createdAt,
    };
  }
}
