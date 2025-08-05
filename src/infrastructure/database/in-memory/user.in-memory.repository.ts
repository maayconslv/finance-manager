import { UserEntity } from "@/domain/auth/enterprise/entities";
import { IUserRepository } from "@/domain/auth/application/repositories";

interface UpdatePasswordData {
  id: string;
  passwordHash: string;
  salt: string;
}

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

  async updatePassword(data: UpdatePasswordData): Promise<void> {
    this.users.forEach((user) => {
      if (user.id === data.id) {
        user.password = data.passwordHash;
        user.salt = data.salt;
      }
    });
  }
}
