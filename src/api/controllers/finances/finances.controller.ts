import { AuthMiddleware } from "@/api/middleware";
import { AuthorizedRequest } from "@/api/types";
import {
  CreateCategoryUseCase,
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetCategoriesUseCase,
  UpdateCategoryUseCase,
  UpdateTransactionUseCase,
} from "@/domain/Finances/application/use-cases";
import { AccountTransactionsUseCase } from "@/domain/Finances/application/use-cases/account-transactions.use-case";
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import {
  CreateCategory,
  CreateTransactionRequest,
  UpdateCategoryRequest,
  UpdateTransactionRequest,
} from "./finances.dto";
import { OpenAPI } from "routing-controllers-openapi";
import { AccountTransactionsModel, CategoryModel, TransactionModel } from "@/domain/Finances/application/model";

@Service()
@Controller("/finances")
export class FinancesController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly accountTransactionsUseCase: AccountTransactionsUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
  ) {}

  @Post("/transaction/:bankAccountId")
  @HttpCode(201)
  @OpenAPI({
    summary: "Record a transaction you made to a bank account",
    security: [{ bearerAuth: [] }],
  })
  @UseBefore(AuthMiddleware)
  async createTransaction(
    @Body() data: CreateTransactionRequest,
    @Req() request: AuthorizedRequest,
    @Param("bankAccountId") bankAccountId: string,
  ): Promise<TransactionModel> {
    return await this.createTransactionUseCase.execute({ ...data, userId: request.user.userId, bankAccountId });
  }

  @Post("/category")
  @HttpCode(201)
  @OpenAPI({
    summary: "Record a transaction category",
    security: [{ bearerAuth: [] }],
  })
  @UseBefore(AuthMiddleware)
  async createCategory(@Body() data: CreateCategory, @Req() request: AuthorizedRequest): Promise<CategoryModel> {
    return await this.createCategoryUseCase.execute({ ...data, userId: request.user.userId });
  }

  @Get("/transactions/:bankAccountId")
  @UseBefore(AuthMiddleware)
  @OpenAPI({
    summary: "Get all account transactions",
    security: [{ bearerAuth: [] }],
  })
  async accountTransactions(
    @Param("bankAccountId") bankAccountId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<AccountTransactionsModel> {
    return await this.accountTransactionsUseCase.execute({ bankAccountId, userId: request.user.userId });
  }

  @Get("/categories")
  @UseBefore(AuthMiddleware)
  @OpenAPI({
    summary: "Get all categories created by the user",
    security: [{ bearerAuth: [] }],
  })
  async categories(@Req() request: AuthorizedRequest): Promise<CategoryModel[]> {
    return await this.getCategoriesUseCase.execute(request.user.userId);
  }

  @Put("/:transactionId")
  @UseBefore(AuthMiddleware)
  @OpenAPI({
    summary: "Update the user transaction",
    security: [{ bearerAuth: [] }],
  })
  async updateTransaction(
    @Param("transactionId") transactionId: string,
    @Req() request: AuthorizedRequest,
    @Body() data: UpdateTransactionRequest,
  ): Promise<TransactionModel> {
    return await this.updateTransactionUseCase.execute({ ...data, transactionId, userId: request.user.userId });
  }

  @Put("/:categoryId")
  @UseBefore(AuthMiddleware)
  @OpenAPI({
    summary: "Update the category name",
    security: [{ bearerAuth: [] }],
  })
  async updateCategory(
    @Param("categoryId") categoryId: string,
    @Req() request: AuthorizedRequest,
    @Body() data: UpdateCategoryRequest,
  ): Promise<CategoryModel> {
    return await this.updateCategoryUseCase.execute({ ...data, categoryId, userId: request.user.userId });
  }

  @Delete("/:transactionId")
  @UseBefore(AuthMiddleware)
  @OpenAPI({
    summary: "Delete a transaction",
    security: [{ bearerAuth: [] }],
  })
  async deleteTransaction(
    @Param("transactionId") transactionId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    return await this.deleteTransactionUseCase.execute({ transactionId, userId: request.user.userId });
  }
}
