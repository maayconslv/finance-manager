import { BankAccountEntity } from "@/domain/Accounts/enterprise";
import { CategoryEntity, TransactionEntity } from "../../enterprise";
import { AccountTransactionsModel, CategoryModel, TransactionModel } from "../model/finances.model";

export class TransactionMapper {
  static toModel(entity: TransactionEntity): TransactionModel {
    return {
      id: entity.id,
      amount: entity.amount.toBRL(),
      description: entity.description,
      type: entity.type,
      createdAt: entity.createdAt,
      category: {
        id: entity.category.id,
        colorCode: entity.category.colorCode,
        name: entity.category.name,
      },
    };
  }
}

export class AccountTransactionsMapper {
  static toModel(entity: TransactionEntity[], accountEntity: BankAccountEntity): AccountTransactionsModel {
    const transactions: TransactionModel[] = entity.map((item) => {
      return {
        id: item.id,
        amount: item.amount.toBRL(),
        type: item.type,
        description: item.description,
        createdAt: item.createdAt,
        category: {
          id: item.category.id,
          colorCode: item.category.colorCode,
          name: item.category.name,
        },
      };
    });

    return {
      account: {
        id: accountEntity.id,
        accountName: accountEntity.accountName,
        bankName: accountEntity.bankName,
        currentBalance: accountEntity.currentBalance.toBRL(),
        initialBalance: accountEntity.initialBalance.toBRL(),
        isDisabled: accountEntity.isDisable,
      },
      transactions,
    };
  }
}

export class CategoryMapper {
  static toModel(entity: CategoryEntity): CategoryModel {
    return {
      id: entity.id,
      colorCode: entity.colorCode,
      name: entity.name,
    };
  }
}
