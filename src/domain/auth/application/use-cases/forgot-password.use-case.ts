import { CryptoService } from "@/domain/services/crypto.service";
import { ResetPasswordRepository, UserRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { UniqueEntityId } from "@/core/object-values";
import { ResetPasswordEntity } from "../../enterprise/entities";
import { BadRequestError } from "@/domain/errors";
import { SendEmailService } from "@/domain/services/emails";
import ForgotPasswordTemplate from "@/domain/services/emails/templates/forgot-password.template";

interface ForgotPasswordUseCaseRequest {
  email: string;
}

@Service()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly resetPasswordRepository: ResetPasswordRepository,
    private readonly sendEmailService: SendEmailService,
  ) {}

  async execute({ email }: ForgotPasswordUseCaseRequest): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (user) {
      const recentAttemptsByUser = await this.resetPasswordRepository.findRecentAttempts(user.id.toString());
      if (recentAttemptsByUser >= 3) {
        throw new BadRequestError("Too many attempts. Please try again later.");
      }

      const { hashToken, token } = await this.createResetPassword(user.id);
      await this.resetPasswordRepository.save(hashToken);

      await this.sendEmailService.sendEmail({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Redefinição de senha",
        template: ForgotPasswordTemplate({ forgotPasswordToken: token }),
      });
    }

    return "Email sent successfully";
  }

  private async createResetPassword(userId: string): Promise<{ hashToken: ResetPasswordEntity; token: string }> {
    const resetToken = this.cryptoService.createSalt();
    const resetTokenHash = await this.cryptoService.createHash(resetToken);
    const resetPassword = ResetPasswordEntity.create({
      token: resetTokenHash,
      userId: new UniqueEntityId(userId),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      usedAt: null,
    });

    return { hashToken: resetPassword, token: resetToken };
  }
}
