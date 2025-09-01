import { Type } from "@/domain/Finances/enterprise";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export interface CreateTransactionUseCaseRequest {
  amount: number;
  type: Type;
  description: string;
  categoryId: string;
}

export class CreateTransactionRequest {
  @IsString()
  amount: string;

  @IsEnum(Type)
  type: Type;

  @IsString()
  description: string;

  @IsUUID()
  @IsString()
  categoryId: string;
}

export class CreateCategory {
  @IsString()
  colorCode: string;

  @IsString()
  name: string;
}

export class UpdateTransactionRequest {
  @IsString()
  @IsOptional()
  amount?: string;

  @IsEnum(Type)
  @IsOptional()
  type?: Type;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class UpdateCategoryRequest {
  @IsString()
  name: string;
}
