import { WalletModel } from "@/domain/Accounts/application/model";
import { UserModel } from "@/domain/Auth/application/model";
import { UserEntity, WalletEntity } from "@/domain/Auth/enterprise/entities";
import { expect } from "chai";

export function checkUser(user: UserModel, entity: UserEntity) {
  expect(user.id).to.be.equal(entity.id);
  expect(user.name).to.be.equal(entity.name);
  expect(user.email).to.be.equal(entity.email.toString());
}

export function checkWallet(wallet: WalletModel, entity: WalletEntity) {
  expect(wallet.id).to.be.equal(entity.id);
  expect(wallet.currentBalance).to.be.equal(entity.currentBalance.toBRL());
  expect(wallet.userId).to.be.equal(entity.userId.toString());
}
