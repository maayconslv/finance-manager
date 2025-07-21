import { UserModel } from "@/application/model";
import { WalletModel } from "@/application/model/wallet.model";
import { UserEntity } from "@/domain/entities";
import { WalletEntity } from "@/domain/entities/wallet.entity";
import { expect } from "chai";

export function checkUser(user: UserModel, entity: UserEntity) {
  expect(user.id).to.be.equal(entity.userId);
  expect(user.name).to.be.equal(entity.name);
  expect(user.email).to.be.equal(entity.email.toString());
}

export function checkWallet(wallet: WalletModel, entity: WalletEntity) {
  expect(wallet.id).to.be.equal(entity.walletId);
  expect(wallet.currentBalance).to.be.equal(entity.currentBalance.toBRL());
  expect(wallet.initialBalance).to.be.equal(entity.initialBalance.toBRL());
  expect(wallet.userId).to.be.equal(entity.userId.toString());
}
