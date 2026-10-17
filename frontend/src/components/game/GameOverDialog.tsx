import { useEffect } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/cn'
import type { GameOutcome } from '@/lib/chess'
import type { GameState } from '@/types/game'
import styles from './GameOverDialog.module.scss'

export interface GameOverDialogProps {
  game: GameState
  outcome: GameOutcome
  isRematching: boolean
  error: string | null
  onPlayAgain: () => void
  onDismiss: () => void
}

export const GameOverDialog = ({
  game,
  outcome,
  isRematching,
  error,
  onPlayAgain,
  onDismiss,
}: GameOverDialogProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          aria-label={t('game.close')}
          onClick={onDismiss}
        >
          ×
        </button>

        <span className={cn(styles.badge, styles[outcome])}>
          {t(`game.status.${game.status}`)}
        </span>

        {outcome === 'loss' && (
          <img 
            src={`/images/sad.webp`} alt="" 
            style={{
              "maxWidth": "200px",
              "borderRadius": "20px",
              "marginBottom": "10px",
              "marginLeft": "auto",
              "marginRight": "auto"
            }}
          />
        )}

        {outcome === 'win' && (
          <img 
            src={`/images/happy.webp`} alt="" 
            style={{
              "maxWidth": "200px",
              "borderRadius": "20px",
              "marginBottom": "10px",
              "marginLeft": "auto",
              "marginRight": "auto"
            }}
          />
        )}

        <h2 id="game-over-title" className={styles.title}>
          {t(`game.outcome.${outcome}`)}
        </h2>

        <div className={styles.actions}>
          <Button onClick={onPlayAgain} loading={isRematching} block>
            {t('game.playAgain')}
          </Button>
          <Button to="/" variant="secondary" block>
            {t('common.backToLobby')}
          </Button>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </div>
  )
}
