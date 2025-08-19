import { Controller, Post, Body, HttpCode, Put, QueryParam } from "routing-controllers";
import { Service } from "typedi";

import { AuthenticateUserRequest, CreateUserRequest, ForgotPasswordRequest, UpdatePasswordRequest } from "./auth.dto";
import { AuthenticatedUserModel, UserModel } from "@/domain/Auth/application/model";
import {
  AuthenticateUseCase,
  CreateUserUseCase,
  ForgotPasswordUseCase,
  UpdatePasswordUseCase,
} from "@/domain/Auth/application/use-cases";

@Controller("/auth")
@Service()
export class AuthController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authenticateUserUseCase: AuthenticateUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
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

  @Put("/password")
  async updatePassword(@Body() { password }: UpdatePasswordRequest, @QueryParam("token") token: string) {
    return await this.updatePasswordUseCase.execute({ password, token });
  }
}
