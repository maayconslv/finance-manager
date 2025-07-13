import { Service, Container as TypeDIContainer } from 'typedi';
import { ILogger } from '@/infrastructure/logger';

@Service()
class MockLogger implements ILogger {
  info(message: string, meta?: any): void {
    console.log(`[TEST INFO] ${message}`, meta);
  }

  error(message: string, meta?: any): void {
    console.log(`[TEST ERROR] ${message}`, meta);
  }

  warn(message: string, meta?: any): void {
    console.log(`[TEST WARN] ${message}`, meta);
  }

  debug(message: string, meta?: any): void {
    console.log(`[TEST DEBUG] ${message}`, meta);
  }
}

export class TestContainer {
  static register(): void {
    TypeDIContainer.reset();

    TypeDIContainer.set<ILogger>('Logger', new MockLogger());
  }
}
