import { ResetPasswordEntity } from "../../enterprise/entities/reset-password.entity";

export interface IResetPasswordRepository {
  findRecentAttempts(userId: string): Promise<number>;
  save(resetPassword: ResetPasswordEntity): Promise<void>;
  invalidateActiveTokens(userId: string): Promise<void>;
  findRecentAttemptsByIp(ip: string): Promise<number>;
  saveAttempt(ip: string): Promise<void>;
}
