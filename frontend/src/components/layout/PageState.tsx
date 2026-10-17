import type { ReactNode } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { Page } from './Page'
import styles from './PageState.module.scss'

export interface PageStateProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  loading?: boolean
  className?: string
}

export const PageState = ({ title, description, action, loading, className }: PageStateProps) => (
  <Page>
    <section className={cn(styles.state, className)}>
      {loading && <Spinner size="lg" />}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </section>
  </Page>
)
