import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values/unique-entity-id";

interface UserProps {
  name: string;
  email: string;
  password: string;
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

  public static create(props: UserProps, id?: UniqueEntityId): UserEntity {
    const user = new UserEntity(props, id);
    return user;
  }
}
