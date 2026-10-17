import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { gameStatusLabel, playerColorLabel } from '@/lib/chess'
import type { GameState, PieceColor } from '@/types/game'
import styles from './GameStatusPanel.module.scss'

export interface GameStatusPanelProps {
  game: GameState
  playerColor: PieceColor
  className?: string
}

const statusTone = (game: GameState): BadgeTone => {
  if (game.status === 'in_progress') return 'accent'
  if (game.status === 'checkmate') return 'warning'
  return 'info'
}

export const GameStatusPanel = ({ game, playerColor, className }: GameStatusPanelProps) => {
  const isTerminal = game.status !== 'in_progress'
  const isYourTurn = !isTerminal && game.turn === playerColor

  const turnText = isTerminal
    ? 'Game over'
    : `${playerColorLabel(game.turn)} to move`

  return (
    <div className={cn(styles.panel, className)}>
      <div className={styles.row}>
        <span className={styles.label}>You play</span>
        <Badge tone="neutral">{playerColorLabel(playerColor)}</Badge>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Status</span>
        <Badge tone={statusTone(game)}>{gameStatusLabel(game.status)}</Badge>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Turn</span>
        <span className={cn(styles.value, isYourTurn && styles.highlight)}>{turnText}</span>
      </div>

      {game.inCheck && !isTerminal && (
        <div className={styles.row}>
          <span className={styles.label} />
          <Badge tone="danger">Check</Badge>
        </div>
      )}
    </div>
  )
}
