import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageState } from '@/components/layout/PageState'
import { useAuth } from '@/hooks/useAuth'

export const RequireAuth = () => {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <PageState loading title="Loading…" />
  }

  if (!user) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/login" replace state={{ from }} />
  }

  return <Outlet />
}
