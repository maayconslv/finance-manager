import { BankAccountModel } from "../model";
import { BankAccountEntity } from "../../enterprise";

export class BankAccountMapper {
  static toModel(entity: BankAccountEntity): BankAccountModel {
    return {
      id: entity.id,
      accountName: entity.accountName,
      bankName: entity.name,
      currentBalance: entity.currentBalance.toBRL(),
      initialBalance: entity.currentBalance.toBRL(),
    };
  }
}
