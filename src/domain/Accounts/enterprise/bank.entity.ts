import { BaseEntity } from "@/core/entities/base-entity";
import { Money, UniqueEntityId } from "@/core/object-values";
import { Optional } from "@/core/types/optional";

interface BankAccountProps {
  id?: UniqueEntityId;
  bankName: string;
  accountName: string;
  initialBalance: Money;
  currentBalance: Money;
  createdAt: Date;
  updatedAt?: Date;
  walletId: UniqueEntityId;
}

export class BankAccountEntity extends BaseEntity<BankAccountProps> {
  get name() {
    return this.props.bankName;
  }

  get accountName() {
    return this.props.accountName;
  }

  get initialBalance() {
    return this.props.initialBalance;
  }

  get currentBalance() {
    return this.props.currentBalance;
  }

  get walletId() {
    return this.props.walletId.toString();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<BankAccountProps, "createdAt">, id?: UniqueEntityId): BankAccountEntity {
    return new BankAccountEntity({ ...props, createdAt: new Date() }, id);
  }
}
