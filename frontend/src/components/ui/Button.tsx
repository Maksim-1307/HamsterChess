import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children' | 'type' | 'onClick'
>

export interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
  icon?: ReactNode
  to?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
  children?: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  icon,
  to,
  type = 'button',
  disabled,
  onClick,
  className,
  children,
  ...rest
}: ButtonProps) => {
  const classes = cn(
    styles.button,
    styles[variant],
    styles[size],
    block && styles.block,
    loading && styles.loading,
    className,
  )

  const content = (
    <>
      {loading ? <Spinner size="sm" /> : icon}
      {children != null && <span className={styles.label}>{children}</span>}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={disabled || loading || undefined}
        onClick={disabled || loading ? (event) => event.preventDefault() : onClick}
      >
        {content}
      </Link>
    )
  }

  return (
    <button {...rest} type={type} className={classes} disabled={disabled || loading} onClick={onClick}>
      {content}
    </button>
  )
}
