import { Service } from "typedi";
import { BankAccountModel } from "../model";
import { BankAccountRepository, UserRepository } from "@/infrastructure/database/prisma";
import { BankAccountMapper } from "../mapper";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { UnauthorizedError } from "@/domain/errors";

export interface UpdateAccountUseCaseRequest {
  userId: string;
  bankAccountId: string;
  bankName?: string;
  accountName?: string;
}

@Service()
export class UpdateAccountUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async execute(input: UpdateAccountUseCaseRequest): Promise<BankAccountModel> {
    const user = await this.userRepository.findById(input.userId);
    const bankAccount = await this.bankAccountRepository.findById(input.bankAccountId);

    if (!user || !bankAccount) {
      throw new InternalServerError("The user or the bank account were not found. Please contact support.");
    }

    if (bankAccount.isDisable) {
      throw new UnauthorizedError("This bank account was disabled.");
    }

    bankAccount.bankName = input.bankName?.trim() || bankAccount.bankName;
    bankAccount.accountName = input.accountName || bankAccount.accountName;

    await this.bankAccountRepository.save(bankAccount);

    return BankAccountMapper.toModel(bankAccount);
  }
}
