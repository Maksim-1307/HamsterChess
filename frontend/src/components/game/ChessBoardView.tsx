import { cn } from '@/lib/cn'
import { useChessboard } from '@/hooks/useChessboard'
import type { MovePayload, PieceColor, Square } from '@/types/game'
import styles from './ChessBoardView.module.scss'

export interface ChessBoardViewProps {
  fen: string
  orientation: PieceColor
  interactive: boolean
  legalMoves: Record<Square, Square[]>
  onMove: (move: MovePayload) => void
  className?: string
}

export const ChessBoardView = ({
  fen,
  orientation,
  interactive,
  legalMoves,
  onMove,
  className,
}: ChessBoardViewProps) => {
  const { containerRef } = useChessboard({ fen, orientation, interactive, legalMoves, onMove })

  return <div ref={containerRef} className={cn(styles.board, className)} />
}
