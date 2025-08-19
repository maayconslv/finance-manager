import { Service } from "typedi";
import { BadRequestError, ConflictError } from "@/domain/errors";
import { UserModel } from "../model";
import { CryptoService } from "@/domain/services/crypto.service";
import { UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { UserEntity, WalletEntity } from "../../enterprise/entities";

interface CreateUserUseCaseProps {
  name: string;
  email: string;
  password: string;
  initialBalance: string;
}

@Service()
export class CreateUserUseCase {
  constructor(
    private cryptoService: CryptoService,
    private userRepository: UserRepository,
    private walletRepository: WalletRepository,
  ) {}

  async execute({ email, name, password, initialBalance }: CreateUserUseCaseProps): Promise<UserModel> {
    this.validateUserPassword(password);

    const userAlreadyExists = await this.userRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new ConflictError("User with this email already exists");
    }

    const salt = this.cryptoService.createSalt();
    const passwordHash = await this.cryptoService.createHashWithSalt(password, salt);

    const user = UserEntity.createWithCredentials(email, name, passwordHash, salt);
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
