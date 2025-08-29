import { ICategoryRepository } from "@/domain/Finances/application/repositories";
import { CategoryEntity } from "@/domain/Finances/enterprise";
import { Categories, PrismaClient } from "@prisma/client";
import { Service } from "typedi";
import { datasource } from "../database.config";
import { UniqueEntityId } from "@/core/object-values";

@Service()
export class CategoryRepository implements ICategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = datasource;
  }

  async save(data: CategoryEntity): Promise<void> {
    await this.prisma.categories.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        colorCode: data.colorCode,
        name: data.name,
        createdAt: data.createdAt,
        userId: data.userId.toString(),
      },
      update: {
        id: data.id,
        colorCode: data.colorCode,
        name: data.name,
        updatedAt: data.updatedAt ?? new Date(),
      },
    });
  }

  async delete(categoryId: string): Promise<void> {
    await this.prisma.categories.delete({
      where: { id: categoryId },
    });
  }

  async findById(categoryId: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return null;
    }

    return this.serializeCategory(category);
  }

  async findByUserId(userId: string): Promise<CategoryEntity[]> {
    const categories = await this.prisma.categories.findMany({
      where: { userId },
    });

    return categories.map(this.serializeCategory);
  }

  private serializeCategory(data: Categories): CategoryEntity {
    return CategoryEntity.create(
      {
        name: data.name,
        colorCode: data.colorCode,
        createdAt: data.createdAt,
        userId: new UniqueEntityId(data.userId),
      },
      new UniqueEntityId(data.id),
    );
  }
}
