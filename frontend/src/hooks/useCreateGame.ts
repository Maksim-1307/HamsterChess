import { useCallback, useState } from 'react'
import { createGame as createGameRequest } from '@/api/game.api'
import { useTranslation } from '@/hooks/useTranslation'
import type { GameState, PieceColor } from '@/types/game'

export interface UseCreateGameResult {
  createGame: (color: PieceColor) => Promise<GameState | null>
  isCreating: boolean
  error: string | null
}

export const useCreateGame = (): UseCreateGameResult => {
  const { t } = useTranslation()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (color: PieceColor): Promise<GameState | null> => {
    setIsCreating(true)
    setError(null)
    try {
      return await createGameRequest(color)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : t('errors.createGame'))
      return null
    } finally {
      setIsCreating(false)
    }
  }, [t])

  return { createGame: run, isCreating, error }
}
