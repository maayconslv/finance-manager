import { NotFoundError } from "@/domain/errors";
import { Service } from "typedi";
import { UserAccountsModel } from "../model";
import { BankAccountMapper, WalletMapper } from "../mapper";
import { BankAccountRepository, UserRepository, WalletRepository } from "@/infrastructure/database/prisma";
import { Money } from "@/core/object-values";

interface GetAllBankAccountsUseCaseRequest {
  userId: string;
}

@Service()
export class GetAccountsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bankRepository: BankAccountRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute({ userId }: GetAllBankAccountsUseCaseRequest): Promise<UserAccountsModel> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const wallet = await this.walletRepository.findByUserId(user.id);
    if (!wallet) {
      throw new NotFoundError("Wallet not found.");
    }

    const bankAccounts = await this.bankRepository.findManyByWalletId(wallet.id);

    const bankAccountsTotalAmount = bankAccounts.reduce((acc, account) => acc + account.currentBalance.getInCents(), 0)
    const walletTotalAmount = wallet.currentBalance.getInCents();
    const totalAmount = Money.fromCents(bankAccountsTotalAmount + walletTotalAmount);

    return {
      bankAccounts: bankAccounts.map(BankAccountMapper.toModel),
      wallet: WalletMapper.toModel(wallet),
      totalAmount: totalAmount.toBRL()
    };
  }
}
