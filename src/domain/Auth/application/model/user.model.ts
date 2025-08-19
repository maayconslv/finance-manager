import { WalletModel } from "@/domain/Accounts/application/model";

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

export interface UpdatePasswordModel {
  message: string;
}
