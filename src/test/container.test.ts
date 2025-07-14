import { Service, Container as TypeDIContainer } from 'typedi';
import { ILogger } from '@/infrastructure/logger';

@Service()
class TestLogger implements ILogger {
  info(_message: string, _meta?: any): void {}

  error(_message: string, _meta?: any): void {}

  warn(_message: string, _meta?: any): void {}

  debug(_message: string, _meta?: any): void {}
}

export class TestContainer {
  static register(): void {
    TypeDIContainer.reset();

    TypeDIContainer.set<ILogger>('Logger', new TestLogger());
  }
}
