import { Service } from "typedi";
import { CategoryEntity } from "../../enterprise";
import { UniqueEntityId } from "@/core/object-values";
import { UserRepository } from "@/infrastructure/database/prisma";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { CategoryModel } from "../model";
import { CategoryMapper } from "../mapper/finances.mapper";
import { CategoryRepository } from "@/infrastructure/database/prisma/category.prisma.repository";

export interface CreateCategoryUseCaseRequest {
  colorCode: string;
  name: string;
  userId: string;
}

@Service()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(data: CreateCategoryUseCaseRequest): Promise<CategoryModel> {
    console.log("entrou no use-case");
    console.log("data: ", data);
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new InternalServerError();
    }

    const category = CategoryEntity.create({
      colorCode: data.colorCode,
      name: data.name,
      userId: new UniqueEntityId(data.userId),
    });

    await this.categoryRepository.save(category);
    return CategoryMapper.toModel(category);
  }
}
