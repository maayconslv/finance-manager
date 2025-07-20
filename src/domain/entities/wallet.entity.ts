import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface WalletProps {
  userId: UniqueEntityId;
  initialBalance: number;
  currentBalance: number;
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
    return this.props.userId;
  }

  get walletId() {
    return this.id.toString();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<WalletProps, "createdAt">, id?: UniqueEntityId): WalletEntity {
    const wallet = new WalletEntity({ ...props, createdAt: new Date() }, id);
    return wallet;
  }
}
