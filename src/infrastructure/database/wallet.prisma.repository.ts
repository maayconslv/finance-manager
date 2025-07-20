import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "./database.config";
import { WalletEntity } from "@/domain/entities/wallet.entity";
import { CreateWalletDataDTO } from "@/application/dto/wallet.dto";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { IWalletRepository } from "@/domain/repositories/wallet.repository";

@Service()
export class WalletRepository implements IWalletRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: CreateWalletDataDTO): Promise<WalletEntity> {
    const wallet = await this.prisma.wallet.create({ data });

    return WalletEntity.create(
      {
        userId: new UniqueEntityId(wallet.userId),
        initialBalance: wallet.initialBalance,
        currentBalance: wallet.currentBalance,
        createdAt: wallet.createdAt,
      },
      new UniqueEntityId(wallet.id),
    );
  }
}
