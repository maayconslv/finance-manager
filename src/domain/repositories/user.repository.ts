import { CreateUserRequestDTO } from "@/application/dto";
import { UserEntity } from "../entities";

export interface IUserRepository {
  save(userData: CreateUserRequestDTO): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
}
