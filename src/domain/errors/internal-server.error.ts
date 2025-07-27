import { BaseError } from "./base-error.error";

export class InternalServerError extends BaseError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER");
  }
}
