import { IWalletRepository } from "@/domain/Auth/application/repositories";
import { WalletEntity } from "@/domain/Auth/enterprise/entities";

export class WalletInMemoryRepository implements IWalletRepository {
  constructor(private readonly wallets: WalletEntity[]) {}

  async save(data: WalletEntity): Promise<void> {
    const index = this.wallets.findIndex((item) => item.id === data.id);

    if (index !== -1) {
      this.wallets[index] = data;
    } else {
      this.wallets.push(data);
    }
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    return this.wallets.find((wallet) => wallet.userId.toString() === userId) || null;
  }
}
