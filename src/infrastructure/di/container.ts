import { Container as TypeDIContainer } from 'typedi';
import { IUserRepository } from '@/domain/repositories/user.repository';
import { UserRepository } from '@/infrastructure/database/';
import { Logger } from '@/infrastructure/logger/logger';
import { CreateUserUseCase } from '@/application/use-cases';
import { UserController } from '@/api/controllers/user.controller';
import { ErrorHandler } from '@/api/middleware';

export class Container {
  static register(): void {
    // Registrar repositórios
    TypeDIContainer.set<IUserRepository>('IUserRepository', new UserRepository());

    // Registrar logger
    TypeDIContainer.set<Logger>('Logger', new Logger());

    // Registrar use cases
    TypeDIContainer.set<CreateUserUseCase>('CreateUserUseCase', new CreateUserUseCase(
      TypeDIContainer.get<IUserRepository>('IUserRepository'),
    ));

    // Registrar controllers
    TypeDIContainer.set<UserController>('UserController', new UserController(
      TypeDIContainer.get<CreateUserUseCase>('CreateUserUseCase')
    ));

    // Registrar middlewares
    TypeDIContainer.set<ErrorHandler>('ErrorHandler', new ErrorHandler(
      TypeDIContainer.get<Logger>('Logger')
    ));
  }
} 