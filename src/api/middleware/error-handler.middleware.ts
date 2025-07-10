import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@/infrastructure/logger/logger';
import { Service } from 'typedi';
import { BaseError } from '@/domain/errors';

@Middleware({ type: 'after' })
@Service()
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  constructor(private logger: Logger) {}

  error(error: any, request: Request, response: Response, next: NextFunction): void {
    this.logger.error('Error caught by middleware', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      ip: request.ip,
    });

    if (response.headersSent) {
      return next(error);
    }

    if (error instanceof BaseError) {
      const errorResponse = {
        message: error.message,
        errorType: error.errorType,
        statusCode: error.statusCode,
        ...(process.env['NODE_ENV'] !== 'production' && { stack: error.stack }),
      };

      response.status(error.statusCode).json(errorResponse);
      return;
    }

    if (error.httpCode) {
      const errorResponse = {
        message: error.message || 'Erro da aplicação',
        errorType: 'HTTP_ERROR',
        statusCode: error.httpCode,
        ...(process.env['NODE_ENV'] !== 'production' && { stack: error.stack }),
      };

      response.status(error.httpCode).json(errorResponse);
      return;
    }

    const isProduction = process.env['NODE_ENV'] === 'production';
    const errorResponse = {
      message: isProduction ? 'Internal server error' : error.message,
      errorType: 'INTERNAL_ERROR',
      statusCode: 500,
      ...(isProduction ? {} : { stack: error.stack }),
    };

    response.status(500).json(errorResponse);
  }
} 