import { Controller, Post, Body, HttpCode } from "routing-controllers";
import { Service } from "typedi";
import { AuthenticatedUserModel, UserModel } from "@/domain/user/application/model";
import { CreateUserUseCase } from "@/domain/user/application/use-cases";
import { AuthenticateUseCase } from "@/domain/user/application/use-cases/authenticate.use-case";
import { AuthenticateUserRequest, CreateUserRequest } from "./user.dto";

@Controller("/users")
@Service()
export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authenticateUserUseCase: AuthenticateUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() data: CreateUserRequest): Promise<UserModel> {
    return await this.createUserUseCase.execute(data);
  }

  @Post("/authenticate")
  @HttpCode(200)
  async authenticate(@Body() data: AuthenticateUserRequest): Promise<AuthenticatedUserModel> {
    return await this.authenticateUserUseCase.execute(data);
  }
}
