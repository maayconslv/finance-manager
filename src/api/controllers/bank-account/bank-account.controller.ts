import { BankAccountModel } from "@/domain/Accounts/application/model";
import { GetAccountsUseCase, RegisterBankAccountUseCase } from "@/domain/Accounts/application/use-cases";
import { Body, Controller, Get, HttpCode, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { RegisterBankAccountRequest } from "./bank-account.dto";
import { AuthMiddleware } from "@/api/middleware";
import { AuthorizedRequest } from "@/api/types";

@Controller("/accounts")
@Service()
export class BankAccountController {
  constructor(
    private readonly registerBankAccountUseCase: RegisterBankAccountUseCase,
    private readonly getAllAccountsUseCase: GetAccountsUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  async register(
    @Body() data: RegisterBankAccountRequest,
    @Req() request: AuthorizedRequest,
  ): Promise<BankAccountModel> {
    return await this.registerBankAccountUseCase.execute({ ...data, userId: request.user.userId });
  }

  @Get()
  @UseBefore(AuthMiddleware)
  async getAllAccounts(@Req() request: AuthorizedRequest) {
    return await this.getAllAccountsUseCase.execute({ userId: request.user.userId });
  }
}
