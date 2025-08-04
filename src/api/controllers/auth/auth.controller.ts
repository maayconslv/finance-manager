import { Controller, Post, Body, HttpCode } from "routing-controllers";
import { Service } from "typedi";
import { AuthenticatedUserModel, UserModel } from "@/domain/auth/application/model";
import { CreateUserUseCase } from "@/domain/auth/application/use-cases";
import { AuthenticateUseCase } from "@/domain/auth/application/use-cases/authenticate.use-case";
import { AuthenticateUserRequest, CreateUserRequest, ForgotPasswordRequest } from "./auth.dto";
import { ForgotPasswordUseCase } from "@/domain/auth/application/use-cases/forgot-password.use-case";

@Controller("/auth")
@Service()
export class AuthController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authenticateUserUseCase: AuthenticateUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
  ) {}

  @Post("/register")
  @HttpCode(201)
  async createUser(@Body() data: CreateUserRequest): Promise<UserModel> {
    return await this.createUserUseCase.execute(data);
  }

  @Post("/authenticate")
  @HttpCode(200)
  async authenticate(@Body() data: AuthenticateUserRequest): Promise<AuthenticatedUserModel> {
    return await this.authenticateUserUseCase.execute(data);
  }

  @Post("/password/forgot")
  async forgotPassword(@Body() { email }: ForgotPasswordRequest): Promise<string> {
    return await this.forgotPasswordUseCase.execute({ email });
  }
}
