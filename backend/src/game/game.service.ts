import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  GameState,
  PieceColor,
} from '../common/types/chess.types';
import { Game } from './domain/game.entity';
import { CreateMoveDto } from './dto/create-move.dto';
import { CreateGameDto } from './dto/create-game.dto';
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

  async createGame(dto: CreateGameDto, userId: string): Promise<GameState> {
    const color: PieceColor = dto.color ?? 'w';
    const game = Game.create(randomUUID(), {
      whitePlayerId: color === 'w' ? userId : null,
      blackPlayerId: color === 'b' ? userId : null,
    });
    await this.gameRepository.save(game.toRecord());
    return game.toState();
  }

  async joinGame(id: string, userId: string): Promise<GameState> {
    const game = await this.loadGame(id);
    game.addPlayer(userId);
    await this.gameRepository.save(game.toRecord());
    return game.toState();
  }

  async getGame(id: string, userId: string): Promise<GameState> {
    const game = await this.loadGame(id);
    this.assertParticipant(game, userId);
    return game.toState();
  }

  async makeMove(
    id: string,
    dto: CreateMoveDto,
    userId: string,
  ): Promise<GameState> {
    const game = await this.loadGame(id);
    const color = this.assertParticipant(game, userId);
    if (game.currentTurn() !== color) {
      throw new ForbiddenException('It is not your turn');
    }

    game.makeMove(dto);
    await this.gameRepository.save(game.toRecord());
    return game.toState();
  }

  private assertParticipant(game: Game, userId: string): PieceColor {
    const color = game.playerColor(userId);
    if (!color) {
      throw new ForbiddenException('You are not a player in this game');
    }
    return color;
  }

  private async loadGame(id: string): Promise<Game> {
    const record = await this.gameRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Game "${id}" not found`);
    }
    return Game.fromRecord(record as GameRecord);
  }
}
