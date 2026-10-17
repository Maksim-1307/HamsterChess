import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GAME_REPOSITORY } from './persistence/game-repository.interface';
import { InMemoryGameRepository } from './persistence/in-memory-game.repository';

@Module({
  controllers: [GameController],
  providers: [
    GameService,
    GameGateway,
    {
      provide: GAME_REPOSITORY,
      useClass: InMemoryGameRepository,
    },
  ],
  exports: [GameService],
})
export class GameModule {}
