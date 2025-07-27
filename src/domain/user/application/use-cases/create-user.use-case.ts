import { Service } from "typedi";
import { ConflictError } from "@/domain/errors";
import { UserEntity } from "@/domain/user/enterprise/entities";
import { UserModel } from "../model";
import { CryptoService } from "@/domain/services/crypto.service";
import { BadRequestError } from "routing-controllers";
import { WalletEntity } from "@/domain/user/enterprise/entities/wallet.entity";
import { UserRepository, WalletRepository } from "@/infrastructure/database/prisma";

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
    const wallet = WalletEntity.createWithInitialBalance(user.id, initialBalance);

    await this.userRepository.save(user);
    await this.walletRepository.save(wallet);

    return {
      id: user.id,
      email: user.email.toString(),
      name: user.name,
      wallet: {
        id: wallet.id,
        userId: wallet.userId.toString(),
        currentBalance: wallet.currentBalance.toBRL(),
      },
    };
  }

  private validateUserPassword(password: string) {
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long");
    }
  }
}
