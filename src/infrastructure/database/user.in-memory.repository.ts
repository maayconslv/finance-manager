import { CreateUserRequest, UserData, UserResponse } from "@/domain/entities";
import { IUserRepository } from "@/domain/repositories";

export class UserInMemoryRepository implements IUserRepository {
  private users: UserData[] = [];
  
  create(userData: CreateUserRequest): Promise<UserResponse> {
    const user = { ...userData, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    this.users.push(user);

    return Promise.resolve(user);
  }

  findByEmail(email: string): Promise<UserResponse | null> {
    const user = this.users.find((user) => user.email === email);
    return Promise.resolve(user || null);
  }

  findById(id: string): Promise<UserResponse | null> {
    const user = this.users.find((user) => user.id === id);
    return Promise.resolve(user || null);
  }
}