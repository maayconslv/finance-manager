import { WalletRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { BankAccountModel } from "../model/accounts.model";
import { BankAccountEntity } from "../../enterprise";
import { Money, UniqueEntityId } from "@/core/object-values";
import { BankAccountRepository } from "@/infrastructure/database/prisma/bank-account.prisma.repository";
import { InternalServerError } from "@/domain/errors/internal-server.error";

interface RegisterBankAccountUseCaseRequest {
  bankName: string;
  accountName: string;
  amount: string;
  userId: string;
}

@Service()
export class RegisterBankAccountUseCase {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async execute(data: RegisterBankAccountUseCaseRequest): Promise<BankAccountModel> {
    const wallet = await this.walletRepository.findByUserId(data.userId);
    if (!wallet) {
      throw new InternalServerError("This user does not have an associated wallet.");
    }

    const bankAmount = new Money(data.amount);
    const bankAccount = BankAccountEntity.create({
      accountName: data.accountName,
      bankName: data.bankName,
      currentBalance: bankAmount,
      initialBalance: bankAmount,
      walletId: new UniqueEntityId(wallet.id),
    });

    wallet.increaseAmountInCents = bankAmount.getInCents();

    await this.walletRepository.save(wallet);
    await this.bankAccountRepository.save(bankAccount);

    return {
      id: bankAccount.id,
      accountName: bankAccount.accountName,
      bankName: bankAccount.name,
      currentBalance: bankAccount.currentBalance.toBRL(),
      initialBalance: bankAccount.initialBalance.toBRL(),
      walletId: wallet.id,
    };
  }
}
