import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { RequireAuth } from '@/auth/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { GamePage } from '@/pages/GamePage/GamePage'
import { HomePage } from '@/pages/HomePage/HomePage'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route element={<RequireAuth />}>
            <Route index element={<HomePage />} />
            <Route path="game/:id" element={<GamePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
