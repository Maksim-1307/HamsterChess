import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'
import styles from './TextField.module.scss'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string
  hint?: string
  error?: string
}

export const TextField = ({ label, hint, error, className, ...rest }: TextFieldProps) => {
  const generatedId = useId()
  const id = rest.name ?? generatedId
  const describedById = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        {...rest}
        id={id}
        className={cn(styles.input, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
      />
      {error ? (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}
