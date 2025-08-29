import { BaseEntity } from "@/core/entities/base-entity";
import { Money, UniqueEntityId } from "@/core/object-values";
import { Optional } from "@/core/types/optional";
import { CategoryEntity } from "./category.entity";

export enum Type {
  income = "income",
  outcome = "outcome",
}

interface TransactionProps {
  amount: Money;
  type: Type;
  description: string;
  category: CategoryEntity;
  bankAccountId: UniqueEntityId;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class TransactionEntity extends BaseEntity<TransactionProps> {
  get amount() {
    return this.props.amount;
  }

  get type() {
    return this.props.type;
  }

  get description() {
    return this.props.description;
  }

  get category() {
    return this.props.category;
  }

  get bankAccountId() {
    return this.props.bankAccountId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  set amount(amount: Money) {
    this.props.updatedAt = new Date();
    this.props.amount = amount;
  }

  set type(type: Type) {
    this.props.updatedAt = new Date();
    this.props.type = type;
  }

  set description(description: string) {
    this.props.updatedAt = new Date();
    this.props.description = description;
  }

  set category(category: CategoryEntity) {
    this.props.updatedAt = new Date();
    this.props.category = category;
  }

  static create(props: Optional<TransactionProps, "createdAt">, id?: UniqueEntityId) {
    return new TransactionEntity({ ...props, createdAt: new Date() }, id);
  }
}
