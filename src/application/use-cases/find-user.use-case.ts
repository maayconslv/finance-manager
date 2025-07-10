import { Service } from 'typedi';
import { IUserRepository } from '@/domain/repositories';
import { UserResponse } from '@/domain/entities/user.entity';
import { NotFoundError } from '@/domain/errors';

@Service()
export class FindUserUseCase {
  constructor(
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 