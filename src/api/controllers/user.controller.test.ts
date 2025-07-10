import { expect } from 'chai';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '@/application/use-cases';
import { CreateUserRequest } from '@/domain/entities';
import { ConflictError, ValidationError } from '@/domain/errors';

describe('UserController', () => {
  let userController: UserController;
  let mockCreateUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    // Mock do use case
    mockCreateUserUseCase = {
      execute: async () => ({
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as CreateUserUseCase;

    userController = new UserController(mockCreateUserUseCase);
  });

  describe('createUser', () => {
    it('deve criar um usuário com sucesso', async () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = await userController.createUser(userData);

      expect(result).to.have.property('id');
      expect(result.email).to.equal(userData.email);
      expect(result.name).to.equal(userData.name);
      expect(result).to.not.have.property('password');
    });

    it('deve lançar erro 409 quando usuário já existe', async () => {
      mockCreateUserUseCase.execute = async () => {
        throw new ConflictError('Usuário com este email já existe');
      };

      const userData: CreateUserRequest = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'password123',
      };

      try {
        await userController.createUser(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error.statusCode).to.equal(409);
        expect(error.message).to.equal('Usuário com este email já existe');
        expect(error.errorType).to.equal('CONFLICT');
      }
    });

    it('deve lançar erro 422 quando dados são inválidos', async () => {
      mockCreateUserUseCase.execute = async () => {
        throw new ValidationError('Email, nome e senha são obrigatórios');
      };

      const userData: CreateUserRequest = {
        email: '',
        name: '',
        password: '',
      };

      try {
        await userController.createUser(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error.statusCode).to.equal(422);
        expect(error.message).to.equal('Email, nome e senha são obrigatórios');
        expect(error.errorType).to.equal('VALIDATION_ERROR');
      }
    });
  });
}); 