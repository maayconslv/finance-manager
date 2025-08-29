import { Type } from "@/domain/Finances/enterprise";
import { IsEnum, IsString, IsUUID } from "class-validator";

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
