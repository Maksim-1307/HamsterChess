import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['../.env', '../.env.example'],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    GameModule,
  ],
})
export class AppModule {}
