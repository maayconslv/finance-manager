import { Email, Money, UniqueEntityId } from "@/core/object-values";
import { CryptoService } from "@/domain/services/crypto.service";
import { ResetPasswordEntity, UserEntity, WalletEntity } from "@/domain/auth/enterprise/entities";
import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";

const cryptoService = new CryptoService();

interface CreateUserData {
  email: Email;
  name: string;
  password: string;
}

interface CreateWalletData {
  userId: string;
  initialBalance: Money;
  currentBalance: Money;
}

interface CreateResetPasswordData {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  userId: UniqueEntityId;
  invalidatedAt: Date | null;
  usedAt: Date | null;
}

export async function createUser(override: Partial<CreateUserData> = {}) {
  const salt = cryptoService.createSalt();
  const password = await cryptoService.createHashWithSalt(override.password ?? faker.internet.password(), salt);

  return UserEntity.create({
    name: faker.person.fullName(),
    email: override.email ?? Email.create(faker.internet.email()),
    password,
    salt,
  });
}

export async function createWallet(data: Partial<CreateWalletData>) {
  return WalletEntity.create({
    userId: new UniqueEntityId(data.userId),
    initialBalance: data.initialBalance ?? Money.fromCents(faker.number.int({ min: 1000, max: 10000 })),
    currentBalance: data.currentBalance ?? Money.fromCents(faker.number.int({ min: 1000, max: 10000 })),
  });
}

export async function createResetPassword(override: Partial<CreateResetPasswordData> = {}) {
  const token = override.token ?? cryptoService.createSalt();
  const hashToken = await cryptoService.createHash(token);

  return ResetPasswordEntity.create({
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    userId: new UniqueEntityId(randomUUID()),
    usedAt: null,
    invalidatedAt: null,
    ...override,
    token: hashToken,
  });
}
