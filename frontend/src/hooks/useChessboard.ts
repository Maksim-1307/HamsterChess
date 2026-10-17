import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Chessboard, COLOR, INPUT_EVENT_TYPE } from 'cm-chessboard'
import type { BoardColor, MoveInputEvent } from 'cm-chessboard'
import { Markers } from 'cm-chessboard/src/extensions/markers/Markers.js'
import { PromotionDialog, PROMOTION_DIALOG_RESULT_TYPE } from 'cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js'
import type { MovePayload, PieceColor, PieceSymbol, Square } from '@/types/game'
import { playerColorToBoardColor } from '@/lib/chess'

export interface UseChessboardOptions {
  fen: string
  orientation: PieceColor
  interactive: boolean
  legalMoves: Record<Square, Square[]>
  onMove: (move: MovePayload) => void
}

export interface UseChessboardResult {
  containerRef: RefObject<HTMLDivElement | null>
}

const promotionRankFor = (color: string): string => (color === 'w' ? '8' : '1')

export const useChessboard = ({
  fen,
  orientation,
  interactive,
  legalMoves,
  onMove,
}: UseChessboardOptions): UseChessboardResult => {
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<Chessboard | null>(null)
  const fenRef = useRef(fen)
  const legalMovesRef = useRef(legalMoves)
  const onMoveRef = useRef(onMove)
  const selectionRef = useRef<{ from: Square; piece: string | null } | null>(null)

  useEffect(() => {
    legalMovesRef.current = legalMoves
  }, [legalMoves])

  useEffect(() => {
    onMoveRef.current = onMove
  }, [onMove])

  const commitFinishedMove = useCallback((from: Square, to: Square, piece: string | null) => {
    const board = boardRef.current
    if (!board) return

    const isPromotion =
      piece?.charAt(1) === 'p' && to.charAt(1) === promotionRankFor(piece.charAt(0))

    if (!isPromotion) {
      onMoveRef.current({ from, to })
      return
    }

    const color: BoardColor = piece.charAt(0) === 'w' ? COLOR.white : COLOR.black
    board.showPromotionDialog?.(to, color, (result) => {
      if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected && result.piece) {
        onMoveRef.current({ from, to, promotion: result.piece.charAt(1) as PieceSymbol })
      } else {
        void board.setPosition(fenRef.current, false)
      }
    })
  }, [])

  const handleMoveInput = useCallback(
    (event: MoveInputEvent): boolean => {
      const board = boardRef.current
      if (!board) return false

      switch (event.type) {
        case INPUT_EVENT_TYPE.moveInputStarted: {
          const from = event.squareFrom
          if (!from) return false
          selectionRef.current = { from, piece: event.piece ?? null }
          const targets = legalMovesRef.current[from] ?? []
          board.removeLegalMovesMarkers?.()
          if (targets.length > 0) {
            board.addLegalMovesMarkers?.(targets.map((to) => ({ to })))
          }
          return true
        }
        case INPUT_EVENT_TYPE.validateMoveInput: {
          const { squareFrom: from, squareTo: to } = event
          if (!from || !to) return false
          return (legalMovesRef.current[from] ?? []).includes(to)
        }
        case INPUT_EVENT_TYPE.moveInputCanceled: {
          board.removeLegalMovesMarkers?.()
          selectionRef.current = null
          return false
        }
        case INPUT_EVENT_TYPE.moveInputFinished: {
          board.removeLegalMovesMarkers?.()
          const { squareFrom: from, squareTo: to } = event
          const piece = selectionRef.current?.piece ?? null
          selectionRef.current = null
          if (from && to) commitFinishedMove(from, to, piece)
          return true
        }
        default:
          return false
      }
    },
    [commitFinishedMove],
  )

  // Create the board once.
  useEffect(() => {
    if (!containerRef.current) return
    const board = new Chessboard(containerRef.current, {
      position: fenRef.current,
      orientation: playerColorToBoardColor(orientation),
      responsive: true,
      assetsUrl: '/cm-chessboard/',
      style: {
        cssClass: 'default',
        showCoordinates: true,
        animationDuration: 220,
      },
      extensions: [
        { class: Markers, props: { autoMarkers: null } },
        { class: PromotionDialog },
      ],
    })
    boardRef.current = board

    return () => {
      board.destroy()
      boardRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the board position in sync with the server state.
  useEffect(() => {
    const board = boardRef.current
    if (!board || fen === fenRef.current) return
    fenRef.current = fen
    void board.setPosition(fen, true)
  }, [fen])

  // Keep the board orientation in sync.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    void board.setOrientation(playerColorToBoardColor(orientation), true)
  }, [orientation])

  // Enable or disable interaction with the player's own pieces.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    board.disableMoveInput()
    if (interactive) {
      board.enableMoveInput(handleMoveInput, playerColorToBoardColor(orientation))
    }
  }, [interactive, orientation, handleMoveInput])

  return { containerRef }
}
