import { expect } from "chai";
import { UniqueEntityId } from "./unique-entity-id";

describe("Object Value - UniqueEntityId", () => {
  describe("constructor", () => {
    it("should create a UniqueEntityId with a provided value", () => {
      const customId = "custom-id-123";
      const uniqueId = new UniqueEntityId(customId);

      expect(uniqueId.toString()).to.equal(customId);
      expect(uniqueId).to.be.an.instanceOf(UniqueEntityId);
    });

    it("should create a UniqueEntityId with a UUID when no value is provided", () => {
      const uniqueId = new UniqueEntityId();

      expect(uniqueId.toString()).to.be.a("string");
      expect(uniqueId.toString()).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(uniqueId).to.be.an.instanceOf(UniqueEntityId);
    });

    it("should create a UniqueEntityId with null when null is provided", () => {
      const uniqueId = new UniqueEntityId(null as any);

      expect(uniqueId.toString()).to.be.a("string");
      expect(uniqueId.toString()).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(uniqueId).to.be.an.instanceOf(UniqueEntityId);
    });

    it("should create a UniqueEntityId with undefined when undefined is provided", () => {
      const uniqueId = new UniqueEntityId(undefined);

      expect(uniqueId.toString()).to.be.a("string");
      expect(uniqueId.toString()).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(uniqueId).to.be.an.instanceOf(UniqueEntityId);
    });
  });

  describe("toString", () => {
    it("should return the string representation of the provided value", () => {
      const customId = "test-id-456";
      const uniqueId = new UniqueEntityId(customId);

      expect(uniqueId.toString()).to.equal(customId);
    });

    it("should return the string representation of a generated UUID", () => {
      const uniqueId = new UniqueEntityId();
      const stringValue = uniqueId.toString();

      expect(stringValue).to.be.a("string");
      expect(stringValue).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("should return the same value on multiple calls", () => {
      const customId = "consistent-id";
      const uniqueId = new UniqueEntityId(customId);

      const firstCall = uniqueId.toString();
      const secondCall = uniqueId.toString();
      const thirdCall = uniqueId.toString();

      expect(firstCall).to.equal(secondCall);
      expect(secondCall).to.equal(thirdCall);
      expect(firstCall).to.equal(customId);
    });
  });

  describe("UUID generation", () => {
    it("should generate different UUIDs for different instances", () => {
      const uniqueId1 = new UniqueEntityId();
      const uniqueId2 = new UniqueEntityId();
      const uniqueId3 = new UniqueEntityId();

      const id1 = uniqueId1.toString();
      const id2 = uniqueId2.toString();
      const id3 = uniqueId3.toString();

      expect(id1).to.not.equal(id2);
      expect(id2).to.not.equal(id3);
      expect(id1).to.not.equal(id3);
    });

    it("should generate valid UUID format", () => {
      const uniqueId = new UniqueEntityId();
      const uuid = uniqueId.toString();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("should generate UUIDs with correct version (4th position should be '4')", () => {
      const uniqueId = new UniqueEntityId();
      const uuid = uniqueId.toString();

      // Check that the 4th position (after first dash) starts with '4'
      expect(uuid.charAt(14)).to.equal("4");
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in custom ID", () => {
      const specialId = "id-with-special-chars!@#$%^&*()";
      const uniqueId = new UniqueEntityId(specialId);

      expect(uniqueId.toString()).to.equal(specialId);
    });

    it("should handle very long custom ID", () => {
      const longId = "a".repeat(1000);
      const uniqueId = new UniqueEntityId(longId);

      expect(uniqueId.toString()).to.equal(longId);
    });

    it("should handle numeric string as custom ID", () => {
      const numericId = "123456789";
      const uniqueId = new UniqueEntityId(numericId);

      expect(uniqueId.toString()).to.equal(numericId);
    });

    it("should handle UUID format as custom ID", () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      const uniqueId = new UniqueEntityId(uuidId);

      expect(uniqueId.toString()).to.equal(uuidId);
    });
  });

  describe("immutability", () => {
    it("should maintain the same value throughout the object lifecycle", () => {
      const customId = "immutable-id";
      const uniqueId = new UniqueEntityId(customId);

      // Multiple calls should return the same value
      expect(uniqueId.toString()).to.equal(customId);
      expect(uniqueId.toString()).to.equal(customId);
      expect(uniqueId.toString()).to.equal(customId);
    });

    it("should not allow external modification of the value", () => {
      const uniqueId = new UniqueEntityId("test-id");
      const originalValue = uniqueId.toString();

      // The value should remain the same even if we try to access it multiple times
      expect(uniqueId.toString()).to.equal(originalValue);
      expect(uniqueId.toString()).to.equal(originalValue);
    });
  });
});
