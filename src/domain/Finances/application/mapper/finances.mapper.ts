import { CategoryEntity, TransactionEntity } from "../../enterprise";
import { CategoryModel, TransactionModel } from "../model/finances.model";

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

export class CategoryMapper {
  static toModel(entity: CategoryEntity): CategoryModel {
    return {
      id: entity.id,
      colorCode: entity.colorCode,
      name: entity.name,
    };
  }
}
