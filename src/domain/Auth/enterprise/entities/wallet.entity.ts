import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { Money } from "@/core/object-values/money";

interface WalletProps {
  userId: UniqueEntityId;
  initialBalance: Money;
  currentBalance: Money;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class WalletEntity extends BaseEntity<WalletProps> {
  get initialBalance() {
    return this.props.initialBalance;
  }
  get currentBalance() {
    return this.props.currentBalance;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }
  get userId() {
    return this.props.userId.toString();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  set increaseAmountInCents(value: number) {
    this.currentBalance.increaseAmount(value);
  }

  static create(props: Optional<WalletProps, "createdAt">, id?: UniqueEntityId): WalletEntity {
    const wallet = new WalletEntity({ ...props, createdAt: new Date() }, id);
    return wallet;
  }

  static createWithInitialBalance(userId: string, initialBalance: string, id?: UniqueEntityId): WalletEntity {
    return new WalletEntity(
      {
        userId: new UniqueEntityId(userId),
        initialBalance: new Money(initialBalance),
        currentBalance: new Money(initialBalance),
        createdAt: new Date(),
      },
      id,
    );
  }
}
