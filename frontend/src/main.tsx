import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'cm-chessboard/assets/chessboard.css'
import 'cm-chessboard/assets/extensions/markers/markers.css'
import 'cm-chessboard/assets/extensions/promotion-dialog/promotion-dialog.css'
import '@/styles/global.scss'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
