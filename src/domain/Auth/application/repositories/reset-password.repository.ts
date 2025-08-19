import { ResetPasswordEntity } from "../../enterprise/entities/reset-password.entity";

export interface IResetPasswordRepository {
  findRecentAttempts(userId: string): Promise<number>;
  save(resetPassword: ResetPasswordEntity): Promise<void>;
  invalidateActiveTokens(userId: string): Promise<void>;
  findAttemptByToken(token: string): Promise<ResetPasswordEntity | null>;
  useResetPasswordToken(token: string): Promise<void>;
}
