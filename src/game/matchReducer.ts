import { createGame, playMove } from './engine';
import type { MatchAction, MatchState, Scores } from './types';

export const EMPTY_SCORES: Scores = { X: 0, O: 0, draws: 0 };

export function createMatchState(scores: Scores = EMPTY_SCORES): MatchState {
  return { game: createGame(), scores };
}

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'move': {
      const game = playMove(state.game, action.cell);
      if (game === state.game) return state;

      // A score changes in the same transition that ends a round, exactly once.
      let scores = state.scores;
      if (game.status === 'won' && game.winner) {
        scores = { ...scores, [game.winner]: scores[game.winner] + 1 };
      } else if (game.status === 'draw') {
        scores = { ...scores, draws: scores.draws + 1 };
      }

      return { game, scores };
    }
    case 'nextRound':
      return { ...state, game: createGame() };
    case 'resetMatch':
      return { game: createGame(), scores: { ...EMPTY_SCORES } };
    default:
      return state;
  }
}
