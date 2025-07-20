import { UserModel } from "@/application/model";
import { UserEntity } from "@/domain/entities";
import { expect } from "chai";

export function checkUser(user: UserModel, entity: UserEntity) {
  expect(user).to.be.deep.equal({
    id: entity.userId,
    name: entity.name,
    email: entity.email,
  });
}
