import { Service } from "typedi";
import { ConflictError } from "@/domain/errors";
import { UserRepository } from "@/infrastructure/database";
import { UserEntity } from "@/domain/entities";
import { UserModel } from "../model";
import { CryptoService } from "@/domain/services/crypto.service";
import { BadRequestError } from "routing-controllers";

interface CreateUserUseCaseProps {
  name: string;
  email: string;
  userPassword: string;
}

@Service()
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ email, name, userPassword }: CreateUserUseCaseProps): Promise<UserModel> {
    this.validateUserPassword(userPassword);

    const userAlreadyExists = await this.userRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new ConflictError("User with this email already exists");
    }

    const salt = this.cryptoService.createSalt();
    const password = await this.cryptoService.createHashWithSalt(userPassword, salt);

    const user = UserEntity.create({ email, name, password, salt });
    await this.userRepository.save({
      id: user.userId,
      email: user.email,
      name: user.name,
      password: user.password,
      salt: user.salt,
      createdAt: user.createdAt,
    });

    return {
      id: user.userId,
      email: user.email,
      name: user.name,
    };
  }

  private validateUserPassword(password: string) {
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 8 characters long");
    }
  }
}
