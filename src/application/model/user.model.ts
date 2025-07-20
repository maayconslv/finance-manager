import { WalletModel } from "./wallet.model";

export interface UserModel {
  id: string;
  name: string;
  email: string;
  wallet: WalletModel;
}

export interface AuthenticatedUserModel {
  user: UserModel;
  token: string;
}
