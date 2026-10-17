import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ChessBoardView } from '@/components/game/ChessBoardView'
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
import { playerColorForUser } from '@/lib/chess'
import { isTerminalStatus } from '@/types/game'
import type { MovePayload } from '@/types/game'
import styles from './GamePage.module.scss'

export const GamePage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const { game, isLoading, error, notFound, canJoin, isJoining, join, reload, setGame } = useGame(id)
  const { makeMove, isSubmitting, error: moveError, resetError } = useMakeMove()

  const handleMove = useCallback(
    async (move: MovePayload) => {
      if (!id) return
      resetError()
      const next = await makeMove(id, move)
      if (next) setGame(next)
    },
    [id, makeMove, resetError, setGame],
  )

  // wake up and refetch whenever the opponent moves
  const handleRemoteUpdate = useCallback(() => reload(), [reload])
  useGameSocket(game?.id, game !== null && !isTerminalStatus(game.status), handleRemoteUpdate)

  if (!id || notFound) {
    return (
      <PageState
        title="Game not found"
        description="This game does not exist or may have expired."
        action={<Button to="/">Back to lobby</Button>}
      />
    )
  }

  if (canJoin) {
    return (
      <PageState
        title="Join this game"
        description="You have been invited to join this game as the opponent."
        action={
          <div className={styles.joinActions}>
            <Button onClick={join} loading={isJoining}>
              Join game
            </Button>
            {error && <Alert tone="danger">{error}</Alert>}
          </div>
        }
      />
    )
  }

  if (isLoading && !game) {
    return <PageState loading title="Loading game…" />
  }

  if (error && !game) {
    return (
      <PageState
        title="Something went wrong"
        description={error}
        action={<Button onClick={reload}>Try again</Button>}
      />
    )
  }

  if (!game) {
    return null
  }

  const playerColor = playerColorForUser(game.players, user?.id) ?? 'w'
  const interactive = game.status === 'in_progress' && game.turn === playerColor && !isSubmitting
  const shareUrl = `${window.location.origin}/game/${game.id}`

  return (
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
          <Card title="Players" subtitle={`Game ${game.id}`}>
            <GameStatusPanel game={game} playerColor={playerColor} />
          </Card>

          <Card title="Actions">
            <GameToolbar onUpdate={reload} isUpdating={isLoading} shareUrl={shareUrl} />
            {moveError && (
              <Alert tone="danger" className={styles.alert}>
                {moveError}
              </Alert>
            )}
          </Card>

          <Card title="Move history">
            <MoveHistory moves={game.moves} />
          </Card>
        </aside>
      </div>
    </Page>
  )
}
