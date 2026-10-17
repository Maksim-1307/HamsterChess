import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChessBoardView } from '@/components/game/ChessBoardView'
import { GameOverDialog } from '@/components/game/GameOverDialog'
import { GameStatusPanel } from '@/components/game/GameStatusPanel'
import { GameToolbar } from '@/components/game/GameToolbar'
import { MoveHistory } from '@/components/game/MoveHistory'
import { Page } from '@/components/layout/Page'
import { PageState } from '@/components/layout/PageState'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import { useGameSocket } from '@/hooks/useGameSocket'
import { useMakeMove } from '@/hooks/useMakeMove'
import { useRematch } from '@/hooks/useRematch'
import { useTranslation } from '@/hooks/useTranslation'
import { gameOutcome, playerColorForUser } from '@/lib/chess'
import type { MovePayload } from '@/types/game'
import styles from './GamePage.module.scss'

export const GamePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  const { game, isLoading, error, notFound, canJoin, isJoining, join, reload, setGame } = useGame(id)
  const { makeMove, isSubmitting, error: moveError, resetError } = useMakeMove()
  const { rematch, isRematching, error: rematchError } = useRematch()
  const [dismissedFor, setDismissedFor] = useState<string | null>(null)
  const gameId = game?.id

  const handleMove = useCallback(
    async (move: MovePayload) => {
      if (!id) return
      resetError()
      const next = await makeMove(id, move)
      if (next) setGame(next)
    },
    [id, makeMove, resetError, setGame],
  )

  // wake up and refetch whenever the opponent moves or starts a rematch
  const handleRemoteUpdate = useCallback(() => reload(), [reload])
  useGameSocket(game?.id, game !== null, handleRemoteUpdate)

  // follow the opponent into the rematch game once it exists
  useEffect(() => {
    if (game?.rematchId) navigate(`/game/${game.rematchId}`)
  }, [game?.rematchId, navigate])

  const handlePlayAgain = useCallback(async () => {
    if (!gameId) return
    const next = await rematch(gameId)
    if (next) navigate(`/game/${next.id}`)
  }, [gameId, rematch, navigate])

  if (!id || notFound) {
    return (
      <PageState
        title={t('game.notFoundTitle')}
        description={t('game.notFoundDescription')}
        action={<Button to="/">{t('common.backToLobby')}</Button>}
      />
    )
  }

  if (canJoin) {
    return (
      <PageState
        title={t('game.joinTitle')}
        description={t('game.joinDescription')}
        action={
          <div className={styles.joinActions}>
            <Button onClick={join} loading={isJoining}>
              {t('game.joinGame')}
            </Button>
            {error && <Alert tone="danger">{error}</Alert>}
          </div>
        }
      />
    )
  }

  if (isLoading && !game) {
    return <PageState loading title={t('game.loading')} />
  }

  if (error && !game) {
    return (
      <PageState
        title={t('game.errorTitle')}
        description={error}
        action={<Button onClick={reload}>{t('common.tryAgain')}</Button>}
      />
    )
  }

  if (!game) {
    return null
  }

  const playerColor = playerColorForUser(game.players, user?.id) ?? 'w'
  const outcome = gameOutcome(game.status, game.turn, playerColor)
  const interactive = game.status === 'in_progress' && game.turn === playerColor && !isSubmitting
  const shareUrl = `${window.location.origin}/game/${game.id}`

  return (
    <>
      <Page size="wide">
        <div className={styles.layout}>
          <div className={styles.boardColumn}>
            <ChessBoardView
              fen={game.fen}
              orientation={playerColor}
              interactive={interactive}
              legalMoves={game.legalMoves}
              onMove={handleMove}
            />
          </div>

          <aside className={styles.sideColumn}>
            <Card
              title={t('game.playersCard')}
              subtitle={t('game.gameLabel', { id: game.id })}
            >
              <GameStatusPanel game={game} playerColor={playerColor} />
            </Card>

            <Card title={t('game.actionsCard')}>
              <GameToolbar onUpdate={reload} isUpdating={isLoading} shareUrl={shareUrl} />
              {outcome && (
                <Button
                  onClick={handlePlayAgain}
                  loading={isRematching}
                  block
                  className={styles.rematchButton}
                >
                  {t('game.playAgain')}
                </Button>
              )}
              {rematchError && (
                <Alert tone="danger" className={styles.alert}>
                  {rematchError}
                </Alert>
              )}
              {moveError && (
                <Alert tone="danger" className={styles.alert}>
                  {moveError}
                </Alert>
              )}
            </Card>

            <Card title={t('game.moveHistoryCard')}>
              <MoveHistory moves={game.moves} />
            </Card>
          </aside>
        </div>
      </Page>

      {outcome && dismissedFor !== game.id && (
        <GameOverDialog
          game={game}
          outcome={outcome}
          isRematching={isRematching}
          error={rematchError}
          onPlayAgain={handlePlayAgain}
          onDismiss={() => setDismissedFor(game.id)}
        />
      )}
    </>
  )
}
