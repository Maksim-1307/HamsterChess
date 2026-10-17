import type { BoardColor } from 'cm-chessboard'
import type { GamePlayers, GameStatus, PieceColor } from '@/types/game'

export const playerColorToBoardColor = (color: PieceColor): BoardColor =>
  color === 'w' ? 'w' : 'b'

export const oppositeColor = (color: PieceColor): PieceColor => (color === 'w' ? 'b' : 'w')

export const playerColorLabel = (color: PieceColor): string =>
  color === 'w' ? 'White' : 'Black'

export const gameStatusLabel = (status: GameStatus): string => {
  switch (status) {
    case 'in_progress':
      return 'In progress'
    case 'checkmate':
      return 'Checkmate'
    case 'stalemate':
      return 'Stalemate'
    case 'insufficient_material':
      return 'Insufficient material'
    case 'threefold_repetition':
      return 'Threefold repetition'
    case 'draw':
      return 'Draw'
  }
}

/** Returns the color the given user plays in the game, or null if they are not a participant. */
export const playerColorForUser = (
  players: GamePlayers,
  userId: string | undefined,
): PieceColor | null => {
  if (!userId) return null
  if (players.white === userId) return 'w'
  if (players.black === userId) return 'b'
  return null
}
