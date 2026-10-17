import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Container.module.scss'

export type ContainerSize = 'default' | 'wide'

export interface ContainerProps {
  size?: ContainerSize
  className?: string
  children: ReactNode
}

export const Container = ({ size = 'default', className, children }: ContainerProps) => (
  <div className={cn(styles.container, styles[size], className)}>{children}</div>
)
