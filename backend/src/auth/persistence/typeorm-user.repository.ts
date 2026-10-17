import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserData,
  User,
  UserRepository,
} from './user-repository.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const entity = this.repository.create({
      username: data.username,
      passwordHash: data.passwordHash,
      refreshTokenHash: null,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async updateRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.repository.update({ id }, { refreshTokenHash: hash });
  }

  private toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      username: entity.username,
      passwordHash: entity.passwordHash,
      refreshTokenHash: entity.refreshTokenHash,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
