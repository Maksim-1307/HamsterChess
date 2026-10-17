import { useCallback, useState } from 'react'
import { makeMove } from '@/api/game.api'
import type { GameState, MovePayload } from '@/types/game'

export interface UseMakeMoveResult {
  makeMove: (id: string, move: MovePayload) => Promise<GameState | null>
  isSubmitting: boolean
  error: string | null
  resetError: () => void
}

export const useMakeMove = (): UseMakeMoveResult => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (id: string, move: MovePayload): Promise<GameState | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        return await makeMove(id, move)
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : 'Failed to submit the move')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [],
  )

  const resetError = useCallback(() => setError(null), [])

  return { makeMove: run, isSubmitting, error, resetError }
}
