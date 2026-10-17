export interface BoardTheme {
  id: string
  light: string
  dark: string
}

// Only the two square colors change per theme; everything else stays the same.
export const BOARD_THEMES: BoardTheme[] = [
  { id: 'classic', light: '#ebecd0', dark: '#7c9d59' },
  { id: 'pickme', light: '#fff1ff', dark: '#d780ba' }
]

export const DEFAULT_BOARD_THEME = 'classic'

export const isBoardTheme = (id: unknown): id is string =>
  typeof id === 'string' && BOARD_THEMES.some((theme) => theme.id === id)

export const findBoardTheme = (id: string): BoardTheme =>
  BOARD_THEMES.find((theme) => theme.id === id) ?? BOARD_THEMES[0]

/** Applies a board theme by overriding the two square color variables. */
export const applyBoardTheme = (id: string): void => {
  const theme = findBoardTheme(id)
  const root = document.documentElement
  root.style.setProperty('--color-board-light', theme.light)
  root.style.setProperty('--color-board-dark', theme.dark)
}
