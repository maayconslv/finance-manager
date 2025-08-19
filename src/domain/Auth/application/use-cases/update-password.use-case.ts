import { BadRequestError } from "@/domain/errors";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { CryptoService } from "@/domain/services/crypto.service";
import { ResetPasswordRepository, UserRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { ResetPasswordEntity } from "../../enterprise/entities";
import { UpdatePasswordModel } from "../model";

interface UpdatePasswordUseCaseRequest {
  token: string;
  password: string;
}

@Service()
export class UpdatePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetPasswordRepository: ResetPasswordRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute({ token, password }: UpdatePasswordUseCaseRequest): Promise<UpdatePasswordModel> {
    this.validateUserPassword(password);

    const resetPasswordHashToken = await this.cryptoService.createHash(token);
    const resetPasswordUserAttempt = await this.resetPasswordRepository.findAttemptByToken(resetPasswordHashToken);

    this.validateUserAttempt(resetPasswordUserAttempt);

    const userUpdatingPassword = await this.userRepository.findById(resetPasswordUserAttempt!.userId.toString());
    if (!userUpdatingPassword) {
      throw new InternalServerError("User not found.");
    }

    const salt = this.cryptoService.createSalt();
    const passwordHash = await this.cryptoService.createHashWithSalt(password, salt);

    await Promise.all([
      this.userRepository.updatePassword({ id: userUpdatingPassword.id, passwordHash, salt }),
      this.resetPasswordRepository.useResetPasswordToken(resetPasswordHashToken),
      this.resetPasswordRepository.invalidateActiveTokens(userUpdatingPassword.id),
    ]);

    return {
      message: "Password updated successfully.",
    };
  }

  private validateUserAttempt(userAttempt: ResetPasswordEntity | null) {
    const now = new Date();
    if (!userAttempt || userAttempt.invalidatedAt) {
      throw new BadRequestError("Invalid link. Please make a new reset request.");
    }

    if (userAttempt.usedAt) {
      throw new BadRequestError("This link has already been used. Request a new one if necessary.");
    }

    if (now > userAttempt.expiresAt) {
      throw new BadRequestError("This link has expired. Request a new reset link.");
    }
  }

  private validateUserPassword(password: string) {
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long");
    }
  }
}
