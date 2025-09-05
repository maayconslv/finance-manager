import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserRequest {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Please provide a valid name" })
  name: string;

  @IsString({ message: "Please provide a valid password" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}

export class AuthenticateUserRequest {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Please provide a valid password" })
  password: string;
}

export class ForgotPasswordRequest {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;
}

export class UpdatePasswordRequest {
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}
