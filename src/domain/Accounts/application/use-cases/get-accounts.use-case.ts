import { NotFoundError } from "@/domain/errors";
import { Service } from "typedi";
import { UserAccountsModel } from "../model";
import { BankAccountMapper, WalletMapper } from "../mapper";
import { BankAccountRepository, UserRepository, WalletRepository } from "@/infrastructure/database/prisma";

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
      throw new NotFoundError("Usuário não foi encontrado");
    }

    const [bankAccounts, wallet] = await Promise.all([
      this.bankRepository.getMany(user.id),
      this.walletRepository.findByUserId(user.id),
    ]);

    if (!wallet) {
      throw new NotFoundError("Wallet not found.");
    }

    return {
      bankAccounts: bankAccounts.map(BankAccountMapper.toModel),
      wallet: WalletMapper.toModel(wallet),
    };
  }
}
