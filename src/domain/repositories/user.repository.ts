import { CreateUserRequest, UserResponse } from "../entities";

export interface IUserRepository {
  create(userData: CreateUserRequest): Promise<UserResponse>;
  findByEmail(email: string): Promise<UserResponse | null>;
  findById(id: string): Promise<UserResponse | null>;
} 