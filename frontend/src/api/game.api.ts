import type { GameState, MovePayload } from '@/types/game'
import { request } from './http'

export const createGame = (): Promise<GameState> =>
  request('/game', { method: 'POST' })

export const getGame = (id: string): Promise<GameState> =>
  request(`/game/${id}`)

export const makeMove = (id: string, move: MovePayload): Promise<GameState> =>
  request(`/game/${id}/move`, {
    method: 'POST',
    body: JSON.stringify(move),
  })
