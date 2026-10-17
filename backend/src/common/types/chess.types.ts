export type PieceColor = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = string; // algebraic, e.g. "e4"

export type GameStatus =
  | 'in_progress'
  | 'checkmate'
  | 'stalemate'
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'draw';

export interface PieceSnapshot {
  square: Square;
  type: PieceSymbol;
  color: PieceColor;
}

export interface MoveSnapshot {
  from: Square;
  to: Square;
  color: PieceColor;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  flags: string;
  before: string;
  after: string;
}

export interface GameState {
  id: string;
  fen: string;
  turn: PieceColor;
  status: GameStatus;
  inCheck: boolean;
  /** rows: rank 8 -> rank 1, columns: file a -> h */
  board: (PieceSnapshot | null)[][];
  moves: MoveSnapshot[];
  /** legal destination squares grouped by origin square */
  legalMoves: Record<Square, Square[]>;
  createdAt: string;
  updatedAt: string;
}
