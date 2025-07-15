import { Service } from "typedi";
import { IUserRepository } from "@/domain/repositories";
import { NotFoundError } from "@/domain/errors";
import { UserModel } from "../model";

@Service()
export class FindUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserModel> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
