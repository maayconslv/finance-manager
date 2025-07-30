import { UserEntity } from "../../enterprise/entities";

export interface IUserRepository {
  save(data: UserEntity): Promise<void>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
}
