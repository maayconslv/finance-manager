import { CreateUserDataDTO } from "@/application/dto";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { UserEntity } from "@/domain/entities";
import { IUserRepository } from "@/domain/repositories";

export class UserInMemoryRepository implements IUserRepository {
  constructor(private users: UserEntity[]) {}

  save(data: CreateUserDataDTO): Promise<UserEntity> {
    return new Promise((resolve) => {
      const user = UserEntity.create(data, new UniqueEntityId(data.id));
      this.users.push(user);
      resolve(user);
    });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.email === email);
      resolve(user || null);
    });
  }

  findById(id: string): Promise<UserEntity | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.userId === id);
      resolve(user || null);
    });
  }
}
