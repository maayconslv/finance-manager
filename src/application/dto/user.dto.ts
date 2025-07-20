import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserRequest {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Please provide a valid name" })
  name: string;

  @IsString({ message: "Please provide a valid password" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  userPassword: string;
}

export interface CreateUserRequestDTO {
  email: string;
  name: string;
  password: string;
  salt: string;
}

export interface CreateUserDataDTO {
  id: string;
  email: string;
  name: string;
  password: string;
  salt: string;
  createdAt: Date;
}
