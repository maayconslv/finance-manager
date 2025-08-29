import { AuthMiddleware } from "@/api/middleware";
import { AuthorizedRequest } from "@/api/types";
import { CreateCategoryUseCase, CreateTransactionUseCase } from "@/domain/Finances/application/use-cases";
import { AccountTransactionsUseCase } from "@/domain/Finances/application/use-cases/account-transactions.use-case";
import { Body, Controller, Get, HttpCode, Param, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { CreateCategory, CreateTransactionRequest } from "./finances.dto";
import { OpenAPI } from "routing-controllers-openapi";

@Service()
@Controller("/finances")
export class FinancesController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly accountTransactionsUseCase: AccountTransactionsUseCase,
  ) {}

  @Post("/transaction/:bankAccountId")
  @HttpCode(201)
  @OpenAPI({ summary: "Record a transaction you made to a bank account" })
  @UseBefore(AuthMiddleware)
  async createTransaction(
    @Body() data: CreateTransactionRequest,
    @Req() request: AuthorizedRequest,
    @Param("bankAccountId") bankAccountId: string,
  ): Promise<any> {
    return await this.createTransactionUseCase.execute({ ...data, userId: request.user.userId, bankAccountId });
  }

  @Post("/category")
  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  async createCategory(@Body() data: CreateCategory, @Req() request: AuthorizedRequest): Promise<any> {
    return await this.createCategoryUseCase.execute({ ...data, userId: request.user.userId });
  }

  @Get("/:bankAccountId")
  @UseBefore(AuthMiddleware)
  async accountTransactions(
    @Param("bankAccountId") bankAccountId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<any> {
    return await this.accountTransactionsUseCase.execute({ bankAccountId, userId: request.user.userId });
  }
}
