import { BankAccountModel } from "@/domain/bank-account/application/model";
import { RegisterBankAccountUseCase } from "@/domain/bank-account/application/use-cases";
import { Body, Controller, HttpCode, Param, Post } from "routing-controllers";
import { Service } from "typedi";
import { RegisterBankAccountRequest } from "./bank-account.dto";

@Controller("/bank-account")
@Service()
export class BankAccountController {
  constructor(private readonly registerBankAccountUseCase: RegisterBankAccountUseCase) {}

  @Post("/:userId")
  @HttpCode(201)
  async register(@Body() data: RegisterBankAccountRequest, @Param("userId") userId: string): Promise<BankAccountModel> {
    return await this.registerBankAccountUseCase.execute({ ...data, userId });
  }
}
