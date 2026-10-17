import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import styles from './AppLayout.module.scss'

export const AppLayout = () => (
  <div className={styles.app}>
    <Header />
    <main className={styles.main}>
      <Outlet />
    </main>
  </div>
)
