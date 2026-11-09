import { describe, expect, it } from 'vitest';
import {
  boardAtMove,
  createEmptyBoard,
  createGame,
  evaluateBoard,
  findWinningLine,
  formatEquation,
  formatLineEquation,
  formatSigned,
  getLineSums,
  magicValue,
  playMove,
} from './engine';
import {
  CELL_NAMES,
  isCellIndex,
  LINES,
  MAGIC_SQUARE,
  signedValue,
} from './magicSquare';
import type { Board, Player } from './types';

function boardFromLine(cells: readonly number[], player: Player): Board {
  const board = createEmptyBoard();
  for (const cell of cells) {
    board[cell] = signedValue(cell, player);
  }
  return board;
}

describe('magic square', () => {
  it('uses the fixed 8 1 6 / 3 5 7 / 4 9 2 square', () => {
    expect(MAGIC_SQUARE).toEqual([8, 1, 6, 3, 5, 7, 4, 9, 2]);
  });

  it('defines exactly eight unique real lines', () => {
    expect(LINES).toHaveLength(8);
    expect(new Set(LINES.map((line) => line.id)).size).toBe(8);
    expect(new Set(LINES.map((line) => [...line.cells].join('-'))).size).toBe(8);
  });

  it('has every row, column and diagonal add to 15', () => {
    for (const line of LINES) {
      const sum = line.cells.reduce(
        (total, cell) => total + MAGIC_SQUARE[cell],
        0,
      );
      expect(sum, line.label).toBe(15);
    }
  });

  it('stores positive values for X and negative values for O', () => {
    expect(signedValue(0, 'X')).toBe(8);
    expect(signedValue(0, 'O')).toBe(-8);
    expect(signedValue(4, 'X')).toBe(5);
    expect(signedValue(4, 'O')).toBe(-5);
  });

  it('validates cell indices', () => {
    expect([0, 1, 4, 8].every(isCellIndex)).toBe(true);
    expect([-1, 9, 1.5, Number.NaN].some(isCellIndex)).toBe(false);
  });

  it('gives every cell a unique readable name', () => {
    expect(CELL_NAMES).toHaveLength(9);
    expect(new Set(CELL_NAMES).size).toBe(9);
  });

  it('exposes the fixed value for a cell without mutating it', () => {
    expect(magicValue(8)).toBe(2);
    expect(MAGIC_SQUARE[8]).toBe(2);
  });
});

describe('initial game state', () => {
  it('creates nine empty cells', () => {
    expect(createEmptyBoard()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('starts with X to move and no result', () => {
    const game = createGame();
    expect(game.currentPlayer).toBe('X');
    expect(game.status).toBe('playing');
    expect(game.winner).toBeNull();
    expect(game.winningLine).toBeNull();
    expect(game.moves).toEqual([]);
  });
});

describe('line sums', () => {
  it('starts all eight sums at zero with no winner', () => {
    const sums = getLineSums(createEmptyBoard());
    expect(sums).toHaveLength(8);
    for (const line of sums) {
      expect(line.sum).toBe(0);
      expect(line.player).toBeNull();
    }
  });

  it('shows mixed and incomplete lines without declaring a winner', () => {
    const board = createEmptyBoard();
    board[0] = 8; // X
    board[1] = -1; // O
    board[2] = 6; // X
    board[4] = 5; // X, incomplete middle row

    const rowOne = getLineSums(board).find((line) => line.id === 'row-1');
    const rowTwo = getLineSums(board).find((line) => line.id === 'row-2');

    expect(rowOne?.sum).toBe(13);
    expect(rowOne?.player).toBeNull();
    expect(rowTwo?.sum).toBe(5);
    expect(rowTwo?.player).toBeNull();
    expect(evaluateBoard(board).status).toBe('playing');
  });

  it('does not treat an arbitrary triple as a line', () => {
    const board = createEmptyBoard();
    board[0] = 8;
    board[1] = 1;
    board[3] = 3;
    // 8 + 1 + 3 = 12, and cells 0/1/3 are not one of the eight real lines.
    expect(evaluateBoard(board).status).toBe('playing');
    expect(findWinningLine(board)).toBeNull();
  });
});

describe('winning lines', () => {
  it.each(LINES.map((line) => [line.id, line.cells] as const))(
    'detects X on %s',
    (id, cells) => {
      const board = boardFromLine(cells, 'X');
      const line = getLineSums(board).find((entry) => entry.id === id);

      expect(line?.sum).toBe(15);
      expect(line?.player).toBe('X');
      expect(findWinningLine(board)?.id).toBe(id);

      const outcome = evaluateBoard(board);
      expect(outcome.status).toBe('won');
      expect(outcome.winner).toBe('X');
      expect(outcome.winningLine?.id).toBe(id);
    },
  );

  it.each(LINES.map((line) => [line.id, line.cells] as const))(
    'detects O on %s',
    (id, cells) => {
      const board = boardFromLine(cells, 'O');
      const line = getLineSums(board).find((entry) => entry.id === id);

      expect(line?.sum).toBe(-15);
      expect(line?.player).toBe('O');
      expect(findWinningLine(board)?.id).toBe(id);

      const outcome = evaluateBoard(board);
      expect(outcome.status).toBe('won');
      expect(outcome.winner).toBe('O');
      expect(outcome.winningLine?.id).toBe(id);
    },
  );

  it('checks the winner before deciding a full board is a draw', () => {
    // Full board, with X completing the top row: 8 + 1 + 6 = 15.
    const board: Board = [8, 1, 6, -3, -5, 7, -4, 9, -2];
    const outcome = evaluateBoard(board);

    expect(board.every((value) => value !== 0)).toBe(true);
    expect(outcome.status).toBe('won');
    expect(outcome.winner).toBe('X');
    expect(outcome.winningLine?.id).toBe('row-1');
  });

  it('declares a draw only when the board is full with no real line at ±15', () => {
    // A reachable full board where every line mixes signs.
    const board: Board = [8, -1, 6, -3, 5, 7, -4, 9, -2];
    const outcome = evaluateBoard(board);

    expect(board.every((value) => value !== 0)).toBe(true);
    expect(findWinningLine(board)).toBeNull();
    expect(outcome.status).toBe('draw');
    expect(outcome.winner).toBeNull();
    expect(outcome.winningLine).toBeNull();
  });
});

describe('playMove', () => {
  it('lets X start and stores the positive magic value', () => {
    const game = playMove(createGame(), 0);

    expect(game.board[0]).toBe(8);
    expect(game.moves).toEqual([{ cell: 0, player: 'X', value: 8 }]);
    expect(game.currentPlayer).toBe('O');
    expect(game.status).toBe('playing');
  });

  it('stores the negative value when O moves', () => {
    const afterX = playMove(createGame(), 4);
    const afterO = playMove(afterX, 0);

    expect(afterO.board[0]).toBe(-8);
    expect(afterO.moves[1]).toEqual({ cell: 0, player: 'O', value: -8 });
    expect(afterO.currentPlayer).toBe('X');
  });

  it('rejects an occupied cell without switching turns', () => {
    const afterX = playMove(createGame(), 0);
    const attempted = playMove(afterX, 0);

    expect(attempted).toBe(afterX);
    expect(attempted.currentPlayer).toBe('O');
    expect(attempted.moves).toHaveLength(1);
  });

  it('rejects out-of-range and non-integer cells', () => {
    const game = createGame();

    for (const cell of [-1, 9, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(playMove(game, cell)).toBe(game);
    }
  });

  it('locks the board after a win and never switches turns again', () => {
    let game = createGame();
    for (const cell of [0, 1, 4, 2, 8]) {
      game = playMove(game, cell);
    }

    expect(game.status).toBe('won');
    expect(game.winner).toBe('X');
    expect(game.winningLine?.id).toBe('diag-down');
    expect(game.currentPlayer).toBe('O');

    const locked = playMove(game, 3);
    expect(locked).toBe(game);
    expect(locked.moves).toHaveLength(5);
  });

  it('plays a full round to a draw', () => {
    let game = createGame();
    const sequence = [0, 1, 2, 3, 4, 6, 5, 8, 7];

    for (const cell of sequence) {
      expect(game.status).toBe('playing');
      game = playMove(game, cell);
    }

    expect(game.moves).toHaveLength(9);
    expect(game.status).toBe('draw');
    expect(game.winner).toBeNull();
    expect(game.winningLine).toBeNull();
  });

  it('lets O win with a negative line', () => {
    let game = createGame();
    for (const cell of [0, 1, 2, 4, 8, 7]) {
      game = playMove(game, cell);
    }

    expect(game.status).toBe('won');
    expect(game.winner).toBe('O');
    expect(game.winningLine?.id).toBe('col-2');
    expect(game.winningLine?.sum).toBe(-15);
  });

  it('does not mutate the previous state', () => {
    const game = createGame();
    const next = playMove(game, 0);

    expect(game.board).toEqual(createEmptyBoard());
    expect(game.moves).toEqual([]);
    expect(next).not.toBe(game);
    expect(next.board).not.toBe(game.board);
    expect(next.moves).not.toBe(game.moves);
  });
});

describe('replay snapshots', () => {
  it('reconstructs each step without touching the finished game', () => {
    let game = createGame();
    for (const cell of [0, 1, 4, 2, 8]) {
      game = playMove(game, cell);
    }

    const finalBoard = [...game.board];
    const finalMoves = game.moves.map((move) => ({ ...move }));

    expect(boardAtMove(game.moves, 0)).toEqual(createEmptyBoard());
    expect(boardAtMove(game.moves, 1)[0]).toBe(8);
    expect(boardAtMove(game.moves, 5)).toEqual(finalBoard);
    expect(boardAtMove(game.moves, 99)).toEqual(finalBoard);
    expect(boardAtMove(game.moves, -4)).toEqual(createEmptyBoard());

    expect(game.board).toEqual(finalBoard);
    expect(game.moves).toEqual(finalMoves);
  });

  it('returns a fresh board rather than a shared reference', () => {
    const snapshot = boardAtMove([], 0);
    snapshot[0] = 8;

    expect(boardAtMove([], 0)).toEqual(createEmptyBoard());
  });
});

describe('formatting', () => {
  it('formats signed values with a true minus sign', () => {
    expect(formatSigned(8)).toBe('+8');
    expect(formatSigned(-8)).toBe('−8');
    expect(formatSigned(0)).toBe('0');
  });

  it('formats a complete winning equation', () => {
    expect(formatEquation([8, 1, 6], 15, 'X')).toBe(
      '+8 +1 +6 = +15 → X wins',
    );
    expect(formatEquation([-4, -9, -2], -15, 'O')).toBe(
      '−4 −9 −2 = −15 → O wins',
    );
  });

  it('formats an individual line equation', () => {
    const line = getLineSums(boardFromLine(LINES[0].cells, 'X'))[0];
    expect(formatLineEquation(line)).toBe('+8 +1 +6 = +15');
  });
});
