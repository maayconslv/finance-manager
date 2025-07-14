import { randomUUID } from "crypto";
import { ValidationError } from "../errors";

interface CreateUserProps {
  name: string;
  email: string;
  password: string;
}

interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _email: string;
  private readonly _password: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(user: UserProps) {
    this._name = user.name;
    this._email = user.email;
    this._password = user.password;
  }

  get id(): string {return this._id }
  get name(): string {return this._name }
  get email(): string {return this._email }
  get password(): string {return this._password }
  get createdAt(): Date {return this._createdAt }
  get updatedAt(): Date {return this._updatedAt }

  public static create(props: CreateUserProps): UserEntity {
    const { name, password, email } = props;
    
    if (!name) {
      throw new ValidationError('This field is required');
    }

    if (!email) {
      throw new ValidationError('This field is required');
    }

    if (!password) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    return new UserEntity({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  public static rebuild(user: UserProps): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }
  
}