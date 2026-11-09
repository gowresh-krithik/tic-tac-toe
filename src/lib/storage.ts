import type { PlayerNames, Scores, Theme } from '../game/types';

export const STORAGE_KEYS = {
  names: 'ttt.names.v1',
  scores: 'ttt.scores.v1',
  sound: 'ttt.sound.v1',
  theme: 'ttt.theme.v1',
  mathsMode: 'ttt.mathsMode.v1',
} as const;

export const DEFAULT_NAMES: PlayerNames = {
  X: 'Player X',
  O: 'Player O',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isScores(value: unknown): value is Scores {
  if (!isRecord(value)) return false;
  return (['X', 'O', 'draws'] as const).every((key) => {
    const score = value[key];
    return Number.isInteger(score) && typeof score === 'number' && score >= 0;
  });
}

export function isNames(value: unknown): value is PlayerNames {
  if (!isRecord(value)) return false;
  return (['X', 'O'] as const).every((key) => {
    const name = value[key];
    return typeof name === 'string' && name.length <= 24;
  });
}

export function isTheme(value: unknown): value is Theme {
  return value === 'midnight' || value === 'daylight';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function readStored<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full. The game still works in memory.
  }
}

export function nameFor(names: PlayerNames, player: 'X' | 'O'): string {
  return names[player].trim() || `Player ${player}`;
}
