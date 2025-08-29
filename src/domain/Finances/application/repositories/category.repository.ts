import { CategoryEntity } from "../../enterprise";

export interface ICategoryRepository {
  save(data: CategoryEntity): Promise<void>;
  delete(categoryId: string): Promise<void>;
  findById(categoryId: string): Promise<CategoryEntity | null>;
}
