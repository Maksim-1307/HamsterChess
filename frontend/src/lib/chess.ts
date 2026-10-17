import type { BoardColor } from 'cm-chessboard'
import type { GameStatus, PieceColor } from '@/types/game'

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

export const parsePlayerColor = (value: string | null): PieceColor =>
  value === 'b' ? 'b' : 'w'
