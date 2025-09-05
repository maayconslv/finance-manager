import { NotFoundError } from "@/domain/errors";
import { Service } from "typedi";
import { UserAccountsModel } from "../model";
import { BankAccountMapper, WalletMapper } from "../mapper";
import { BankAccountRepository, WalletRepository } from "@/infrastructure/database/prisma";

interface GetAllBankAccountsUseCaseRequest {
  userId: string;
}

@Service()
export class GetAccountsUseCase {
  constructor(
    private readonly bankRepository: BankAccountRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute({ userId }: GetAllBankAccountsUseCaseRequest): Promise<UserAccountsModel> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    const bankAccounts = await this.bankRepository.findManyByWalletId(wallet.id);

    return {
      bankAccounts: bankAccounts.map(BankAccountMapper.toModel),
      wallet: WalletMapper.toModel(wallet),
    };
  }
}
