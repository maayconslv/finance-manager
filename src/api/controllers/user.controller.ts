import { Controller, Post, Body, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import { CreateUserUseCase } from '@/application/use-cases';
import { CreateUserRequest, UserResponse } from '@/domain/entities/user.entity';

@Controller('/users')
@Service()
export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() userData: CreateUserRequest): Promise<UserResponse> {
    return await this.createUserUseCase.execute(userData);
  }
}
