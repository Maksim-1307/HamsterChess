import { useCallback, useState } from 'react'
import { rematchGame } from '@/api/game.api'
import { useTranslation } from '@/hooks/useTranslation'
import type { GameState } from '@/types/game'

export interface UseRematchResult {
  rematch: (id: string) => Promise<GameState | null>
  isRematching: boolean
  error: string | null
}

export const useRematch = (): UseRematchResult => {
  const { t } = useTranslation()
  const [isRematching, setIsRematching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (id: string): Promise<GameState | null> => {
    setIsRematching(true)
    setError(null)
    try {
      return await rematchGame(id)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : t('errors.rematch'))
      return null
    } finally {
      setIsRematching(false)
    }
  }, [t])

  return { rematch: run, isRematching, error }
}
