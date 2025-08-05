import { BadRequestError } from "@/domain/errors";

export class Money {
  private value: number;

  constructor(value: string) {
    this.value = this.parseMoneyStringToCents(value);
  }

  /**
   * @description Convert the money to a decimal number
   * @returns The money in decimal format
   */
  public toDecimal(): number {
    return this.value / 100;
  }

  /**
   * @description Convert the money to a BRL string
   * @returns The money in BRL format
   */
  public toBRL(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
      .format(this.toDecimal())
      .replace(/\u00A0/g, " ");
  }

  /**
   * @description Convert the money to cents
   * @returns The money in cents
   */
  public getInCents(): number {
    return this.value;
  }

  /**
   * @description Adds the given amount to the current monetary value held by this object.
   * @param {number} value - The amount to deposit, in the smallest currency unit (e.g., cents).
   */
  public increaseAmount(value: number): void {
    this.value += value;
  }

  private parseMoneyStringToCents(value: string): number {
    const moneyRegex = /^(\d{1,3}(\.\d{3})*|\d+),\d{2}$/;

    if (!moneyRegex.test(value)) {
      throw new BadRequestError("Invalid money format. Use format like 12.398,90");
    }

    const normalizedValue = value.replace(/\./g, "").replace(",", ".");
    const moneyInNumber = parseFloat(normalizedValue);

    if (isNaN(moneyInNumber)) {
      throw new BadRequestError("Could not parse money string.");
    }

    return Math.round(moneyInNumber * 100);
  }

  /**
   * @description Create a Money instance from a value in cents
   * @param cents The amount in cents
   * @returns A new Money instance
   */
  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new BadRequestError("Cents value must be an integer");
    }

    const money = Object.create(Money.prototype);
    money.value = cents;
    return money;
  }
}
