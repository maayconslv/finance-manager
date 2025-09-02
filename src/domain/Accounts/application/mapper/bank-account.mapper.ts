import { BankAccountModel } from "../model";
import { BankAccountEntity } from "../../enterprise";

export class BankAccountMapper {
  /**
   * @description Convert a BankAccountEntity to a BankAccountModel
   * @returns The bank account in BankAccountModel format
   */
  static toModel(entity: BankAccountEntity): BankAccountModel {
    return {
      id: entity.id,
      accountName: entity.accountName,
      bankName: entity.bankName,
      currentBalance: entity.currentBalance.toBRL(),
      initialBalance: entity.currentBalance.toBRL(),
      isDisable: entity.isDisable,
    };
  }
}
