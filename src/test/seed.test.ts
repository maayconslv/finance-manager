import { Email, Money, UniqueEntityId } from "@/core/object-values";
import { CryptoService } from "@/domain/services/crypto.service";
import { UserEntity } from "@/domain/user/enterprise/entities";
import { WalletEntity } from "@/domain/user/enterprise/entities/wallet.entity";
import { faker } from "@faker-js/faker";

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
