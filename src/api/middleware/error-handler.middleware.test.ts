import { expect } from "chai";
import { ErrorHandler } from "./error-handler.middleware";
import { Logger } from "@/infrastructure/logger";

describe("ErrorHandler - Middleware", () => {
  let errorHandler: ErrorHandler;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
    } as unknown as Logger;

    errorHandler = new ErrorHandler(mockLogger);
  });

  describe("error", () => {
    it("should be a valid instance", () => {
      expect(errorHandler).to.be.instanceOf(ErrorHandler);
    });

    it("should have the error method", () => {
      expect(errorHandler.error).to.be.a("function");
    });
  });
});
