export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
