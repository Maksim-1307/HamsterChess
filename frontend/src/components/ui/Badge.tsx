import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Badge.module.scss'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

export const Badge = ({ tone = 'neutral', className, children }: BadgeProps) => (
  <span className={cn(styles.badge, styles[tone], className)}>{children}</span>
)
