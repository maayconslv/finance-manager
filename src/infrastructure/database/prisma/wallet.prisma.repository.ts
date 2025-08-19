import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "../database.config";
import { Money, UniqueEntityId } from "@/core/object-values";
import { IWalletRepository } from "@/domain/Auth/application/repositories";
import { WalletEntity } from "@/domain/Auth/enterprise/entities";

@Service()
export class WalletRepository implements IWalletRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: WalletEntity): Promise<void> {
    await this.prisma.wallet.upsert({
      where: { id: data.id },
      update: { currentBalance: data.currentBalance.getInCents() },
      create: this.getWalletDataFromEntity(data),
    });
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return null;
    }

    return WalletEntity.create(
      {
        userId: new UniqueEntityId(wallet.userId),
        initialBalance: Money.fromCents(wallet.initialBalance),
        currentBalance: Money.fromCents(wallet.currentBalance),
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
      new UniqueEntityId(wallet.id),
    );
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
