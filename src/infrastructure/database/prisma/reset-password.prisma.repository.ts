import { IResetPasswordRepository } from "@/domain/auth/application/repositories";
import { ResetPasswordEntity } from "@/domain/auth/enterprise/entities";
import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "../database.config";
import { UniqueEntityId } from "@/core/object-values";

@Service()
export class ResetPasswordRepository implements IResetPasswordRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async findRecentAttempts(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.prisma.resetPassword.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo, // 1 hour ago
        },
      },
    });
  }

  async save(resetPassword: ResetPasswordEntity): Promise<void> {
    await this.prisma.resetPassword.create({
      data: {
        userId: resetPassword.userId?.toString(),
        token: resetPassword.token,
        invalidatedAt: resetPassword.invalidatedAt,
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

  async findAttemptByToken(token: string): Promise<ResetPasswordEntity | null> {
    const attempt = await this.prisma.resetPassword.findUnique({
      where: {
        token,
      },
    });

    if (!attempt) {
      return null;
    }

    return ResetPasswordEntity.create({
      userId: new UniqueEntityId(attempt.userId),
      token: attempt.token,
      invalidatedAt: attempt.invalidatedAt,
      createdAt: attempt.createdAt,
      expiresAt: attempt.expiresAt,
      usedAt: attempt.usedAt,
    });
  }

  async useResetPasswordToken(token: string): Promise<void> {
    console.log("DEBUG - token", token);
    await this.prisma.resetPassword.update({
      where: { token },
      data: {
        usedAt: new Date(),
        invalidatedAt: new Date(),
      },
    });
  }
}
