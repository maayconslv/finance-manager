import { WalletEntity } from "@/domain/Auth/enterprise/entities";
import { WalletModel } from "../model";

export class WalletMapper {
  static toModel(entity: WalletEntity): WalletModel {
    return {
      id: entity.id,
      currentBalance: entity.currentBalance.toBRL(),
      userId: entity.userId,
    };
  }
}
