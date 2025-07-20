import { Service } from "typedi";
import { ConflictError } from "@/domain/errors";
import { UserRepository } from "@/infrastructure/database";
import { UserEntity } from "@/domain/entities";
import { UserModel } from "../model";
import { CryptoService } from "@/domain/services/crypto.service";
import { BadRequestError } from "routing-controllers";
import { WalletRepository } from "@/infrastructure/database/wallet.prisma.repository";
import { WalletEntity } from "@/domain/entities/wallet.entity";

interface CreateUserUseCaseProps {
  name: string;
  email: string;
  userPassword: string;
  initialBalance: string;
}

@Service()
export class CreateUserUseCase {
  constructor(
    private cryptoService: CryptoService,
    private userRepository: UserRepository,
    private walletRepository: WalletRepository,
  ) {}

  async execute({ email, name, userPassword, initialBalance }: CreateUserUseCaseProps): Promise<UserModel> {
    this.validateUserPassword(userPassword);

    const userAlreadyExists = await this.userRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new ConflictError("User with this email already exists");
    }

    const salt = this.cryptoService.createSalt();
    const password = await this.cryptoService.createHashWithSalt(userPassword, salt);

    const user = UserEntity.createWithCredentials(email, name, password, salt);
    const wallet = WalletEntity.createWithInitialBalance(user.userId, initialBalance);

    await this.userRepository.save(user.toDTO());
    await this.walletRepository.save(wallet.toDTO());

    return {
      id: user.userId,
      email: user.email,
      name: user.name,
      wallet: {
        id: wallet.walletId,
        initialBalance: wallet.initialBalance.toBRL(),
        currentBalance: wallet.currentBalance.toBRL(),
        createdAt: wallet.createdAt,
      },
    };
  }

  private validateUserPassword(password: string) {
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 8 characters long");
    }
  }
}
