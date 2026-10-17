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
import { useTranslation } from '@/hooks/useTranslation'
import type { PieceColor } from '@/types/game'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [color, setColor] = useState<PieceColor>('w')
  const [joinId, setJoinId] = useState('')
  const { createGame, isCreating, error } = useCreateGame()

  const colorOptions = [
    { value: 'w', label: t('color.white') },
    { value: 'b', label: t('color.black') },
  ]

  const handleCreate = async () => {
    const game = await createGame(color)
    if (game) {
      navigate(`/game/${game.id}`)
    }
  }

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = joinId.trim()
    if (id) {
      navigate(`/game/${id}`)
    }
  }

  return (
    <Page>
      <div className={styles.intro}>
        <h1 className={styles.title}>{t('home.title')}</h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
      </div>

      <div className={styles.grid}>
        <Card title={t('home.createCardTitle')} subtitle={t('home.createCardSubtitle')}>
          <div className={styles.form}>
            <Select
              label={t('home.playAs')}
              value={color}
              options={colorOptions}
              onChange={(event) => setColor(event.target.value as PieceColor)}
            />
            <Button onClick={handleCreate} loading={isCreating} block>
              {t('home.createGame')}
            </Button>
            {error && <Alert tone="danger">{error}</Alert>}
          </div>
        </Card>

        <Card title={t('home.joinCardTitle')} subtitle={t('home.joinCardSubtitle')}>
          <form className={styles.form} onSubmit={handleJoin}>
            <TextField
              label={t('home.gameId')}
              value={joinId}
              placeholder={t('home.gameIdPlaceholder')}
              onChange={(event) => setJoinId(event.target.value)}
            />
            <Button type="submit" variant="secondary" block disabled={joinId.trim().length === 0}>
              {t('home.joinGame')}
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  )
}
