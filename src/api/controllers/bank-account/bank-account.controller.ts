import { BankAccountModel, DeleteAccountModel } from "@/domain/Accounts/application/model";
import {
  DeleteAccountUseCase,
  GetAccountsUseCase,
  RegisterBankAccountUseCase,
  UpdateAccountUseCase,
} from "@/domain/Accounts/application/use-cases";
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { RegisterBankAccountRequest, UpdateBankAccountRequest } from "./bank-account.dto";
import { AuthMiddleware } from "@/api/middleware";
import { AuthorizedRequest } from "@/api/types";

@Controller("/accounts")
@Service()
export class BankAccountController {
  constructor(
    private readonly registerBankAccountUseCase: RegisterBankAccountUseCase,
    private readonly getAllAccountsUseCase: GetAccountsUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
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

  @Put("/:bankAccountId")
  @UseBefore(AuthMiddleware)
  async updateAccount(
    @Param("bankAccountId") bankAccountId: string,
    @Req() { user }: AuthorizedRequest,
    @Body() data: UpdateBankAccountRequest,
  ): Promise<BankAccountModel> {
    return await this.updateAccountUseCase.execute({ ...data, userId: user.userId, bankAccountId });
  }

  @Delete("/:bankAccountId")
  @UseBefore(AuthMiddleware)
  async DeleteAccountUseCase(
    @Param("bankAccountId") bankAccountId: string,
    @Req() { user }: AuthorizedRequest,
  ): Promise<DeleteAccountModel> {
    return await this.deleteAccountUseCase.execute({ bankAccountId, userId: user.userId });
  }
}
