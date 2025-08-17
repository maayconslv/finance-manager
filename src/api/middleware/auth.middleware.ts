import { Request, Response, NextFunction } from "express";
import { Inject, Service } from "typedi";
import { UnauthorizedError } from "@/domain/errors";
import { ILogger } from "@/infrastructure/logger";
import jwt from "jsonwebtoken";
import { ExpressMiddlewareInterface } from "routing-controllers";

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

@Service()
export class AuthMiddleware implements ExpressMiddlewareInterface {
  constructor(@Inject("Logger") private logger: ILogger) {}

  use(request: Request, _response: Response, next: NextFunction): void {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedError("Authorization header is required");
      }

      const token = authHeader.replace("Bearer ", "");

      if (!token) {
        throw new UnauthorizedError("Token is required");
      }

      if (!process.env["JWT_SECRET"]) {
        this.logger.error("JWT_SECRET environment variable is not defined");
        throw new UnauthorizedError("Authentication service is not properly configured");
      }

      const decoded = jwt.verify(token, process.env["JWT_SECRET"]) as JWTPayload;

      request.user = {
        userId: decoded.userId,
      };

      next();
    } catch (error) {
      this.logger.warn("Authentication failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        url: request.url,
        method: request.method,
        ip: request.ip,
      });

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid token");
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token has expired");
      }

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Authentication failed");
    }
  }
}
