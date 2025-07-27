import { WalletEntity } from "../../enterprise/entities/wallet.entity";

export interface IWalletRepository {
  save(data: WalletEntity): Promise<void>;
  findByUserId(userId: string): Promise<WalletEntity | null>;
}
