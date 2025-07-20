import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface UserProps {
  name: string;
  email: string;
  password: string;
  salt: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class UserEntity extends BaseEntity<UserProps> {
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get password() {
    return this.props.password;
  }

  get userId() {
    return this.id.toString();
  }

  get salt() {
    return this.props.salt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  public static create(props: Optional<UserProps, "createdAt">, id?: UniqueEntityId): UserEntity {
    return new UserEntity({ ...props, createdAt: new Date() }, id);
  }
}
