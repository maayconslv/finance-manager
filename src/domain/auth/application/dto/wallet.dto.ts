export interface CreateWalletDataDTO {
  id: string;
  userId: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
}
