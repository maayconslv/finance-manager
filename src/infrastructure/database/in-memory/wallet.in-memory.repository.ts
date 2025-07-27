import { WalletEntity } from "@/domain/user/enterprise/entities/wallet.entity";
import { IWalletRepository } from "@/domain/user/application/repositories/wallet.repository";

export class WalletInMemoryRepository implements IWalletRepository {
  constructor(private readonly wallets: WalletEntity[]) {}

  async save(data: WalletEntity): Promise<void> {
    this.wallets.push(data);
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    return this.wallets.find((wallet) => wallet.userId.toString() === userId) || null;
  }
}
