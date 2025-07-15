import { BaseError } from "./base-error.error";

export class ConflictError extends BaseError {
  constructor(message: string = "Conflict error") {
    super(message, 409, "CONFLICT");
  }
}
