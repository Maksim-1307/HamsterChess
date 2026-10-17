import type { GameState, MovePayload, PieceColor } from '@/types/game'
import { request } from './http'

export const createGame = (color: PieceColor): Promise<GameState> =>
  request('/game', { method: 'POST', body: JSON.stringify({ color }) })

export const getGame = (id: string): Promise<GameState> => request(`/game/${id}`)

export const joinGame = (id: string): Promise<GameState> =>
  request(`/game/${id}/join`, { method: 'POST' })

export const rematchGame = (id: string): Promise<GameState> =>
  request(`/game/${id}/rematch`, { method: 'POST' })

export const makeMove = (id: string, move: MovePayload): Promise<GameState> =>
  request(`/game/${id}/move`, {
    method: 'POST',
    body: JSON.stringify(move),
  })
