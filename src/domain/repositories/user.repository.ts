import { UserResponse, CreateUserRequest } from '../entities/user.entity';

export interface IUserRepository {
  create(userData: CreateUserRequest): Promise<UserResponse>;
  findByEmail(email: string): Promise<UserResponse | null>;
  findById(id: string): Promise<UserResponse | null>;
} 