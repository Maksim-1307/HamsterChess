import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/cn'
import type { MoveSnapshot } from '@/types/game'
import styles from './MoveHistory.module.scss'

export interface MoveHistoryProps {
  moves: MoveSnapshot[]
  className?: string
}

interface MoveRow {
  number: number
  white?: string
  black?: string
}

const toRows = (moves: MoveSnapshot[]): MoveRow[] => {
  const rows: MoveRow[] = []
  moves.forEach((move, index) => {
    const rowIndex = Math.floor(index / 2)
    const row = rows[rowIndex] ?? { number: rowIndex + 1 }
    if (move.color === 'w') {
      row.white = move.san
    } else {
      row.black = move.san
    }
    rows[rowIndex] = row
  })
  return rows
}

export const MoveHistory = ({ moves, className }: MoveHistoryProps) => {
  const { t } = useTranslation()
  const rows = toRows(moves)

  return (
    <div className={cn(styles.history, className)}>
      {rows.length === 0 ? (
        <p className={styles.empty}>{t('game.noMoves')}</p>
      ) : (
        <ol className={styles.list}>
          {rows.map((row) => (
            <li key={row.number} className={styles.row}>
              <span className={styles.number}>{row.number}.</span>
              <span className={styles.move}>{row.white ?? ''}</span>
              <span className={styles.move}>{row.black ?? ''}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
