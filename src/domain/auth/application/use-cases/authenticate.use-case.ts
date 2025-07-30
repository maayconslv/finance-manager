import { CryptoService } from "@/domain/services/crypto.service";
import { UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { AuthenticatedUserModel } from "../model";
import { UnauthorizedError } from "@/domain/errors";
import jwt from "jsonwebtoken";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { UserMapper } from "../mapper/user.mapper";

interface AuthenticateUseCaseProps {
  email: string;
  password: string;
}

@Service()
export class AuthenticateUseCase {
  constructor(
    private userRepository: UserRepository,
    private walletRepository: WalletRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(data: AuthenticateUseCaseProps): Promise<AuthenticatedUserModel> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials. Please check your email and password.");
    }

    const password = await this.cryptoService.createHashWithSalt(data.password, user.salt);
    if (password !== user.password) {
      throw new UnauthorizedError("Invalid credentials. Please check your email and password.");
    }

    const wallet = await this.walletRepository.findByUserId(user.id);
    if (!wallet) {
      throw new InternalServerError("Wallet not found. Please contact support.");
    }

    const token = jwt.sign({ userId: user.id }, process.env["JWT_SECRET"]!, { expiresIn: "1h" });

    return UserMapper.toAuthenticatedUser(user, wallet, token);
  }
}
