import { useCallback, useEffect, useState } from 'react'
import { getGame } from '@/api/game.api'
import { ApiError } from '@/api/http'
import type { GameState } from '@/types/game'

export interface UseGameResult {
  game: GameState | null
  isLoading: boolean
  error: string | null
  notFound: boolean
  reload: () => void
  setGame: (game: GameState) => void
}

export const useGame = (id: string | undefined): UseGameResult => {
  const [game, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!id) return undefined
    let active = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const result = await getGame(id)
        if (active) setGameState(result)
      } catch (cause: unknown) {
        if (!active) return
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true)
        } else {
          setError(cause instanceof Error ? cause.message : 'Failed to load the game')
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
    setError(null)
  }, [])

  return { game, isLoading, error, notFound, reload, setGame }
}
