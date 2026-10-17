import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { GameState } from '../common/types/chess.types';
import { Game } from './domain/game.entity';
import { CreateMoveDto } from './dto/create-move.dto';
import {
  GAME_REPOSITORY,
  GameRecord,
  GameRepository,
} from './persistence/game-repository.interface';

@Injectable()
export class GameService {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async createGame(): Promise<GameState> {
    const game = Game.create(randomUUID());
    await this.gameRepository.save(game.toRecord());
    return game.toState();
  }

  async getGame(id: string): Promise<GameState> {
    const game = await this.loadGame(id);
    return game.toState();
  }

  async makeMove(id: string, dto: CreateMoveDto): Promise<GameState> {
    const game = await this.loadGame(id);
    game.makeMove(dto);
    await this.gameRepository.save(game.toRecord());
    return game.toState();
  }

  private async loadGame(id: string): Promise<Game> {
    const record = await this.gameRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Game "${id}" not found`);
    }
    return Game.fromRecord(record as GameRecord);
  }
}
