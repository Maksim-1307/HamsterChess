import { BadRequestException } from '@nestjs/common';
import { Chess, type Move } from 'chess.js';
import {
  GameStatus,
  GameState,
  MoveSnapshot,
  Square,
} from '../../common/types/chess.types';
import { GameRecord } from '../persistence/game-repository.interface';

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export class Game {
  private readonly chess: Chess;

  private constructor(
    public readonly id: string,
    chess: Chess,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.chess = chess;
  }

  static create(id: string, now: Date = new Date()): Game {
    return new Game(id, new Chess(), now, now);
  }

  static fromRecord(record: GameRecord): Game {
    const chess = new Chess();
    for (const san of record.moves) {
      chess.move(san);
    }
    return new Game(record.id, chess, record.createdAt, record.updatedAt);
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
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
