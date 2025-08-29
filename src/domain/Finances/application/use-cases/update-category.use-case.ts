import { UserRepository } from "@/infrastructure/database/prisma";
import { CategoryRepository } from "@/infrastructure/database/prisma/category.prisma.repository";
import { Service } from "typedi";
import { CategoryModel } from "../model";
import { InternalServerError } from "@/domain/errors/internal-server.error";
import { NotFoundError } from "@/domain/errors";
import { CategoryMapper } from "../mapper/finances.mapper";

export interface UpdateCategoryUseCaseRequest {
  name: string;
  userId: string;
  categoryId: string;
}

@Service()
export class UpdateCategoryUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({ name, userId, categoryId }: UpdateCategoryUseCaseRequest): Promise<CategoryModel> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InternalServerError();
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError();
    }

    category.name = name;
    await this.categoryRepository.save(category);

    return CategoryMapper.toModel(category);
  }
}
