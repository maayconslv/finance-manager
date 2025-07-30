import { expect } from "chai";
import { Money } from "./money";
import { BadRequestError } from "@/domain/errors";

describe("Money - Object Value", () => {
  describe("constructor", () => {
    it("should create a Money instance with valid BRL format", () => {
      const money = new Money("1.234,56");
      expect(money.getInCents()).to.equal(123456);
    });

    it("should create a Money instance with simple format", () => {
      const money = new Money("123,45");
      expect(money.getInCents()).to.equal(12345);
    });

    it("should create a Money instance with large numbers", () => {
      const money = new Money("1.234.567,89");
      expect(money.getInCents()).to.equal(123456789);
    });

    it("should create a Money instance with zero cents", () => {
      const money = new Money("123,00");
      expect(money.getInCents()).to.equal(12300);
    });

    it("should throw BadRequestError for invalid format without comma", () => {
      expect(() => new Money("123.45")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });

    it("should throw BadRequestError for invalid format with wrong decimal places", () => {
      expect(() => new Money("123,4")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });

    it("should throw BadRequestError for invalid format with more than 2 decimal places", () => {
      expect(() => new Money("123,456")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });

    it("should throw BadRequestError for empty string", () => {
      expect(() => new Money("")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });

    it("should throw BadRequestError for string with letters", () => {
      expect(() => new Money("abc,12")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });

    it("should throw BadRequestError for format with wrong separator", () => {
      expect(() => new Money("123.45")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });

    it("should throw BadRequestError for format with multiple commas", () => {
      expect(() => new Money("123,45,67")).to.throw(BadRequestError, "Invalid money format. Use format like 12.398,90");
    });
  });

  describe("toDecimal", () => {
    it("should convert cents to decimal correctly", () => {
      const money = new Money("1.234,56");
      expect(money.toDecimal()).to.equal(1234.56);
    });

    it("should convert simple amount to decimal", () => {
      const money = new Money("123,45");
      expect(money.toDecimal()).to.equal(123.45);
    });

    it("should convert zero cents to decimal", () => {
      const money = new Money("123,00");
      expect(money.toDecimal()).to.equal(123.0);
    });

    it("should convert large amount to decimal", () => {
      const money = new Money("1.234.567,89");
      expect(money.toDecimal()).to.equal(1234567.89);
    });
  });

  describe("toBRL", () => {
    it("should format money as BRL currency", () => {
      const money = new Money("1.234,56");
      expect(money.toBRL()).to.equal("R$ 1.234,56");
    });

    it("should format simple amount as BRL", () => {
      const money = new Money("123,45");
      expect(money.toBRL()).to.equal("R$ 123,45");
    });

    it("should format zero cents as BRL", () => {
      const money = new Money("123,00");
      expect(money.toBRL()).to.equal("R$ 123,00");
    });

    it("should format large amount as BRL", () => {
      const money = new Money("1.234.567,89");
      expect(money.toBRL()).to.equal("R$ 1.234.567,89");
    });

    it("should format small amount as BRL", () => {
      const money = new Money("0,99");
      expect(money.toBRL()).to.equal("R$ 0,99");
    });
  });

  describe("getInCents", () => {
    it("should return the amount in cents", () => {
      const money = new Money("1.234,56");
      expect(money.getInCents()).to.equal(123456);
    });

    it("should return simple amount in cents", () => {
      const money = new Money("123,45");
      expect(money.getInCents()).to.equal(12345);
    });

    it("should return zero cents correctly", () => {
      const money = new Money("123,00");
      expect(money.getInCents()).to.equal(12300);
    });

    it("should return large amount in cents", () => {
      const money = new Money("1.234.567,89");
      expect(money.getInCents()).to.equal(123456789);
    });
  });

  describe("fromCents", () => {
    it("should create Money instance from cents", () => {
      const money = Money.fromCents(123456);
      expect(money.getInCents()).to.equal(123456);
      expect(money.toDecimal()).to.equal(1234.56);
      expect(money.toBRL()).to.equal("R$ 1.234,56");
    });

    it("should create Money instance from simple cents", () => {
      const money = Money.fromCents(12345);
      expect(money.getInCents()).to.equal(12345);
      expect(money.toDecimal()).to.equal(123.45);
      expect(money.toBRL()).to.equal("R$ 123,45");
    });

    it("should create Money instance from zero cents", () => {
      const money = Money.fromCents(12300);
      expect(money.getInCents()).to.equal(12300);
      expect(money.toDecimal()).to.equal(123.0);
      expect(money.toBRL()).to.equal("R$ 123,00");
    });

    it("should create Money instance from large cents", () => {
      const money = Money.fromCents(123456789);
      expect(money.getInCents()).to.equal(123456789);
      expect(money.toDecimal()).to.equal(1234567.89);
      expect(money.toBRL()).to.equal("R$ 1.234.567,89");
    });

    it("should throw BadRequestError for non-integer cents", () => {
      expect(() => Money.fromCents(123.45)).to.throw(BadRequestError, "Cents value must be an integer");
    });

    it("should throw BadRequestError for negative cents", () => {
      expect(() => Money.fromCents(-123)).to.throw(BadRequestError, "Cents value must be an integer");
    });

    it("should create Money instance from zero", () => {
      const money = Money.fromCents(0);
      expect(money.getInCents()).to.equal(0);
      expect(money.toDecimal()).to.equal(0);
      expect(money.toBRL()).to.equal("R$ 0,00");
    });
  });

  describe("edge cases", () => {
    it("should handle very small amounts", () => {
      const money = new Money("0,01");
      expect(money.getInCents()).to.equal(1);
      expect(money.toDecimal()).to.equal(0.01);
      expect(money.toBRL()).to.equal("R$ 0,01");
    });

    it("should handle amounts with trailing zeros", () => {
      const money = new Money("100,50");
      expect(money.getInCents()).to.equal(10050);
      expect(money.toDecimal()).to.equal(100.5);
      expect(money.toBRL()).to.equal("R$ 100,50");
    });

    it("should handle amounts with single digit before comma", () => {
      const money = new Money("1,23");
      expect(money.getInCents()).to.equal(123);
      expect(money.toDecimal()).to.equal(1.23);
      expect(money.toBRL()).to.equal("R$ 1,23");
    });

    it("should handle amounts with multiple thousands separators", () => {
      const money = new Money("1.234.567.890,12");
      expect(money.getInCents()).to.equal(123456789012);
      expect(money.toDecimal()).to.equal(1234567890.12);
      expect(money.toBRL()).to.equal("R$ 1.234.567.890,12");
    });
  });

  describe("rounding behavior", () => {
    it("should round correctly when parsing", () => {
      // This test verifies that the parsing doesn't introduce floating point errors
      const money = new Money("123,45");
      const fromCents = Money.fromCents(12345);

      expect(money.getInCents()).to.equal(fromCents.getInCents());
      expect(money.toDecimal()).to.equal(fromCents.toDecimal());
    });
  });
});
