import { CreateWalletDataDTO } from "@/application/dto/wallet.dto";
import { WalletEntity } from "../entities/wallet.entity";

export interface IWalletRepository {
  save(data: CreateWalletDataDTO): Promise<WalletEntity>;
}
