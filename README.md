# Tic Tac Toe · Magic Square Edition

A local two-player Tic Tac Toe game decided by a signed magic square. X stores
positive values, O stores negative values, and the first player to make one of
the eight real lines sum to **+15** (X) or **−15** (O) wins.

Built with React 19, TypeScript, Vite, and Vitest. No UI framework.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually <http://127.0.0.1:5173/>).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check with `tsc --noEmit`, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

Requires Node 20.19+ or 22.12+. This workspace was verified with Node 26.

## The algorithm

The board always uses the same fixed magic square:

```
8 1 6
3 5 7
4 9 2
```

- X writes the cell's fixed value as a positive number.
- O writes the same fixed value as a negative number.
- Only the eight real lines are checked: three rows, three columns, and two
  diagonals. Broken or wrapping lines are never treated as wins.
- A line sums to **+15** for X or **−15** for O.
- The winner is checked before the draw, so a final move that both fills the
  board and completes a line is a win, not a draw.
- Occupied cells, post-game moves, and replay clicks are rejected without
  switching turns.
- Scores update inside the reducer only on the transition into a finished
  round, so a result can never be scored twice.

## Project structure

```
src/
  game/                 Pure, framework-free game logic
    magicSquare.ts      Fixed square, cell names, eight line definitions
    engine.ts           Board creation, win/line-sum checks, equations
    matchReducer.ts     Moves, exactly-once scoring, next round, reset
    types.ts            Shared domain types
    engine.test.ts      All eight lines, mixed/incomplete lines, draws
    matchReducer.test.ts Score-once, replay safety, next round/reset
  hooks/
    usePersistentState.ts  localStorage-backed React state
    useSound.ts            Generated Web Audio sound effects
  lib/
    storage.ts          Storage keys, validators, defaults
  components/           Board, scoreboard, Maths Mode, replay, timeline, dialogs
  styles/               Design system: base, layout, game, panels
  App.tsx               Orchestration, replay, announcements, layout
  main.tsx              React entry point
```

## Features

- Turn indicator, editable player names, scoreboard (X / O / draws), Next
  Round, and Reset Match with confirmation.
- Maths Mode: fixed and signed values in every cell, all eight live line sums,
  hover/focus/tap line highlighting, animated sums, and the exact winning
  equation.
- Move timeline and a read-only Replay Round with play/pause, step, and scrub
  controls. Replay never changes scores or the recorded result.
- Persisted names, scores, sound preference, theme, and Maths Mode.
- Dark “midnight” and light “daylight” themes; responsive three-column desktop
  layout that stacks cleanly on tablet and mobile.
- Mouse, touch, and keyboard support (arrow keys, Home/End, Enter/Space),
  visible focus, screen-reader announcements, non-colour-only win cues,
  reduced-motion support, and rapid-click protection.

## Verification

- `npm run build` passes with no TypeScript or Vite errors.
- `npm test` passes 58 tests across 2 files.
- Functional checks cover all eight winning lines, mixed and incomplete lines,
  win-before-draw ordering, occupied and post-game moves, score-once behaviour,
  replay safety, Next Round, Reset Match, rapid double-clicks, name persistence,
  theme/sound persistence, and keyboard activation.
- Responsive geometry was checked at 1440, 1280, 1180, 1081, 1080, 900, 768,
  600, 599, 390, 361, 360, and 320 px with no horizontal overflow.
- An accessibility audit found no unnamed interactive controls, duplicate IDs,
  positive tab indices, missing live regions, or low-contrast text in either
  theme.
