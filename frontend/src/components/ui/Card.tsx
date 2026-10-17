import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Card.module.scss'

export interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  className?: string
  children?: ReactNode
}

export const Card = ({ title, subtitle, actions, footer, className, children }: CardProps) => {
  const hasHeader = Boolean(title || subtitle || actions)

  return (
    <section className={cn(styles.card, className)}>
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.titles}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children != null && <div className={styles.body}>{children}</div>}
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  )
}
