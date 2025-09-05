import { BadRequestError, ConflictError } from "@/domain/errors";
import { CryptoService } from "@/domain/services/crypto.service";
import { UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { UserEntity, WalletEntity } from "../../enterprise/entities";
import { UserModel } from "../model";
import { Money, UniqueEntityId } from "@/core/object-values";

interface CreateUserUseCaseProps {
  name: string;
  email: string;
  password: string;
}

@Service()
export class CreateUserUseCase {
  constructor(
    private cryptoService: CryptoService,
    private userRepository: UserRepository,
    private walletRepository: WalletRepository,
    private readonly DEFAULT_BALANCE: string = "00,00",
  ) {}

  async execute({ email, name, password }: CreateUserUseCaseProps): Promise<UserModel> {
    this.validateUserPassword(password);

    const userAlreadyExists = await this.userRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new ConflictError("User with this email already exists");
    }

    const salt = this.cryptoService.createSalt();
    const passwordHash = await this.cryptoService.createHashWithSalt(password, salt);

    const user = UserEntity.createWithCredentials(email, name, passwordHash, salt);
    const wallet = WalletEntity.create({
      currentBalance: new Money(this.DEFAULT_BALANCE),
      initialBalance: new Money(this.DEFAULT_BALANCE),
      userId: new UniqueEntityId(user.id),
      createdAt: new Date(),
    });

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
