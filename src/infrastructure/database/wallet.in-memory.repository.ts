import { CreateWalletDataDTO } from "@/application/dto/wallet.dto";
import { Money, UniqueEntityId } from "@/core/object-values";
import { WalletEntity } from "@/domain/entities/wallet.entity";
import { IWalletRepository } from "@/domain/repositories/wallet.repository";

export class WalletInMemoryRepository implements IWalletRepository {
  constructor(private readonly wallets: WalletEntity[]) {}

  async save(data: CreateWalletDataDTO): Promise<WalletEntity> {
    const wallet = WalletEntity.create(
      {
        userId: new UniqueEntityId(data.userId),
        initialBalance: Money.fromCents(data.initialBalance),
        currentBalance: Money.fromCents(data.initialBalance),
        createdAt: new Date(),
      },
      new UniqueEntityId(data.id),
    );
    this.wallets.push(wallet);
    return wallet;
  }
}
