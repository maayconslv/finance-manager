export interface BankAccountModel {
  id: string;
  accountName: string;
  bankName: string;
  initialBalance: string;
  currentBalance: string;
  isDisable: boolean;
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

export interface DeleteAccountModel {
  message: string;
}
