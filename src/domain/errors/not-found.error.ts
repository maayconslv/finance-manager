import { BaseError } from './base-error.error';

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
} 