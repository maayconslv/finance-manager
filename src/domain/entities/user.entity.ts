export interface BaseUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData extends BaseUser {
  password: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface UserResponse extends BaseUser {} 