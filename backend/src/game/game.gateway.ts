import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { readAccessTokenFromCookieHeader } from '../auth/auth.cookies';
import type { JwtPayload } from '../auth/auth.types';
import { WatchGameDto } from './dto/watch-game.dto';
import {
  GAME_REPOSITORY,
  GameRepository,
} from './persistence/game-repository.interface';

/** name of the room every spectator of a game joins */
const gameRoom = (gameId: string): string => `game:${gameId}`;
/** name of the room holding every open socket of a single user */
const userRoom = (userId: string): string => `user:${userId}`;

/**
 * Thin "waker" socket. It never carries game data: a participant subscribes
 * to a game, and whenever the opponent moves the server emits an empty
 * `game:updated` event so the client can refetch the state over REST.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class GameGateway implements OnGatewayConnection {
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(GAME_REPOSITORY) private readonly gameRepository: GameRepository,
  ) {}

  @WebSocketServer()
  private readonly server!: Server;

  handleConnection(socket: Socket): void {
    const token = readAccessTokenFromCookieHeader(
      socket.handshake.headers.cookie,
    );

    if (!token) {
      this.reject(socket);
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.type !== 'access') {
        throw new Error('unexpected token type');
      }
      socket.data.userId = payload.sub;
    } catch {
      this.reject(socket);
    }
  }

  @SubscribeMessage('game:watch')
  async handleWatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: WatchGameDto,
  ): Promise<{ watching: boolean }> {
    const userId = socket.data.userId as string | undefined;
    if (!userId) {
      this.reject(socket);
      return { watching: false };
    }

    const record = await this.gameRepository.findById(body.gameId);
    const isParticipant =
      record !== null &&
      (record.whitePlayerId === userId || record.blackPlayerId === userId);

    if (!isParticipant) {
      return { watching: false };
    }

    await socket.join(gameRoom(body.gameId));
    await socket.join(userRoom(userId));
    return { watching: true };
  }

  /** Wakes every participant of the game except the player who just moved. */
  notifyMove(gameId: string, moverId: string): void {
    this.server
      .to(gameRoom(gameId))
      .except(userRoom(moverId))
      .emit('game:updated');
  }

  private reject(socket: Socket): void {
    this.logger.debug(`Rejecting unauthenticated socket ${socket.id}`);
    socket.disconnect(true);
  }
}
