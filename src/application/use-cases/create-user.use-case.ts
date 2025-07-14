import { Service } from 'typedi';
import { ConflictError } from '@/domain/errors';
import { UserRepository } from '@/infrastructure/database';
import { UserEntity } from '@/domain/entities';
import { UserModel } from '../model';

interface CreateUserUseCaseProps {
  name: string;
  email: string;
  password: string;
}

@Service()
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
  ) {}

  async execute(userData: CreateUserUseCaseProps): Promise<UserModel> {
    const userAlreadyExists = await this.userRepository.findByEmail(userData.email);
    if (userAlreadyExists) {
      throw new ConflictError('User with this email already exists');
    }

    const user = UserEntity.create(userData);
    await this.userRepository.save({ email: user.email, name: user.name, password: user.password });
  
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
} 