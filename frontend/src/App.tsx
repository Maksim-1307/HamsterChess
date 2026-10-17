import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { GamePage } from '@/pages/GamePage/GamePage'
import { HomePage } from '@/pages/HomePage/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="game/:id" element={<GamePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
)

export default App
