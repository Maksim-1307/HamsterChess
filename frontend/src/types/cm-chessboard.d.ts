declare module 'cm-chessboard' {
  export type BoardColor = 'w' | 'b'

  export const COLOR: {
    readonly white: 'w'
    readonly black: 'b'
  }

  export const INPUT_EVENT_TYPE: {
    readonly moveInputStarted: 'moveInputStarted'
    readonly movingOverSquare: 'movingOverSquare'
    readonly validateMoveInput: 'validateMoveInput'
    readonly moveInputCanceled: 'moveInputCanceled'
    readonly moveInputFinished: 'moveInputFinished'
  }

  export const BORDER_TYPE: {
    readonly none: 'none'
    readonly thin: 'thin'
    readonly frame: 'frame'
  }

  export const FEN: {
    readonly start: string
    readonly empty: string
  }

  export const PIECE: Record<string, string>

  export const PIECE_TYPE: {
    readonly pawn: 'p'
    readonly knight: 'n'
    readonly bishop: 'b'
    readonly rook: 'r'
    readonly queen: 'q'
    readonly king: 'k'
  }

  export const PIECES_FILE_TYPE: {
    readonly svgSprite: 'svgSprite'
  }

  export interface MoveInputEvent {
    type: string
    squareFrom?: string
    squareTo?: string
    piece?: string | null
    animate?: boolean
    reason?: string
    legalMove?: boolean
  }

  export type MoveInputHandler = (event: MoveInputEvent) => boolean | void

  export interface PromotionDialogResult {
    type: string
    square?: string
    /** full piece code such as "wq" */
    piece?: string
  }

  export type ExtensionClass = new (chessboard: Chessboard, props?: Record<string, unknown>) => unknown

  export interface ChessboardProps {
    position?: string
    orientation?: BoardColor
    responsive?: boolean
    assetsUrl?: string
    assetsCache?: boolean
    style?: {
      cssClass?: string
      showCoordinates?: boolean
      borderType?: string
      aspectRatio?: number
      pieces?: { type?: string; file?: string; tileSize?: number }
      animationDuration?: number
    }
    extensions?: { class: ExtensionClass; props?: Record<string, unknown> }[]
  }

  export class Chessboard {
    constructor(context: HTMLElement, props?: ChessboardProps)

    /** Added at runtime by the Markers extension. */
    addMarker?: (type: unknown, square: string) => void
    removeMarkers?: (type?: unknown, square?: string) => void
    getMarkers?: (type?: unknown, square?: string) => unknown[]
    addLegalMovesMarkers?: (moves: { to: string; promotion?: string }[]) => void
    removeLegalMovesMarkers?: () => void

    /** Added at runtime by the PromotionDialog extension. */
    showPromotionDialog?: (
      square: string,
      color: BoardColor,
      callback: (result: PromotionDialogResult) => void,
    ) => void
    isPromotionDialogShown?: () => boolean

    setPosition(fen: string, animated?: boolean): Promise<void>
    setOrientation(color: BoardColor, animated?: boolean): Promise<void>
    getOrientation(): BoardColor
    getPosition(): string
    setPiece(square: string, piece: string | null, animated?: boolean): Promise<void>
    getPiece(square: string): string | null
    enableMoveInput(eventHandler: MoveInputHandler, color?: BoardColor): void
    disableMoveInput(): void
    isMoveInputEnabled(): boolean
    destroy(): void
  }
}

declare module 'cm-chessboard/src/extensions/markers/Markers.js' {
  import type { Chessboard } from 'cm-chessboard'

  export interface MarkerType {
    readonly class: string
    readonly slice: string
    readonly position?: string
  }

  export const MARKER_TYPE: {
    readonly frame: MarkerType
    readonly framePrimary: MarkerType
    readonly frameDanger: MarkerType
    readonly circle: MarkerType
    readonly circlePrimary: MarkerType
    readonly circleDanger: MarkerType
    readonly circleDangerFilled: MarkerType
    readonly square: MarkerType
    readonly dot: MarkerType
    readonly bevel: MarkerType
  }

  export class Markers {
    constructor(chessboard: Chessboard, props?: Record<string, unknown>)
  }
}

declare module 'cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js' {
  import type { Chessboard } from 'cm-chessboard'

  export const PROMOTION_DIALOG_RESULT_TYPE: {
    readonly pieceSelected: 'pieceSelected'
    readonly canceled: 'canceled'
  }

  export class PromotionDialog {
    constructor(chessboard: Chessboard, props?: Record<string, unknown>)
  }
}
