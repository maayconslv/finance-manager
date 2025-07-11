import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { Container as ContainerDI } from '@/infrastructure/di/container';
import { Logger } from '@/infrastructure/logger/logger';
import { ErrorHandler } from '@/api/middleware/error-handler.middleware';
import dotenv from 'dotenv';

class App {
  private app: express.Application;
  private logger: Logger;

  constructor() {
    this.app = express();
    this.logger = new Logger();
    this.setupMiddleware();
    this.setupControllers();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    });
    
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(limiter);

    // Configure JSON parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    this.logger.info('Middlewares successfully configured.');
  }

  private setupControllers(): void {
    ContainerDI.register();
    useContainer(Container);

    useExpressServer(this.app, {
      controllers: [__dirname + '/api/controllers/*.controller.ts'],
      middlewares: [__dirname + '/api/middleware/*.middleware.ts'],
      defaultErrorHandler: false,
      classTransformer: true,
      validation: true,
    });

    this.logger.info('Controllers successfully configured.');
  }

  private setupErrorHandling(): void {
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errorHandler = Container.get<ErrorHandler>('ErrorHandler');
      errorHandler.error(error, req, res, next);
    });

    this.logger.info('Error handling successfully configured.');
  }

  public start(): void {
    if (process.env['TEST'] === 'OK') {
      dotenv.config({ path: '.env.test' });
    } else {
      dotenv.config();
    }

    const port = process.env['PORT'] || 3000;

    this.app.listen(port, () => {
      this.logger.info(`Server started on port ${port}`);
      this.logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
    });
  }
}

const app = new App();
app.start(); 