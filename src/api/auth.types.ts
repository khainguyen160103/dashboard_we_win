export type LoginParams = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  userId?: string;
  expiresIn?: number;
  isAdmin?: boolean;
  user?: {
    id?: string;
    isAdmin?: boolean;
  };
};
