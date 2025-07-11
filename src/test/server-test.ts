import 'reflect-metadata';
import express from 'express';
import { useContainer, useExpressServer } from 'routing-controllers';
import Container from 'typedi';
import { Container as ContainerDI } from '@/infrastructure/di/container';
import { ErrorHandler } from '@/api/middleware';
import { Server } from 'http';
import path from 'node:path';

export class TestServer {
  private app: express.Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupControllers();
    this.setupErrorHandling();
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(3000, () => {
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close(err => {
          if (err) {
            reject(err);
          }
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupControllers(): void {
    ContainerDI.register();
    useContainer(Container);

    useExpressServer(this.app, {
      controllers: [path.join(__dirname, '../api/controllers/*.controller.ts')],
      middlewares: [path.join(__dirname, '../api/middleware/*.middleware.ts')],
      defaultErrorHandler: false,
      classTransformer: true,
      validation: true,
    });

  }

  private setupErrorHandling(): void {
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errorHandler = Container.get<ErrorHandler>('ErrorHandler');
      errorHandler.error(error, req, res, next);
    });
  }
}