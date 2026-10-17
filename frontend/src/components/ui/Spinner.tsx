import { cn } from '@/lib/cn'
import styles from './Spinner.module.scss'

export type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

export const Spinner = ({ size = 'md', className, label = 'Loading' }: SpinnerProps) => (
  <span
    className={cn(styles.spinner, styles[size], className)}
    role="status"
    aria-label={label}
  />
)
