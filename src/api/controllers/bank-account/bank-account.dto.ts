import { IsString } from "class-validator";

export class RegisterBankAccountRequest {
  @IsString()
  bankName: string;

  @IsString()
  accountName: string;

  @IsString()
  amount: string;
}
