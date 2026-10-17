import { useCallback, useState } from 'react'
import { createGame } from '@/api/game.api'
import type { GameState } from '@/types/game'

export interface UseCreateGameResult {
  createGame: () => Promise<GameState | null>
  isCreating: boolean
  error: string | null
}

export const useCreateGame = (): UseCreateGameResult => {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (): Promise<GameState | null> => {
    setIsCreating(true)
    setError(null)
    try {
      return await createGame()
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Failed to create the game')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [])

  return { createGame: run, isCreating, error }
}
