export interface User {
  id: string;
  username: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  passwordHash: string;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * Persistence port for users. The production implementation is backed by
 * Postgres (TypeORM); tests use an in-memory adapter implementing the same port.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updateRefreshTokenHash(id: string, hash: string | null): Promise<void>;
}
