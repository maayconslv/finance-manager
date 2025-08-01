import { CryptoService } from "@/domain/services/crypto.service";
import { ResetPasswordRepository, UserRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { UniqueEntityId } from "@/core/object-values";
import { ResetPasswordEntity } from "../../enterprise/entities";
import { BadRequestError } from "@/domain/errors";

interface ForgotPasswordUseCaseRequest {
  email: string;
}

@Service()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly resetPasswordRepository: ResetPasswordRepository,
  ) {}

  async execute({ email }: ForgotPasswordUseCaseRequest): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (user) {
      const recentAttemptsByUser = await this.resetPasswordRepository.findRecentAttempts(user.id.toString());
      if (recentAttemptsByUser >= 3) {
        throw new BadRequestError("Too many attempts. Please try again later.");
      }

      const { hashToken } = await this.createResetPassword(user.id, "false-ip");
      await this.resetPasswordRepository.save(hashToken);

      // TODO: envia o email com o token;
    }

    return "Email sent successfully";
  }

  private async createResetPassword(
    userId: string,
    ipAddress: string,
  ): Promise<{ hashToken: ResetPasswordEntity; token: string }> {
    const resetToken = this.cryptoService.createSalt();
    const resetTokenHash = await this.cryptoService.createHash(resetToken);
    const resetPassword = ResetPasswordEntity.create({
      token: resetTokenHash,
      userId: new UniqueEntityId(userId),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      ipAddress,
    });

    return { hashToken: resetPassword, token: resetToken };
  }
}
