import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";

interface WalletProps {
  id: UniqueEntityId;
  name: string;
  initialBalance: number;
  currentBalance: number;
  deletedAt?: Date;
}

export class WalletEntity extends BaseEntity<WalletProps> {
  get name() {
    return this.props.name;
  }
  get initialBalance() {
    return this.props.initialBalance;
  }
  get currentBalance() {
    return this.props.currentBalance;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(props: WalletProps, id?: UniqueEntityId): WalletEntity {
    const wallet = new WalletEntity(props, id);
    return wallet;
  }
}
