import { CreateUserDataDTO } from "@/application/dto";
import { Email } from "@/core/object-values";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { UserEntity } from "@/domain/entities";
import { IUserRepository } from "@/domain/repositories";

export class UserInMemoryRepository implements IUserRepository {
  constructor(private users: UserEntity[]) {}

  save(data: CreateUserDataDTO): Promise<UserEntity> {
    return new Promise((resolve) => {
      const user = UserEntity.create(
        {
          email: new Email(data.email),
          name: data.name,
          password: data.password,
          salt: data.salt,
        },
        new UniqueEntityId(data.id),
      );
      this.users.push(user);
      resolve(user);
    });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.email.toString() === email);
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
