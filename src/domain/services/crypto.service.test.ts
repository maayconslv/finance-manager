import Container from "typedi";
import { CryptoService } from "./crypto.service";
import { expect } from "chai";

describe("teste do crypto", () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = Container.get(CryptoService);
  });

  describe("Create Salt", () => {
    it("should create a salt with the default length", () => {
      const salt = cryptoService.createSalt();
      expect(salt).to.be.a("string");
      expect(salt).to.have.lengthOf(32);
    });

    it("should create a salt with the custom length", () => {
      const salt = cryptoService.createSalt(32);
      expect(salt).to.be.a("string");
      expect(salt).to.have.lengthOf(64);
    });
  });

  describe("Create Hash with Salt", () => {
    it("should create a hash with salt", async () => {
      const hash = await cryptoService.createHashWithSalt("12345121213123812381937128371983719283796", "salt");
      expect(hash).to.be.a("string");
      expect(hash).to.have.lengthOf(128);
    });

    it("should create a hash with salt with the custom length", async () => {
      const hash = await cryptoService.createHashWithSalt("123456", "salt");
      expect(hash).to.be.a("string");
      expect(hash).to.have.lengthOf(128);
    });
  });

  describe("Create Hash", () => {
    it("should create a hash", async () => {
      const hash = await cryptoService.createHash("123456");
      expect(hash).to.be.a("string");
      expect(hash).to.have.lengthOf(64);
    });
  });
});
