import { Email, Money, UniqueEntityId } from "@/core/object-values";
import { CryptoService } from "@/domain/services/crypto.service";
import { UserEntity } from "@/domain/user/enterprise/entities";
import { WalletEntity } from "@/domain/user/enterprise/entities/wallet.entity";
import { faker } from "@faker-js/faker";

const cryptoService = new CryptoService();

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  salt: string;
}

interface CreateWalletData {
  userId: string;
  initialBalance: Money;
  currentBalance: Money;
}

export async function createUser(data: Partial<CreateUserData>) {
  const salt = data.salt ?? cryptoService.createSalt();
  const password = await cryptoService.createHashWithSalt(data.password ?? faker.internet.password(), salt);

  return UserEntity.create({
    name: data.name ?? faker.person.fullName(),
    email: Email.create(data.email ?? faker.internet.email()),
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
