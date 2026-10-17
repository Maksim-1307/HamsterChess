import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/hooks/useAuth'
import styles from './Header.module.scss'

export const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <Container size="wide" className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Hamster Chess
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              <span className={styles.user}>{user.username}</span>
              <Button size="sm" variant="ghost" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" to="/login">
              Sign in
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}
