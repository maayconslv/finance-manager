import { CreateUserRequestDTO } from "@/application/dto";
import { UserEntity } from "@/domain/entities";
import { IUserRepository } from "@/domain/repositories";

export class UserInMemoryRepository implements IUserRepository {
  private users: UserEntity[] = [];

  save(userData: CreateUserRequestDTO): Promise<UserEntity> {
    const user = UserEntity.create(userData);
    this.users.push();

    return Promise.resolve(UserEntity.rebuild(user));
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    const user = this.users.find((user) => user.email === email);
    return Promise.resolve(user || null);
  }

  findById(id: string): Promise<UserEntity | null> {
    const user = this.users.find((user) => user.id === id);
    return Promise.resolve(user || null);
  }
}
