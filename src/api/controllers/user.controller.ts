import { Controller, Post, Body, HttpCode } from "routing-controllers";
import { Service } from "typedi";
import { CreateUserRequest } from "@/domain/user/application/dto";
import { UserModel } from "@/domain/user/application/model";
import { CreateUserUseCase } from "@/domain/user/application/use-cases";

@Controller("/users")
@Service()
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() data: CreateUserRequest): Promise<UserModel> {
    return await this.createUserUseCase.execute(data);
  }
}
