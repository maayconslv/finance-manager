import { BadRequestError } from "@/domain/errors";

export class Email {
  private value: string;

  private constructor(value: string) {
    this.validateEmail(value);
    this.value = value;
  }

  static create(value: string): Email {
    return new Email(value);
  }

  public toString() {
    return this.value;
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("Please, provide a valid email");
    }
  }
}
