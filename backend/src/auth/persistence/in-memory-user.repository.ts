import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CreateUserData,
  User,
  UserRepository,
} from './user-repository.interface';

/**
 * In-memory adapter used by tests (NODE_ENV=test) so e2e runs need no database.
 */
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    const user = this.store.get(id);
    return user ? { ...user } : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.username === username) {
        return { ...user };
      }
    }
    return null;
  }

  async create(data: CreateUserData): Promise<User> {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      username: data.username,
      passwordHash: data.passwordHash,
      refreshTokenHash: null,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(user.id, user);
    return { ...user };
  }

  async updateRefreshTokenHash(
    id: string,
    hash: string | null,
  ): Promise<void> {
    const user = this.store.get(id);
    if (user) {
      user.refreshTokenHash = hash;
      user.updatedAt = new Date();
    }
  }
}
