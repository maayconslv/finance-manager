import { expect } from 'chai';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/repositories'; 
import { CreateUserRequest } from '../../domain/entities';
import { ConflictError, ValidationError } from '../../domain/errors';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    // Mock do repositório
    mockUserRepository = {
      create: async () => ({
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findByEmail: async () => null,
      findById: async () => null,
    };

    
    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('deve criar um usuário com dados válidos', async () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = await createUserUseCase.execute(userData);

      expect(result).to.have.property('id');
      expect(result.email).to.equal(userData.email);
      expect(result.name).to.equal(userData.name);
      expect(result).to.not.have.property('password');
    });

    it('deve lançar erro quando email já existe', async () => {
      mockUserRepository.findByEmail = async () => ({
        id: 'existing-id',
        email: 'test@example.com',
        name: 'Existing User',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const userData: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      try {
        await createUserUseCase.execute(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ConflictError);
        expect(error.message).to.equal('Usuário com este email já existe');
        expect(error.statusCode).to.equal(409);
        expect(error.errorType).to.equal('CONFLICT');
      }
    });

    it('deve lançar erro quando email está vazio', async () => {
      const userData: CreateUserRequest = {
        email: '',
        name: 'Test User',
        password: 'password123',
      };

      try {
        await createUserUseCase.execute(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ValidationError);
        expect(error.message).to.equal('Email, nome e senha são obrigatórios');
        expect(error.statusCode).to.equal(422);
        expect(error.errorType).to.equal('VALIDATION_ERROR');
      }
    });

    it('deve lançar erro quando nome está vazio', async () => {
      const userData: CreateUserRequest = {email: 'test@example.com',
        name: '',
        password: 'password123',
      };

      try {
        await createUserUseCase.execute(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ValidationError);
        expect(error.message).to.equal('Email, nome e senha são obrigatórios');
        expect(error.statusCode).to.equal(422);
        expect(error.errorType).to.equal('VALIDATION_ERROR');
      }
    });

    it('deve lançar erro quando senha está vazia', async () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: '',
      };

      try {
        await createUserUseCase.execute(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ValidationError);
        expect(error.message).to.equal('Email, nome e senha são obrigatórios');
        expect(error.statusCode).to.equal(422);
        expect(error.errorType).to.equal('VALIDATION_ERROR');
      }
    });

    it('deve lançar erro quando senha tem menos de 6 caracteres', async () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: '12345',
      };

      try {
        await createUserUseCase.execute(userData);
        expect.fail('Deveria ter lançado um erro');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ValidationError);
        expect(error.message).to.equal('A senha deve ter pelo menos 6 caracteres');
        expect(error.statusCode).to.equal(422);
        expect(error.errorType).to.equal('VALIDATION_ERROR');
      }
    });
  });
}); 