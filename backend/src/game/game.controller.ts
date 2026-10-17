import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { GameState } from '../common/types/chess.types';
import { CreateMoveDto } from './dto/create-move.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(@Inject(GameService) private readonly gameService: GameService) {}

  @Post()
  createGame(): Promise<GameState> {
    return this.gameService.createGame();
  }

  @Get(':id')
  getGame(@Param('id', ParseUUIDPipe) id: string): Promise<GameState> {
    return this.gameService.getGame(id);
  }

  @Post(':id/move')
  makeMove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMoveDto,
  ): Promise<GameState> {
    return this.gameService.makeMove(id, dto);
  }
}
