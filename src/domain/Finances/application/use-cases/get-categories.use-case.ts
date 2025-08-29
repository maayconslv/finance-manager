import { CategoryRepository } from "@/infrastructure/database/prisma/category.prisma.repository";
import { Service } from "typedi";
import { CategoryMapper } from "../mapper/finances.mapper";
import { CategoryModel } from "../model";

@Service()
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string): Promise<CategoryModel[]> {
    const categories = await this.categoryRepository.findByUserId(userId);

    return categories.map(CategoryMapper.toModel);
  }
}
