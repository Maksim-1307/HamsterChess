import { useCallback, useState } from 'react'
import { rematchGame } from '@/api/game.api'
import type { GameState } from '@/types/game'

export interface UseRematchResult {
  rematch: (id: string) => Promise<GameState | null>
  isRematching: boolean
  error: string | null
}

export const useRematch = (): UseRematchResult => {
  const [isRematching, setIsRematching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (id: string): Promise<GameState | null> => {
    setIsRematching(true)
    setError(null)
    try {
      return await rematchGame(id)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Failed to start a rematch')
      return null
    } finally {
      setIsRematching(false)
    }
  }, [])

  return { rematch: run, isRematching, error }
}
