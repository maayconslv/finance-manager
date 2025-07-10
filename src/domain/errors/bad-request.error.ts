import { BaseError } from './base-error.error';

export class BadRequestError extends BaseError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
} 