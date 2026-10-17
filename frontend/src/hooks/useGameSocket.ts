import { useEffect, useRef } from 'react'
import { createGameSocket } from '@/api/socket'

/**
 * Subscribes to a game's "waker" channel. When the server signals that the
 * opponent moved (`game:updated`, no payload), `onUpdate` is invoked so the
 * caller can refetch the authoritative state over REST.
 */
export const useGameSocket = (
  gameId: string | undefined,
  enabled: boolean,
  onUpdate: () => void,
): void => {
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!gameId || !enabled) return undefined

    const socket = createGameSocket()
    const watch = () => socket.emit('game:watch', { gameId })

    socket.on('connect', watch)
    socket.on('game:updated', () => onUpdateRef.current())

    return () => {
      socket.off('connect', watch)
      socket.off('game:updated')
      socket.disconnect()
    }
  }, [gameId, enabled])
}
