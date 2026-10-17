import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/cn'
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

const colorKey = (color: PieceColor): 'white' | 'black' => (color === 'w' ? 'white' : 'black')

export const GameStatusPanel = ({ game, playerColor, className }: GameStatusPanelProps) => {
  const { t } = useTranslation()
  const isTerminal = game.status !== 'in_progress'
  const isYourTurn = !isTerminal && game.turn === playerColor

  const turnText = isTerminal ? t('game.gameOver') : t(`game.turnText.${colorKey(game.turn)}`)

  return (
    <div className={cn(styles.panel, className)}>
      <div className={styles.row}>
        <span className={styles.label}>{t('game.youPlay')}</span>
        <Badge tone="neutral">{t(`color.${colorKey(playerColor)}`)}</Badge>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t('game.statusLabel')}</span>
        <Badge tone={statusTone(game)}>{t(`game.status.${game.status}`)}</Badge>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t('game.turnLabel')}</span>
        <span className={cn(styles.value, isYourTurn && styles.highlight)}>{turnText}</span>
      </div>

      {game.inCheck && !isTerminal && (
        <div className={styles.row}>
          <span className={styles.label} />
          <Badge tone="danger">{t('game.check')}</Badge>
        </div>
      )}
    </div>
  )
}
