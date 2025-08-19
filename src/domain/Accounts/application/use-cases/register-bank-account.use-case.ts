import { WalletRepository } from "@/infrastructure/database/prisma";
import { Service } from "typedi";
import { BankAccountModel } from "../model/accounts.model";
import { BankAccountEntity } from "../../enterprise";
import { Money, UniqueEntityId } from "@/core/object-values";
import { BankAccountRepository } from "@/infrastructure/database/prisma/bank-account.prisma.repository";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { BankAccountMapper } from "../mapper";

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

    const initialBalance = new Money(data.amount);
    const currentBalance = new Money(data.amount);
    const bankAccount = BankAccountEntity.create({
      accountName: data.accountName,
      bankName: data.bankName,
      currentBalance,
      initialBalance,
      walletId: new UniqueEntityId(wallet.id),
    });

    wallet.increaseAmountInCents = initialBalance.getInCents();

    await Promise.all([this.walletRepository.save(wallet), this.bankAccountRepository.save(bankAccount)]);

    return BankAccountMapper.toModel(bankAccount);
  }
}
