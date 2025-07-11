import { Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/domain/repositories/user.repository';
import { UserData, CreateUserRequest } from '@/domain/entities';
import { datasource } from './database.config';

@Service('UserRepository')
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async create(userData: CreateUserRequest): Promise<UserData> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 