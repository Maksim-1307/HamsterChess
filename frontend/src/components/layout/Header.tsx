import { Container } from '@/components/ui/Container'
import { Link } from 'react-router-dom'
import styles from './Header.module.scss'

export const Header = () => (
  <header className={styles.header}>
    <Container size="wide" className={styles.inner}>
      <Link to="/" className={styles.brand}>
        Hamster Chess
      </Link>
    </Container>
  </header>
)
