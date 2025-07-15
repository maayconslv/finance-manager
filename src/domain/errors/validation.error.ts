import { BaseError } from "./base-error.error";

export class ValidationError extends BaseError {
  constructor(message: string = "Invalid data") {
    super(message, 422, "VALIDATION_ERROR");
  }
}
