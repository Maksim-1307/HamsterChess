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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateMoveDto } from './dto/create-move.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(@Inject(GameService) private readonly gameService: GameService) {}

  @Post()
  createGame(
    @Body() dto: CreateGameDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GameState> {
    return this.gameService.createGame(dto, user.id);
  }

  @Get(':id')
  getGame(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GameState> {
    return this.gameService.getGame(id, user.id);
  }

  @Post(':id/join')
  joinGame(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GameState> {
    return this.gameService.joinGame(id, user.id);
  }

  @Post(':id/rematch')
  rematch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GameState> {
    return this.gameService.rematch(id, user.id);
  }

  @Post(':id/move')
  makeMove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMoveDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GameState> {
    return this.gameService.makeMove(id, dto, user.id);
  }
}
