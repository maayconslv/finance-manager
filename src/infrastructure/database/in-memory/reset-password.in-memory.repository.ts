import { IResetPasswordRepository } from "@/domain/auth/application/repositories";
import { ResetPasswordEntity } from "@/domain/auth/enterprise/entities";

export class ResetPasswordInMemoryRepository implements IResetPasswordRepository {
  constructor(private resetPasswords: ResetPasswordEntity[]) {}

  async findRecentAttempts(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.resetPasswords.filter(
      (resetPassword) => resetPassword.userId?.toString() === userId && resetPassword.createdAt >= oneHourAgo,
    ).length;
  }

  async save(resetPassword: ResetPasswordEntity): Promise<void> {
    this.resetPasswords.push(resetPassword);
  }

  async invalidateActiveTokens(userId: string): Promise<void> {
    const now = new Date();
    this.resetPasswords.forEach((resetPassword) => {
      if (resetPassword.userId?.toString() === userId && resetPassword.expiresAt > now) {
        resetPassword.invalidatedAt = now;
      }
    });
  }
}
