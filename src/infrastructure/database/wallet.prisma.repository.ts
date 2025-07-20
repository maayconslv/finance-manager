import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "./database.config";
import { WalletEntity } from "@/domain/entities/wallet.entity";
import { CreateWalletDataDTO } from "@/application/dto/wallet.dto";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { IWalletRepository } from "@/domain/repositories/wallet.repository";
import { Money } from "@/core/object-values/money";

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
        currentBalance: Money.fromCents(wallet.currentBalance),
        initialBalance: Money.fromCents(wallet.initialBalance),
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
      new UniqueEntityId(wallet.id),
    );
  }
}
