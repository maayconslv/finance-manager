import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { Email } from "@/core/object-values";
import { datasource } from "../database.config";
import { IUserRepository } from "@/domain/auth/application/repositories";
import { UserEntity } from "@/domain/auth/enterprise/entities";

@Service()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: UserEntity): Promise<void> {
    await this.prisma.user.create({ data: this.getUserDataFromEntity(data) });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return UserEntity.create(
      {
        email: Email.create(user.email),
        name: user.name,
        password: user.passwordHash,
        salt: user.salt,
      },
      new UniqueEntityId(user.id),
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }

    return UserEntity.create(
      {
        email: Email.create(user.email),
        name: user.name,
        password: user.passwordHash,
        salt: user.salt,
      },
      new UniqueEntityId(user.id),
    );
  }

  private getUserDataFromEntity(user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      salt: user.salt,
      passwordHash: user.password,
      createdAt: user.createdAt,
    };
  }
}
