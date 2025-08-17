import { BankAccountModel } from "@/domain/bank-account/application/model";
import { RegisterBankAccountUseCase } from "@/domain/bank-account/application/use-cases";
import { Body, Controller, HttpCode, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { RegisterBankAccountRequest } from "./bank-account.dto";
import { AuthMiddleware } from "@/api/middleware";
import { AuthorizedRequest } from "@/api/types";

@Controller("/bank-account")
@Service()
export class BankAccountController {
  constructor(private readonly registerBankAccountUseCase: RegisterBankAccountUseCase) {}

  @Post()
  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  async register(
    @Body() data: RegisterBankAccountRequest,
    @Req() request: AuthorizedRequest,
  ): Promise<BankAccountModel> {
    return await this.registerBankAccountUseCase.execute({ ...data, userId: request.user.userId });
  }
}
