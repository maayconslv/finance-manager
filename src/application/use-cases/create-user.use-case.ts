import { Service } from 'typedi';
import { CreateUserRequest, UserResponse } from '@/domain/entities/user.entity';
import { ConflictError, ValidationError } from '@/domain/errors';
import { UserRepository } from '@/infrastructure/database';

@Service()
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
  ) {}

  async execute(userData: CreateUserRequest): Promise<UserResponse> {
    this.validateUserData(userData);

    const userAlreadyExists = await this.userRepository.findByEmail(userData.email);
    if (userAlreadyExists) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await this.userRepository.create(userData);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private validateUserData(userData: CreateUserRequest) {
    const { email, name, password } = userData;

    if (!email || !name || !password) {
      throw new ValidationError('Email, name and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }
  }
} 