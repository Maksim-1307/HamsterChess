export interface GameRecord {
  id: string;
  /** full move history in SAN notation, replayed to restore the position */
  moves: string[];
  /** user id occupying the white seat, or null when it is still open */
  whitePlayerId: string | null;
  /** user id occupying the black seat, or null when it is still open */
  blackPlayerId: string | null;
  /** id of the rematch game created from this one, or null */
  rematchId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const GAME_REPOSITORY = Symbol('GAME_REPOSITORY');

/**
 * Persistence port for games. The current implementation is in-memory;
 * a future database adapter should implement the same interface.
 */
export interface GameRepository {
  save(record: GameRecord): Promise<GameRecord>;
  findById(id: string): Promise<GameRecord | null>;
}
