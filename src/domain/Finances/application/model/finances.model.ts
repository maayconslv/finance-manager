import { BankAccountModel } from "@/domain/Accounts/application/model";

enum Type {
  income = "income",
  outcome = "outcome",
}

export interface TransactionModel {
  id: string;
  amount: string;
  type: Type;
  description: string;
  category: CategoryModel;
}

export interface CategoryModel {
  id: string;
  name: string;
  colorCode: string;
}

export interface AccountTransactionsModel {
  account: BankAccountModel;
  transactions: TransactionModel[];
}
