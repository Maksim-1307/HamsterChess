import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { useCreateGame } from '@/hooks/useCreateGame'
import type { PieceColor } from '@/types/game'
import styles from './HomePage.module.scss'

const COLOR_OPTIONS = [
  { value: 'w', label: 'White' },
  { value: 'b', label: 'Black' },
]

export const HomePage = () => {
  const navigate = useNavigate()
  const [color, setColor] = useState<PieceColor>('w')
  const [joinId, setJoinId] = useState('')
  const { createGame, isCreating, error } = useCreateGame()

  const handleCreate = async () => {
    const game = await createGame()
    if (game) {
      navigate(`/game/${game.id}?color=${color}`)
    }
  }

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = joinId.trim()
    if (id) {
      navigate(`/game/${id}?color=${color}`)
    }
  }

  return (
    <Page>
      <div className={styles.intro}>
        <h1 className={styles.title}>Play chess with a friend</h1>
        <p className={styles.subtitle}>
          Create a game and share the link, or join one using its game ID.
        </p>
      </div>

      <div className={styles.grid}>
        <Card title="Create a game" subtitle="Start a fresh board and invite a friend.">
          <div className={styles.form}>
            <Select
              label="Play as"
              value={color}
              options={COLOR_OPTIONS}
              onChange={(event) => setColor(event.target.value as PieceColor)}
            />
            <Button onClick={handleCreate} loading={isCreating} block>
              Create game
            </Button>
            {error && <Alert tone="danger">{error}</Alert>}
          </div>
        </Card>

        <Card title="Join a game" subtitle="Enter the game ID you received.">
          <form className={styles.form} onSubmit={handleJoin}>
            <TextField
              label="Game ID"
              value={joinId}
              placeholder="Paste the game ID"
              onChange={(event) => setJoinId(event.target.value)}
            />
            <Select
              label="Play as"
              value={color}
              options={COLOR_OPTIONS}
              onChange={(event) => setColor(event.target.value as PieceColor)}
            />
            <Button type="submit" variant="secondary" block disabled={joinId.trim().length === 0}>
              Join game
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  )
}
