import { expect } from 'chai';
import { ErrorHandler } from './error-handler.middleware';
import { Logger } from '@/infrastructure/logger';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
    } as unknown as Logger;

    errorHandler = new ErrorHandler(mockLogger);
  });

  describe('error', () => {
    it('deve ser uma instância válida', () => {
      expect(errorHandler).to.be.instanceOf(ErrorHandler);
    });

    it('deve ter o método error', () => {
      expect(errorHandler.error).to.be.a('function');
    });
  });
}); 