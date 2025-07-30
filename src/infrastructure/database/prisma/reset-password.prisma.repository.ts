import { IResetPasswordRepository } from "@/domain/auth/application/repositories";
import { ResetPasswordEntity } from "@/domain/auth/enterprise/entities";
import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";

@Service()
export class ResetPasswordRepository implements IResetPasswordRepository {
  private prisma: PrismaClient;

  async findRecentAttempts(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.prisma.resetPassword.count({
      where: {
        userId,
        invalidatedAt: null,
        createdAt: {
          gte: oneHourAgo, // 1 hour ago
        },
      },
    });
  }

  async save(resetPassword: ResetPasswordEntity): Promise<void> {
    await this.prisma.resetPassword.create({
      data: {
        token: resetPassword.token,
        userId: resetPassword.userId?.toString() ?? null,
        createdAt: resetPassword.createdAt,
        expiresAt: resetPassword.expiresAt,
      },
    });
  }

  async invalidateActiveTokens(userId: string): Promise<void> {
    await this.prisma.resetPassword.updateMany({
      where: {
        userId,
        invalidatedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        invalidatedAt: new Date(),
      },
    });
  }

  async findRecentAttemptsByIp(ip: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.prisma.resetPassword.count({
      where: {
        ip,
        invalidatedAt: null,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });
  }

  async saveAttempt(ip: string): Promise<void> {
    await this.prisma.resetPassword.create({
      data: {
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        ip,
        userId: null,
        token: "",
      },
    });
  }
}
