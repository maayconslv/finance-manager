import { Email, Money, UniqueEntityId } from "@/core/object-values";
import { CryptoService } from "@/domain/services/crypto.service";
import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";
import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { ResetPasswordEntity, UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { CategoryEntity, TransactionEntity, Type } from "@/domain/Finances/enterprise";

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

interface CreateBankAccountData {
  accountName: string;
  bankName: string;
  currentBalance: Money;
  initialBalance: Money;
  deletedAt?: Date;
  walletId: UniqueEntityId;
}

interface CreateTransactionData {
  amount: Money;
  bankAccountId: UniqueEntityId;
  category: CategoryEntity;
  description: string;
  type: Type;
  createdAt: Date;
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
  const amount = faker.number.int({ min: 1000, max: 10000 });

  return WalletEntity.create({
    userId: new UniqueEntityId(data.userId),
    initialBalance: data.initialBalance ?? Money.fromCents(amount),
    currentBalance: data.currentBalance ?? Money.fromCents(amount),
  });
}

export function createBankAccount(override: Partial<CreateBankAccountData>) {
  const initialBalance = faker.number.int({ min: 1000, max: 10000 });

  return BankAccountEntity.create({
    accountName: faker.person.firstName(),
    bankName: faker.person.firstName(),
    currentBalance: Money.fromCents(initialBalance),
    initialBalance: Money.fromCents(initialBalance),
    walletId: new UniqueEntityId(randomUUID()),
    ...override,
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

export function createTransaction(override: Partial<CreateTransactionData> = {}) {
  const amount = faker.number.int({ min: 1000, max: 10000 });
  const category = CategoryEntity.create({
    colorCode: "C1C1C1",
    name: faker.person.fullName(),
    userId: new UniqueEntityId(),
    createdAt: new Date(),
  });

  const transaction = TransactionEntity.create({
    amount: Money.fromCents(amount),
    bankAccountId: new UniqueEntityId(),
    category,
    description: faker.lorem.words(),
    type: Type.income,
    createdAt: new Date(),
    ...override,
  });

  return transaction;
}
