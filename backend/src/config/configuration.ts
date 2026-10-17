export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface AuthConfig {
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  jwtSecret: string;
  auth: AuthConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
}

export default (): AppConfig => ({
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: (process.env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'],
  jwtSecret: process.env.JWT_SECRET ?? '',
  auth: {
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1h',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'chess',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
});
