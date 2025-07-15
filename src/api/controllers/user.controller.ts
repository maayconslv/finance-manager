import { Controller, Post, Body, HttpCode } from "routing-controllers";
import { Service } from "typedi";
import { CreateUserUseCase } from "@/application/use-cases";
import { CreateUserRequest } from "@/application/dto";
import { UserModel } from "@/application/model";

@Controller("/users")
@Service()
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() userData: CreateUserRequest): Promise<{ data: UserModel }> {
    return { data: await this.createUserUseCase.execute(userData) };
  }
}
