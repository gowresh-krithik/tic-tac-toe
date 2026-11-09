import { isCellIndex, LINES, MAGIC_SQUARE, signedValue } from './magicSquare';
import type {
  Board,
  GameState,
  LineSum,
  Move,
  Player,
  WinningLine,
} from './types';

const MINUS = '−';

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => 0);
}

export function createGame(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    winningLine: null,
    moves: [],
  };
}

export function getLineSums(board: Board): LineSum[] {
  return LINES.map((line) => {
    const values = line.cells.map((cell) => board[cell]) as [
      number,
      number,
      number,
    ];
    const sum = values[0] + values[1] + values[2];
    const player: Player | null = sum === 15 ? 'X' : sum === -15 ? 'O' : null;

    return { ...line, values, sum, player };
  });
}

/**
 * Tests exactly the eight rows, columns and diagonals. No arbitrary triples
 * and no whole-board total.
 */
export function findWinningLine(board: Board): WinningLine | null {
  for (const line of getLineSums(board)) {
    if (line.player) {
      return { ...line, player: line.player };
    }
  }

  return null;
}

export function evaluateBoard(board: Board): {
  status: GameState['status'];
  winner: Player | null;
  winningLine: WinningLine | null;
} {
  // Winner first: a full board can still be a win.
  const winningLine = findWinningLine(board);
  if (winningLine) {
    return { status: 'won', winner: winningLine.player, winningLine };
  }

  if (board.every((value) => value !== 0)) {
    return { status: 'draw', winner: null, winningLine: null };
  }

  return { status: 'playing', winner: null, winningLine: null };
}

/**
 * Pure move application. Invalid, occupied, out-of-range and post-game moves
 * return the original state unchanged, so turns can never be lost or skipped.
 */
export function playMove(game: GameState, cell: number): GameState {
  if (game.status !== 'playing') return game;
  if (!isCellIndex(cell) || game.board[cell] !== 0) return game;

  const player = game.currentPlayer;
  const value = signedValue(cell, player);
  const board = [...game.board];
  board[cell] = value;

  const outcome = evaluateBoard(board);
  const move: Move = { cell, player, value };

  return {
    board,
    currentPlayer: player === 'X' ? 'O' : 'X',
    status: outcome.status,
    winner: outcome.winner,
    winningLine: outcome.winningLine,
    moves: [...game.moves, move],
  };
}

/** Board snapshot for read-only replay. `step` is the number of moves shown. */
export function boardAtMove(moves: readonly Move[], step: number): Board {
  const board = createEmptyBoard();
  const safeStep = Math.max(0, Math.min(step, moves.length));

  for (let index = 0; index < safeStep; index += 1) {
    const move = moves[index];
    board[move.cell] = move.value;
  }

  return board;
}

export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${MINUS}${Math.abs(value)}`;
  return '0';
}

export function formatEquation(
  values: readonly number[],
  sum: number,
  player: Player,
): string {
  return `${values.map(formatSigned).join(' ')} = ${formatSigned(sum)} → ${player} wins`;
}

export function formatLineEquation(line: LineSum): string {
  return `${line.values.map(formatSigned).join(' ')} = ${formatSigned(line.sum)}`;
}

export function magicValue(cell: number): number {
  return MAGIC_SQUARE[cell];
}
