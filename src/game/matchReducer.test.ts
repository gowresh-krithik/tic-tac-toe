import { describe, expect, it } from 'vitest';
import { boardAtMove } from './engine';
import {
  createMatchState,
  EMPTY_SCORES,
  matchReducer,
} from './matchReducer';
import type { MatchState, Scores } from './types';

const X_WIN_SEQUENCE = [0, 1, 4, 2, 8] as const;
const O_WIN_SEQUENCE = [0, 1, 2, 4, 8, 7] as const;
const DRAW_SEQUENCE = [0, 1, 2, 3, 4, 6, 5, 8, 7] as const;

function apply(
  state: MatchState,
  cells: readonly number[],
): MatchState {
  return cells.reduce(
    (current, cell) => matchReducer(current, { type: 'move', cell }),
    state,
  );
}

describe('createMatchState', () => {
  it('starts with an empty board and empty scores by default', () => {
    const state = createMatchState();

    expect(state.game.moves).toEqual([]);
    expect(state.game.currentPlayer).toBe('X');
    expect(state.game.status).toBe('playing');
    expect(state.scores).toEqual(EMPTY_SCORES);
  });

  it('accepts persisted scores', () => {
    const scores: Scores = { X: 3, O: 2, draws: 1 };
    const state = createMatchState(scores);

    expect(state.scores).toEqual(scores);
    expect(state.game.moves).toEqual([]);
  });
});

describe('score transitions', () => {
  it('does not change the score during a round', () => {
    const state = matchReducer(createMatchState(), { type: 'move', cell: 0 });

    expect(state.scores).toEqual({ X: 0, O: 0, draws: 0 });
    expect(state.game.currentPlayer).toBe('O');
  });

  it('awards X exactly once on a winning move', () => {
    const state = apply(createMatchState(), X_WIN_SEQUENCE);

    expect(state.game.status).toBe('won');
    expect(state.game.winner).toBe('X');
    expect(state.scores).toEqual({ X: 1, O: 0, draws: 0 });
  });

  it('awards O exactly once on a winning move', () => {
    const state = apply(createMatchState(), O_WIN_SEQUENCE);

    expect(state.game.status).toBe('won');
    expect(state.game.winner).toBe('O');
    expect(state.scores).toEqual({ X: 0, O: 1, draws: 0 });
  });

  it('awards a draw exactly once when the board fills', () => {
    const state = apply(createMatchState(), DRAW_SEQUENCE);

    expect(state.game.status).toBe('draw');
    expect(state.scores).toEqual({ X: 0, O: 0, draws: 1 });
  });

  it('does not score again after the round has ended', () => {
    const won = apply(createMatchState(), X_WIN_SEQUENCE);

    for (const cell of [3, 5, 6, 7, 0, 8]) {
      const attempted = matchReducer(won, { type: 'move', cell });
      expect(attempted).toBe(won);
      expect(attempted.scores).toEqual({ X: 1, O: 0, draws: 0 });
    }
  });

  it('does not score again after a draw', () => {
    const drawn = apply(createMatchState(), DRAW_SEQUENCE);
    const attempted = matchReducer(drawn, { type: 'move', cell: 0 });

    expect(attempted).toBe(drawn);
    expect(attempted.scores).toEqual({ X: 0, O: 0, draws: 1 });
  });

  it('accumulates scores across rounds and keeps them on nextRound', () => {
    let state = createMatchState();
    state = apply(state, X_WIN_SEQUENCE);
    state = matchReducer(state, { type: 'nextRound' });
    state = apply(state, O_WIN_SEQUENCE);

    expect(state.scores).toEqual({ X: 1, O: 1, draws: 0 });

    state = matchReducer(state, { type: 'nextRound' });
    expect(state.scores).toEqual({ X: 1, O: 1, draws: 0 });
    expect(state.game.moves).toEqual([]);
    expect(state.game.currentPlayer).toBe('X');
  });
});

describe('invalid and locked moves', () => {
  it('ignores an occupied cell and keeps the turn', () => {
    const afterX = matchReducer(createMatchState(), { type: 'move', cell: 0 });
    const attempted = matchReducer(afterX, { type: 'move', cell: 0 });

    expect(attempted).toBe(afterX);
    expect(attempted.game.currentPlayer).toBe('O');
    expect(attempted.game.moves).toHaveLength(1);
  });

  it('ignores out-of-range and non-integer cells', () => {
    const state = createMatchState();

    for (const cell of [-1, 9, 2.5, Number.NaN]) {
      expect(matchReducer(state, { type: 'move', cell })).toBe(state);
    }
  });

  it('keeps the result and scores stable while a round is locked', () => {
    const won = apply(createMatchState(), X_WIN_SEQUENCE);
    const locked = matchReducer(won, { type: 'move', cell: 3 });

    expect(locked).toBe(won);
    expect(locked.game.winningLine?.id).toBe('diag-down');
    expect(locked.scores).toEqual({ X: 1, O: 0, draws: 0 });
  });
});

describe('round and match controls', () => {
  it('nextRound clears the board but preserves scores and names-independent state', () => {
    const won = apply(createMatchState(), X_WIN_SEQUENCE);
    const next = matchReducer(won, { type: 'nextRound' });

    expect(next.game.board.every((value) => value === 0)).toBe(true);
    expect(next.game.moves).toEqual([]);
    expect(next.game.status).toBe('playing');
    expect(next.game.winner).toBeNull();
    expect(next.game.winningLine).toBeNull();
    expect(next.game.currentPlayer).toBe('X');
    expect(next.scores).toEqual({ X: 1, O: 0, draws: 0 });
  });

  it('resetMatch clears the board and every score', () => {
    let state = apply(createMatchState({ X: 4, O: 3, draws: 2 }), X_WIN_SEQUENCE);
    state = matchReducer(state, { type: 'resetMatch' });

    expect(state.game.board.every((value) => value === 0)).toBe(true);
    expect(state.game.moves).toEqual([]);
    expect(state.game.status).toBe('playing');
    expect(state.game.currentPlayer).toBe('X');
    expect(state.scores).toEqual({ X: 0, O: 0, draws: 0 });
  });
});

describe('replay safety', () => {
  it('never changes scores or the finished game while replaying', () => {
    const finished = apply(createMatchState(), X_WIN_SEQUENCE);
    const scoresBefore = { ...finished.scores };
    const boardBefore = [...finished.game.board];
    const movesBefore = finished.game.moves.map((move) => ({ ...move }));

    for (let step = 0; step <= finished.game.moves.length; step += 1) {
      const snapshot = boardAtMove(finished.game.moves, step);
      expect(snapshot).toHaveLength(9);
      expect(finished.scores).toEqual(scoresBefore);
    }

    expect(finished.game.board).toEqual(boardBefore);
    expect(finished.game.moves).toEqual(movesBefore);
    expect(finished.game.status).toBe('won');
    expect(finished.game.winner).toBe('X');
    expect(finished.scores).toEqual({ X: 1, O: 0, draws: 0 });
  });
});
