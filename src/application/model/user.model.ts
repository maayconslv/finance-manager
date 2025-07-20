export interface UserModel {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedUserModel {
  user: UserModel;
  token: string;
}
