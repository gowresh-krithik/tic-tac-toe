import type { LineDefinition, Player } from './types';

/**
 * The fixed magic square. Every row, column and diagonal sums to 15.
 *
 *   8  1  6
 *   3  5  7
 *   4  9  2
 *
 * This constant is deliberately kept separate from the signed game board.
 */
export const MAGIC_SQUARE = [8, 1, 6, 3, 5, 7, 4, 9, 2] as const;

export const CELL_NAMES = [
  'top-left',
  'top-middle',
  'top-right',
  'middle-left',
  'centre',
  'middle-right',
  'bottom-left',
  'bottom-middle',
  'bottom-right',
] as const;

/** The only eight lines the game is allowed to test. */
export const LINES: readonly LineDefinition[] = [
  {
    id: 'row-1',
    label: 'Row 1',
    shortLabel: 'R1',
    ariaLabel: 'top row',
    kind: 'row',
    cells: [0, 1, 2],
  },
  {
    id: 'row-2',
    label: 'Row 2',
    shortLabel: 'R2',
    ariaLabel: 'middle row',
    kind: 'row',
    cells: [3, 4, 5],
  },
  {
    id: 'row-3',
    label: 'Row 3',
    shortLabel: 'R3',
    ariaLabel: 'bottom row',
    kind: 'row',
    cells: [6, 7, 8],
  },
  {
    id: 'col-1',
    label: 'Column 1',
    shortLabel: 'C1',
    ariaLabel: 'left column',
    kind: 'column',
    cells: [0, 3, 6],
  },
  {
    id: 'col-2',
    label: 'Column 2',
    shortLabel: 'C2',
    ariaLabel: 'middle column',
    kind: 'column',
    cells: [1, 4, 7],
  },
  {
    id: 'col-3',
    label: 'Column 3',
    shortLabel: 'C3',
    ariaLabel: 'right column',
    kind: 'column',
    cells: [2, 5, 8],
  },
  {
    id: 'diag-down',
    label: 'Diagonal ↘',
    shortLabel: 'D↘',
    ariaLabel: 'top-left to bottom-right diagonal',
    kind: 'diagonal',
    cells: [0, 4, 8],
  },
  {
    id: 'diag-up',
    label: 'Diagonal ↙',
    shortLabel: 'D↙',
    ariaLabel: 'top-right to bottom-left diagonal',
    kind: 'diagonal',
    cells: [2, 4, 6],
  },
];

export function signedValue(cell: number, player: Player): number {
  return player === 'X' ? MAGIC_SQUARE[cell] : -MAGIC_SQUARE[cell];
}

export function isCellIndex(cell: number): boolean {
  return Number.isInteger(cell) && cell >= 0 && cell < 9;
}

export function cellCoordinate(cell: number): string {
  return `R${Math.floor(cell / 3) + 1}C${(cell % 3) + 1}`;
}
