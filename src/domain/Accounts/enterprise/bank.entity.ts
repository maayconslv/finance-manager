import { BaseEntity } from "@/core/entities/base-entity";
import { Money, UniqueEntityId } from "@/core/object-values";
import { Optional } from "@/core/types/optional";

interface BankAccountProps {
  bankName: string;
  accountName: string;
  initialBalance: Money;
  currentBalance: Money;
  createdAt: Date;
  updatedAt?: Date;
  walletId: UniqueEntityId;
  deletedAt?: Date;
}

export class BankAccountEntity extends BaseEntity<BankAccountProps> {
  get bankName() {
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

  set bankName(bankName: string) {
    this.props.bankName = bankName;
    this.props.updatedAt = new Date();
  }

  set accountName(accountName: string) {
    this.props.accountName = accountName;
    this.props.updatedAt = new Date();
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  disable() {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  get isDisable() {
    return this.props.deletedAt ? true : false;
  }

  static create(props: Optional<BankAccountProps, "createdAt">, id?: UniqueEntityId): BankAccountEntity {
    return new BankAccountEntity({ ...props, createdAt: new Date() }, id);
  }
}
