export interface BankAccountModel {
  id: string;
  accountName: string;
  bankName: string;
  initialBalance: string;
  currentBalance: string;
}

export interface WalletModel {
  id: string;
  userId: string;
  currentBalance: string;
}

export interface UserAccountsModel {
  bankAccounts: BankAccountModel[];
  wallet: WalletModel;
}
