export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string;
  username: string;
  type: TokenType;
}

export interface PublicUser {
  id: string;
  username: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: TokenPair;
}
