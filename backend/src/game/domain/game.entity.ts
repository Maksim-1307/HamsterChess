import { BadRequestException, ConflictException } from '@nestjs/common';
import { Chess, type Move } from 'chess.js';
import {
  GamePlayers,
  GameStatus,
  GameState,
  MoveSnapshot,
  PieceColor,
  Square,
} from '../../common/types/chess.types';
import { GameRecord } from '../persistence/game-repository.interface';

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface CreateGameOptions {
  whitePlayerId?: string | null;
  blackPlayerId?: string | null;
}

export class Game {
  private readonly chess: Chess;

  private constructor(
    public readonly id: string,
    chess: Chess,
    private whitePlayerId: string | null,
    private blackPlayerId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.chess = chess;
  }

  static create(
    id: string,
    options: CreateGameOptions = {},
    now: Date = new Date(),
  ): Game {
    return new Game(
      id,
      new Chess(),
      options.whitePlayerId ?? null,
      options.blackPlayerId ?? null,
      now,
      now,
    );
  }

  static fromRecord(record: GameRecord): Game {
    const chess = new Chess();
    for (const san of record.moves) {
      chess.move(san);
    }
    return new Game(
      record.id,
      chess,
      record.whitePlayerId,
      record.blackPlayerId,
      record.createdAt,
      record.updatedAt,
    );
  }

  isParticipant(userId: string): boolean {
    return this.playerColor(userId) !== null;
  }

  playerColor(userId: string): PieceColor | null {
    if (this.whitePlayerId === userId) return 'w';
    if (this.blackPlayerId === userId) return 'b';
    return null;
  }

  currentTurn(): PieceColor {
    return this.chess.turn();
  }

  /** Seats the user in the first free slot; throws when the game is full. */
  addPlayer(userId: string): void {
    if (this.isParticipant(userId)) {
      return;
    }
    if (this.whitePlayerId === null) {
      this.whitePlayerId = userId;
    } else if (this.blackPlayerId === null) {
      this.blackPlayerId = userId;
    } else {
      throw new ConflictException('Game is already full');
    }
    this.updatedAt = new Date();
  }

  makeMove(input: MoveInput): MoveSnapshot {
    let move: Move;
    try {
      move = this.chess.move({
        from: input.from,
        to: input.to,
        promotion: input.promotion,
      });
    } catch {
      throw new BadRequestException(
        `Illegal move: ${input.from}${input.to}${input.promotion ?? ''}`,
      );
    }
    this.updatedAt = new Date();
    return toMoveSnapshot(move);
  }

  toState(): GameState {
    return {
      id: this.id,
      fen: this.chess.fen(),
      turn: this.chess.turn(),
      status: this.resolveStatus(),
      inCheck: this.chess.inCheck(),
      players: this.players(),
      board: this.chess.board(),
      moves: this.chess.history({ verbose: true }).map(toMoveSnapshot),
      legalMoves: this.legalMoves(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  toRecord(): GameRecord {
    return {
      id: this.id,
      moves: this.chess.history(),
      whitePlayerId: this.whitePlayerId,
      blackPlayerId: this.blackPlayerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private players(): GamePlayers {
    return { white: this.whitePlayerId, black: this.blackPlayerId };
  }

  private legalMoves(): Record<Square, Square[]> {
    const result: Record<Square, Square[]> = {};
    const moves = this.chess.moves({ verbose: true });
    for (const move of moves) {
      (result[move.from] ??= []).push(move.to);
    }
    return result;
  }

  private resolveStatus(): GameStatus {
    if (this.chess.isCheckmate()) return 'checkmate';
    if (this.chess.isStalemate()) return 'stalemate';
    if (this.chess.isInsufficientMaterial()) return 'insufficient_material';
    if (this.chess.isThreefoldRepetition()) return 'threefold_repetition';
    if (this.chess.isDraw()) return 'draw';
    return 'in_progress';
  }
}

function toMoveSnapshot(move: Move): MoveSnapshot {
  return {
    from: move.from,
    to: move.to,
    color: move.color,
    piece: move.piece,
    captured: move.captured,
    promotion: move.promotion,
    san: move.san,
    flags: move.flags,
    before: move.before,
    after: move.after,
  };
}
