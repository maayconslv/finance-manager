import { UserEntity } from "../../enterprise/entities";
import { WalletEntity } from "../../enterprise/entities/wallet.entity";
import { AuthenticatedUserModel } from "../model";

export class UserMapper {
  static toAuthenticatedUser(user: UserEntity, wallet: WalletEntity, token: string): AuthenticatedUserModel {
    return {
      user: {
        id: user.id,
        email: user.email.toString(),
        name: user.name,
        wallet: {
          id: wallet.id,
          userId: wallet.userId.toString(),
          currentBalance: wallet.currentBalance.toBRL(),
        },
      },
      token,
    };
  }
}
