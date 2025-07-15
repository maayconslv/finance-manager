import { BaseError } from "./base-error.error";

export class ForbiddenError extends BaseError {
  constructor(message: string = "Forbidden access") {
    super(message, 403, "FORBIDDEN");
  }
}
