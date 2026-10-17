import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { env } from '@/config/env'

/** Events pushed by the server. The waker carries no payload. */
export interface ServerToClientEvents {
  'game:updated': () => void
}

/** Events sent by the client. */
export interface ClientToServerEvents {
  'game:watch': (payload: { gameId: string }) => void
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/**
 * Connects to the backend "waker" socket through the same-origin proxy,
 * carrying the auth cookies so the server can authenticate the handshake.
 */
export const createGameSocket = (): GameSocket =>
  io({
    path: `${env.socketUrl}/socket.io`,
    withCredentials: true,
  })
