import { useCallback, useEffect, useRef, useState } from 'react'
import { getGame, joinGame } from '@/api/game.api'
import { ApiError } from '@/api/http'
import { useTranslation } from '@/hooks/useTranslation'
import type { GameState } from '@/types/game'

export interface UseGameResult {
  game: GameState | null
  isLoading: boolean
  error: string | null
  notFound: boolean
  /** the current user is not a participant yet and may join */
  canJoin: boolean
  isJoining: boolean
  join: () => Promise<void>
  reload: () => void
  setGame: (game: GameState) => void
}

export const useGame = (id: string | undefined): UseGameResult => {
  const { t } = useTranslation()
  const tRef = useRef(t)

  useEffect(() => {
    tRef.current = t
  }, [t])

  const [game, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [canJoin, setCanJoin] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!id) return undefined
    let active = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setNotFound(false)
      setCanJoin(false)

      try {
        const result = await getGame(id)
        if (active) setGameState(result)
      } catch (cause: unknown) {
        if (!active) return
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true)
        } else if (cause instanceof ApiError && cause.status === 403) {
          setCanJoin(true)
        } else {
          setError(cause instanceof Error ? cause.message : tRef.current('errors.loadGame'))
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const setGame = useCallback((next: GameState) => {
    setGameState(next)
    setNotFound(false)
    setCanJoin(false)
    setError(null)
  }, [])

  const join = useCallback(async () => {
    if (!id) return
    setIsJoining(true)
    setError(null)
    try {
      const result = await joinGame(id)
      setGameState(result)
      setCanJoin(false)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : t('errors.joinGame'))
    } finally {
      setIsJoining(false)
    }
  }, [id, t])

  return { game, isLoading, error, notFound, canJoin, isJoining, join, reload, setGame }
}
