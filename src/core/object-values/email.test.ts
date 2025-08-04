import { expect } from "chai";
import { Email } from "./email";
import { BadRequestError } from "@/domain/errors";

describe("Object Value - Email", () => {
  const validEmail = "test@test.com";

  it("should be able to create a new email", () => {
    const email = Email.create(validEmail);
    expect(email.toString()).to.be.equal("test@test.com");
    expect(email).to.be.an.instanceOf(Email);
  });

  it("should not be able to create a new email with an invalid email", () => {
    const invalidEmail = "test@test";
    expect(() => Email.create(invalidEmail)).to.throw(BadRequestError);
  });

  it("should not be able to create a new email with an empty email", () => {
    const emptyEmail = "";
    expect(() => Email.create(emptyEmail)).to.throw(BadRequestError);
  });
});
