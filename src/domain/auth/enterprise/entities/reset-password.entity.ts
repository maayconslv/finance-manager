import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values";

interface ResetPasswordProps {
  token: string;
  userId?: UniqueEntityId | null;
  createdAt: Date;
  updatedAt?: Date | null;
  expiresAt: Date;
  invalidatedAt?: Date | null;
}

export class ResetPasswordEntity extends BaseEntity<ResetPasswordProps> {
  get token() {
    return this.props.token;
  }

  get userId() {
    return this.props.userId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get invalidatedAt() {
    return this.props.invalidatedAt ?? null;
  }

  set invalidatedAt(value: Date | null) {
    this.props.invalidatedAt = value;
  }

  public static create(props: ResetPasswordProps, id?: UniqueEntityId): ResetPasswordEntity {
    return new ResetPasswordEntity(props, id);
  }
}
