import { BankAccountRepository, UserRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { DeleteAccountModel } from "../model";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { UnauthorizedError } from "@/domain/errors";

export interface DeleteAccountUseCaseRequest {
  userId: string;
  bankAccountId: string;
}

@Service()
export class DeleteAccountUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async execute(data: DeleteAccountUseCaseRequest): Promise<DeleteAccountModel> {
    const user = await this.userRepository.findById(data.userId);
    const bankAccount = await this.bankAccountRepository.findById(data.bankAccountId);

    if (!user || !bankAccount) {
      throw new InternalServerError("The user or the bank account were not found. Please contact support.");
    }

    const accountBelongsUser = await this.bankAccountRepository.belongsToUser(bankAccount.id, user.id);
    if (!accountBelongsUser) {
      throw new UnauthorizedError("You don't have permission to disable this account.");
    }

    bankAccount.disable();
    await this.bankAccountRepository.save(bankAccount);

    return {
      message: "The bank account was successfully disabled.",
    };
  }
}
