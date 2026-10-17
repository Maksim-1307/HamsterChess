import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/cn'
import styles from './Spinner.module.scss'

export type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

export const Spinner = ({ size = 'md', className, label }: SpinnerProps) => {
  const { t } = useTranslation()

  return (
    <span
      className={cn(styles.spinner, styles[size], className)}
      role="status"
      aria-label={label ?? t('common.loading')}
    />
  )
}
