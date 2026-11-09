export type Player = 'X' | 'O';

export type GameStatus = 'playing' | 'won' | 'draw';

export type LineKind = 'row' | 'column' | 'diagonal';

export type Board = number[];

export interface PlayerNames {
  X: string;
  O: string;
}

export interface LineDefinition {
  id: string;
  label: string;
  shortLabel: string;
  ariaLabel: string;
  kind: LineKind;
  cells: readonly [number, number, number];
}

export interface LineSum extends LineDefinition {
  values: [number, number, number];
  sum: number;
  /** Set only when the line sums to +15 (X) or −15 (O). */
  player: Player | null;
}

export interface WinningLine extends LineSum {
  player: Player;
}

export interface Move {
  cell: number;
  player: Player;
  value: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: WinningLine | null;
  moves: Move[];
}

export interface Scores {
  X: number;
  O: number;
  draws: number;
}

export interface MatchState {
  game: GameState;
  scores: Scores;
}

export type MatchAction =
  | { type: 'move'; cell: number }
  | { type: 'nextRound' }
  | { type: 'resetMatch' };

export type Theme = 'midnight' | 'daylight';
