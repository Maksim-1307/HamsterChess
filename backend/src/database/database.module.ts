import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';
import { UserEntity } from '../auth/persistence/user.entity';

export const isTestEnvironment = (): boolean =>
  process.env.NODE_ENV === 'test';

/**
 * Registers the Postgres connection via TypeORM. In the test environment the
 * module is intentionally empty, so e2e tests run against in-memory adapters
 * without needing a database.
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    if (isTestEnvironment()) {
      return { module: DatabaseModule };
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<AppConfig, true>) => {
            const database = config.get('database', { infer: true });
            return {
              type: 'postgres' as const,
              host: database.host,
              port: database.port,
              username: database.user,
              password: database.password,
              database: database.name,
              entities: [UserEntity],
              synchronize: true,
            };
          },
        }),
      ],
    };
  }
}
