import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import type { ContainerSize } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import styles from './Page.module.scss'

export interface PageProps {
  size?: ContainerSize
  className?: string
  children: ReactNode
}

export const Page = ({ size = 'default', className, children }: PageProps) => (
  <Container size={size} className={cn(styles.page, className)}>
    {children}
  </Container>
)
