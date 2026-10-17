import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './Header.module.scss'

export const Header = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <Container size="wide" className={styles.inner}>
        <Link to="/" className={styles.brand}>
          {t('header.brand')}
        </Link>

        <div className={styles.actions}>
          <Button size="sm" variant="ghost" to="/settings">
            {t('common.settings')}
          </Button>
          {user ? (
            <>
              <span className={styles.user}>{user.username}</span>
              <Button size="sm" variant="ghost" onClick={logout}>
                {t('common.signOut')}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" to="/login">
              {t('common.signIn')}
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}
