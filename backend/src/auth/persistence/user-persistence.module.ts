import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isTestEnvironment } from '../../database/database.module';
import { InMemoryUserRepository } from './in-memory-user.repository';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { USER_REPOSITORY } from './user-repository.interface';
import { UserEntity } from './user.entity';

@Module({})
export class UserPersistenceModule {
  static register(): DynamicModule {
    const provider: Provider = {
      provide: USER_REPOSITORY,
      useClass: isTestEnvironment()
        ? InMemoryUserRepository
        : TypeOrmUserRepository,
    };

    return {
      module: UserPersistenceModule,
      imports: isTestEnvironment() ? [] : [TypeOrmModule.forFeature([UserEntity])],
      providers: [provider],
      exports: [USER_REPOSITORY],
    };
  }
}
