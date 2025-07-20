import crypto from "node:crypto";
import { Service } from "typedi";

@Service()
export class CryptoService {
  createSalt(length = 16): string {
    return crypto.randomBytes(length).toString("hex");
  }

  createHashWithSalt(value: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(value, salt, 64, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(derivedKey.toString("hex"));
      });
    });
  }

  createHash(value: string): Promise<string> {
    return new Promise((resolve) => {
      const hash = crypto.createHash("sha256");
      hash.update(value);
      resolve(hash.digest("hex"));
    });
  }
}
