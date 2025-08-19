import { IsOptional, IsString } from "class-validator";

export class RegisterBankAccountRequest {
  @IsString()
  bankName: string;

  @IsString()
  accountName: string;

  @IsString()
  amount: string;
}

export class UpdateBankAccountRequest {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}
