import { Container as TypeDIContainer } from 'typedi';
import { IUserRepository } from '@/domain/repositories/user.repository';
import { UserRepository } from '@/infrastructure/database/';
import { Logger } from '@/infrastructure/logger/logger';
import { CreateUserUseCase } from '@/application/use-cases';
import { UserController } from '@/api/controllers/user.controller';
import { ErrorHandler } from '@/api/middleware';

class TestLogger extends Logger {
  override info(): void {}
  override error(): void {}
  override warn(): void {}
  override debug(): void {}
}

export class TestContainer {
  static register(): void {
    TypeDIContainer.reset();

    TypeDIContainer.set<IUserRepository>('UserRepository', new UserRepository());

    TypeDIContainer.set<Logger>('Logger', new TestLogger());

    TypeDIContainer.set<CreateUserUseCase>('CreateUserUseCase', new CreateUserUseCase(
      TypeDIContainer.get<IUserRepository>('UserRepository'),
    ));

    TypeDIContainer.set<UserController>('UserController', new UserController(
      TypeDIContainer.get<CreateUserUseCase>('CreateUserUseCase')
    ));

    TypeDIContainer.set<ErrorHandler>('ErrorHandler', new ErrorHandler(
      TypeDIContainer.get<Logger>('Logger')
    ));
  }
}