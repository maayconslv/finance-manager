import { UserEntity } from "@/domain/user/enterprise/entities";
import { IUserRepository } from "@/domain/user/application/repositories";

export class UserInMemoryRepository implements IUserRepository {
  constructor(private users: UserEntity[]) {}

  async save(data: UserEntity): Promise<void> {
    this.users.push(data);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.email.toString() === email);
      resolve(user || null);
    });
  }

  findById(id: string): Promise<UserEntity | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.id === id);
      resolve(user || null);
    });
  }
}
