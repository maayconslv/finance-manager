import "reflect-metadata";
import express from "express";
import { useContainer, useExpressServer } from "routing-controllers";
import Container from "typedi";
import { TestContainer as ContainerDI } from "./container.test";
import { Server } from "http";
import path from "node:path";
// import dotenv from "dotenv";

export class TestServer {
  private app: express.Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();

    this.setupMiddleware();
    this.setupControllers();
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
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else resolve();
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
      controllers: [path.join(__dirname, "../api/controllers/**/*.controller.ts")],
      middlewares: [path.join(__dirname, "../api/middleware/**/*.middleware.ts")],
      interceptors: [path.join(__dirname, "../api/controllers/**/*.interceptor.ts")],
      defaultErrorHandler: false,
      classTransformer: true,
      validation: true,
    });
  }
}
