import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Page } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import styles from './AuthForm.module.scss'

export type AuthMode = 'login' | 'register'

export interface AuthFormProps {
  mode: AuthMode
}

interface LocationState {
  from?: string
}

const MIN_PASSWORD_LENGTH = 6

export const AuthForm = ({ mode }: AuthFormProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegister = mode === 'register'
  const redirectTo = (location.state as LocationState | null)?.from ?? '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isRegister && password !== confirm) {
      setConfirmError('Passwords do not match')
      return
    }

    setError(null)
    setConfirmError(null)
    setIsSubmitting(true)

    try {
      if (isRegister) {
        await register({ username, password })
      } else {
        await login({ username, password })
      }
      navigate(redirectTo, { replace: true })
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Page>
      <div className={styles.shell}>
        <Card
          title={isRegister ? 'Create your account' : 'Sign in'}
          subtitle={
            isRegister
              ? 'Pick a username and password to start playing.'
              : 'Welcome back — sign in to continue playing.'
          }
        >
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {isRegister && (
              <TextField
                label="Confirm password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                error={confirmError ?? undefined}
                onChange={(event) => setConfirm(event.target.value)}
              />
            )}

            {error && <Alert tone="danger">{error}</Alert>}

            <Button type="submit" block loading={isSubmitting}>
              {isRegister ? 'Create account' : 'Sign in'}
            </Button>
          </form>
        </Card>

        <p className={styles.switch}>
          {isRegister ? (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/register">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </Page>
  )
}
