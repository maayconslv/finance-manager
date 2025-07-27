export interface CreateUserRequestDTO {
  email: string;
  name: string;
  password: string;
  salt: string;
}

export interface CreateUserDataDTO {
  id: string;
  email: string;
  name: string;
  password: string;
  salt: string;
  createdAt: Date;
}
