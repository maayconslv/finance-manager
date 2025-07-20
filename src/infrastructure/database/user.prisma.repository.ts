import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { datasource } from "./database.config";
import { IUserRepository } from "@/domain/repositories";
import { UserEntity } from "@/domain/entities";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { CreateUserDataDTO } from "@/application/dto";

@Service()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: CreateUserDataDTO): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.password,
        salt: data.salt,
        createdAt: data.createdAt,
        id: data.id,
      },
    });
    return UserEntity.create({ ...user, password: user.passwordHash }, new UniqueEntityId(user.id));
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return UserEntity.create({ ...user, password: user.passwordHash }, new UniqueEntityId(user.id));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }

    return UserEntity.create({ ...user, password: user.passwordHash }, new UniqueEntityId(user.id));
  }
}
