import { UserModel } from "@/domain/user/application/model";
import { WalletModel } from "@/domain/user/application/model/wallet.model";
import { UserEntity } from "@/domain/user/enterprise/entities";
import { WalletEntity } from "@/domain/user/enterprise/entities/wallet.entity";
import { expect } from "chai";

export function checkUser(user: UserModel, entity: UserEntity) {
  expect(user.id).to.be.equal(entity.id);
  expect(user.name).to.be.equal(entity.name);
  expect(user.email).to.be.equal(entity.email.toString());
}

export function checkWallet(wallet: WalletModel, entity: WalletEntity) {
  expect(wallet.id).to.be.equal(entity.id);
  expect(wallet.currentBalance).to.be.equal(entity.currentBalance.toBRL());
  expect(wallet.initialBalance).to.be.equal(entity.initialBalance.toBRL());
  expect(wallet.userId).to.be.equal(entity.userId.toString());
}
