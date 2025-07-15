import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { datasource } from "./database.config";
import { IUserRepository } from "@/domain/repositories";
import { CreateUserRequestDTO } from "@/application/dto";
import { UserEntity } from "@/domain/entities";

@Service()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(userData: CreateUserRequestDTO): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data: userData });
    return UserEntity.rebuild(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserEntity.rebuild(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserEntity.rebuild(user) : null;
  }
}
