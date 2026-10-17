import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Alert.module.scss'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  tone?: AlertTone
  title?: ReactNode
  className?: string
  children?: ReactNode
}

export const Alert = ({ tone = 'info', title, className, children }: AlertProps) => (
  <div className={cn(styles.alert, styles[tone], className)} role={tone === 'danger' ? 'alert' : 'status'}>
    {title && <p className={styles.title}>{title}</p>}
    {children != null && <div className={styles.content}>{children}</div>}
  </div>
)
