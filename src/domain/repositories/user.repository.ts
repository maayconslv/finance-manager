import { CreateUserDataDTO } from "@/application/dto";
import { UserEntity } from "../entities";

export interface IUserRepository {
  save(data: CreateUserDataDTO): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
}
