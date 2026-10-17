import type { SelectHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'
import styles from './Select.module.scss'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
}

export const Select = ({ label, hint, error, options, className, ...rest }: SelectProps) => {
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
      <select
        {...rest}
        id={id}
        className={cn(styles.select, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
