import { UserEntity } from "../../enterprise/entities";

interface UpdatePasswordData {
  id: string;
  password: string;
  salt: string;
}
export interface IUserRepository {
  save(data: UserEntity): Promise<void>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  updatePassword(data: UpdatePasswordData): Promise<void>;
}
