import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { ActionBar } from './components/ActionBar';
import { Board } from './components/Board';
import { BrandMark } from './components/BrandMark';
import { ConfirmDialog } from './components/ConfirmDialog';
import { HowItWorks } from './components/HowItWorks';
import { LabeledSwitch } from './components/LabeledSwitch';
import { LineSumsCard } from './components/LineSumsCard';
import { MathsCard } from './components/MathsCard';
import { MathsExplainer } from './components/MathsExplainer';
import { ReplayControls } from './components/ReplayControls';
import { ResultCard } from './components/ResultCard';
import { RoundBanner } from './components/RoundBanner';
import { Scoreboard } from './components/Scoreboard';
import { Timeline } from './components/Timeline';
import { TurnIndicator } from './components/TurnIndicator';
import {
  MoonIcon,
  SparklesIcon,
  SunIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from './components/icons';
import {
  boardAtMove,
  evaluateBoard,
  formatEquation,
  getLineSums,
} from './game/engine';
import { CELL_NAMES } from './game/magicSquare';
import {
  createMatchState,
  EMPTY_SCORES,
  matchReducer,
} from './game/matchReducer';
import type { MatchState, Player, PlayerNames, Scores, Theme } from './game/types';
import { usePersistentState } from './hooks/usePersistentState';
import { useSound } from './hooks/useSound';
import {
  DEFAULT_NAMES,
  isBoolean,
  isNames,
  isScores,
  isTheme,
  nameFor,
  readStored,
  STORAGE_KEYS,
  writeStored,
} from './lib/storage';

function createInitialMatch(): MatchState {
  const scores = readStored<Scores>(
    STORAGE_KEYS.scores,
    EMPTY_SCORES,
    isScores,
  );
  return createMatchState(scores);
}

const REPLAY_INTERVAL_MS = 760;
const MOVE_LOCK_MS = 90;

export default function App() {
  const [match, dispatch] = useReducer(
    matchReducer,
    undefined,
    createInitialMatch,
  );
  const [names, setNames] = usePersistentState<PlayerNames>(
    STORAGE_KEYS.names,
    DEFAULT_NAMES,
    isNames,
  );
  const [soundOn, setSoundOn] = usePersistentState<boolean>(
    STORAGE_KEYS.sound,
    true,
    isBoolean,
  );
  const [theme, setTheme] = usePersistentState<Theme>(
    STORAGE_KEYS.theme,
    'midnight',
    isTheme,
  );
  const [mathsMode, setMathsMode] = usePersistentState<boolean>(
    STORAGE_KEYS.mathsMode,
    false,
    isBoolean,
  );

  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [pinnedLineId, setPinnedLineId] = useState<string | null>(null);
  const [replayStep, setReplayStep] = useState<number | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const lastMoveAtRef = useRef(0);
  const previousMoveCountRef = useRef(0);
  const previousAnnouncementCountRef = useRef(0);

  const playSound = useSound(soundOn);

  const roundEnded = match.game.status !== 'playing';
  const replaying = replayStep !== null;

  const displayBoard = useMemo(
    () =>
      replayStep === null
        ? match.game.board
        : boardAtMove(match.game.moves, replayStep),
    [replayStep, match.game.board, match.game.moves],
  );

  const displayOutcome = useMemo(
    () => evaluateBoard(displayBoard),
    [displayBoard],
  );

  const lineSums = useMemo(
    () => getLineSums(displayBoard),
    [displayBoard],
  );

  const activeLineId = hoveredLineId ?? pinnedLineId;
  const highlightedCells = useMemo(
    () =>
      lineSums.find((line) => line.id === activeLineId)?.cells ??
      ([] as readonly number[]),
    [activeLineId, lineSums],
  );

  const currentName = nameFor(names, match.game.currentPlayer);
  const winnerName = match.game.winner
    ? nameFor(names, match.game.winner)
    : '';

  // Scores are the only match data that persists; the board starts fresh.
  useEffect(() => {
    writeStored(STORAGE_KEYS.scores, match.scores);
  }, [match.scores]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'daylight' ? 'light' : 'dark';
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        theme === 'daylight' ? '#f2f5fb' : '#060a17',
      );
  }, [theme]);

  // Sounds follow state transitions, so they cannot double-fire on rapid input.
  useEffect(() => {
    const count = match.game.moves.length;
    if (count > previousMoveCountRef.current) {
      if (match.game.status === 'won') {
        playSound('win');
      } else if (match.game.status === 'draw') {
        playSound('draw');
      } else {
        const lastMove = match.game.moves[count - 1];
        playSound(lastMove.player === 'X' ? 'placeX' : 'placeO');
      }
    }
    previousMoveCountRef.current = count;
  }, [match.game.moves, match.game.status, playSound]);

  // Screen-reader narration for turns and results.
  useEffect(() => {
    const count = match.game.moves.length;
    if (count > previousAnnouncementCountRef.current) {
      const lastMove = match.game.moves[count - 1];

      if (
        match.game.status === 'won' &&
        match.game.winner &&
        match.game.winningLine
      ) {
        setAnnouncement(
          `${nameFor(names, match.game.winner)} wins on the ${
            match.game.winningLine.ariaLabel
          }. ${formatEquation(
            match.game.winningLine.values,
            match.game.winningLine.sum,
            match.game.winningLine.player,
          )}.`,
        );
      } else if (match.game.status === 'draw') {
        setAnnouncement(
          'Draw. All nine cells are filled and no real line reached plus or minus fifteen.',
        );
      } else {
        setAnnouncement(
          `${nameFor(names, lastMove.player)} played ${lastMove.player} in the ${
            CELL_NAMES[lastMove.cell]
          } cell. ${nameFor(names, match.game.currentPlayer)}'s turn.`,
        );
      }
    }
    previousAnnouncementCountRef.current = count;
  }, [
    match.game.moves,
    match.game.status,
    match.game.winner,
    match.game.winningLine,
    match.game.currentPlayer,
    names,
  ]);

  // Auto-play is only ever started by an explicit press of Play.
  useEffect(() => {
    if (replayStep === null || !replayPlaying) return;

    const total = match.game.moves.length;
    if (replayStep >= total) {
      setReplayPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setReplayStep((step) =>
        step === null ? null : Math.min(step + 1, total),
      );
    }, REPLAY_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [replayStep, replayPlaying, match.game.moves.length]);

  const handleCell = useCallback(
    (cell: number) => {
      if (replayStep !== null) return;

      if (match.game.status !== 'playing') {
        setAnnouncement(
          'This round is over. Start the next round or reset the match.',
        );
        return;
      }

      if (match.game.board[cell] !== 0) {
        playSound('invalid');
        setAnnouncement(
          'That cell is already taken. Choose an empty cell.',
        );
        return;
      }

      const now = performance.now();
      if (now - lastMoveAtRef.current < MOVE_LOCK_MS) return;
      lastMoveAtRef.current = now;

      dispatch({ type: 'move', cell });
    },
    [match.game, replayStep, playSound],
  );

  const handleNameChange = useCallback(
    (player: Player, value: string) => {
      setNames((current) => ({
        ...current,
        [player]: value.slice(0, 18),
      }));
    },
    [setNames],
  );

  const handleNameCommit = useCallback(
    (player: Player) => {
      setNames((current) => {
        const trimmed = current[player].trim();
        return {
          ...current,
          [player]: trimmed || `Player ${player}`,
        };
      });
    },
    [setNames],
  );

  const clearLineFocus = useCallback(() => {
    setHoveredLineId(null);
    setPinnedLineId(null);
  }, []);

  const handleMathsToggle = useCallback(
    (next: boolean) => {
      setMathsMode(next);
      if (!next) clearLineFocus();
      setAnnouncement(
        next
          ? 'Maths Mode on. Fixed values, signed values and eight live line sums are now visible.'
          : 'Maths Mode off. The standard board is back.',
      );
    },
    [clearLineFocus, setMathsMode],
  );

  const handlePinLine = useCallback((lineId: string) => {
    setPinnedLineId((current) => (current === lineId ? null : lineId));
  }, []);

  const startReplay = useCallback(() => {
    if (match.game.status === 'playing') return;
    setReplayStep(0);
    setReplayPlaying(false);
    clearLineFocus();
    setAnnouncement(
      'Replay started. This is read-only and scores are frozen. Use the replay controls to step through the round.',
    );
  }, [match.game.status, clearLineFocus]);

  const exitReplay = useCallback(() => {
    setReplayStep(null);
    setReplayPlaying(false);
    setAnnouncement(
      'Replay closed. The final result and scores are unchanged.',
    );
  }, []);

  const handleReplayStep = useCallback(
    (step: number) => {
      setReplayPlaying(false);
      setReplayStep((current) => {
        if (current === null) return current;
        return Math.max(0, Math.min(step, match.game.moves.length));
      });
    },
    [match.game.moves.length],
  );

  const toggleReplayPlayback = useCallback(() => {
    if (replayStep === null) return;
    const total = match.game.moves.length;

    if (replayStep >= total) {
      setReplayStep(0);
      setReplayPlaying(true);
      return;
    }

    setReplayPlaying((playing) => !playing);
  }, [match.game.moves.length, replayStep]);

  const handleNextRound = useCallback(() => {
    setReplayStep(null);
    setReplayPlaying(false);
    clearLineFocus();
    lastMoveAtRef.current = 0;
    dispatch({ type: 'nextRound' });
    playSound('reset');
    setAnnouncement('New round. The scores are kept. X starts.');
  }, [clearLineFocus, playSound]);

  const performResetMatch = useCallback(() => {
    setResetDialogOpen(false);
    setReplayStep(null);
    setReplayPlaying(false);
    clearLineFocus();
    lastMoveAtRef.current = 0;
    dispatch({ type: 'resetMatch' });
    playSound('reset');
    setAnnouncement('Match reset. Scores are cleared. X starts.');
  }, [clearLineFocus, playSound]);

  const requestResetMatch = useCallback(() => {
    const totalScores =
      match.scores.X + match.scores.O + match.scores.draws;

    if (totalScores === 0) {
      performResetMatch();
      return;
    }

    setResetDialogOpen(true);
  }, [match.scores, performResetMatch]);

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === 'midnight' ? 'daylight' : 'midnight',
    );
  }, [setTheme]);

  return (
    <div className="app">
      <a className="skip-link" href="#game">
        Skip to the board
      </a>

      <div className="ambient" aria-hidden="true">
        <span className="ambient__orb ambient__orb--cyan" />
        <span className="ambient__orb ambient__orb--coral" />
        <span className="ambient__grid" />
      </div>

      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand">
            <BrandMark />
            <div className="brand__text">
              <p className="brand__name">Tic Tac Toe</p>
              <p className="brand__sub">Magic Square Edition</p>
            </div>
          </div>

          <div className="header-controls">
            <LabeledSwitch
              checked={mathsMode}
              onChange={handleMathsToggle}
              label="Maths"
              icon={<SparklesIcon size={16} />}
              compact
              className="header-maths"
            />
            <span className="header-controls__divider" aria-hidden="true" />
            <button
              type="button"
              className="icon-button header-icon"
              onClick={() => setSoundOn((current) => !current)}
              aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
              title={soundOn ? 'Mute sound' : 'Unmute sound'}
            >
              {soundOn ? (
                <VolumeOnIcon size={19} />
              ) : (
                <VolumeOffIcon size={19} />
              )}
            </button>
            <button
              type="button"
              className="icon-button header-icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === 'midnight' ? 'daylight' : 'midnight'
              } theme`}
              title={`Switch to ${
                theme === 'midnight' ? 'daylight' : 'midnight'
              } theme`}
            >
              {theme === 'midnight' ? (
                <SunIcon size={19} />
              ) : (
                <MoonIcon size={19} />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero__headline">
            <p className="eyebrow hero__eyebrow">
              <SparklesIcon size={14} />
              Local two-player · signed magic square
            </p>
            <h1 id="page-title">
              Claim the line.
              <br />
              <span>Mind the maths.</span>
            </h1>
          </div>
          <p className="hero__lede">
            Classic tic-tac-toe, quietly powered by a signed magic square. Turn
            on Maths Mode to watch the algorithm behind every move.
          </p>
        </section>

        <div className={`stage${mathsMode ? ' stage--maths' : ''}`}>
          <aside className="rail rail--left" aria-label="Match and rules">
            <Scoreboard
              names={names}
              scores={match.scores}
              activePlayer={match.game.currentPlayer}
              winner={match.game.winner}
              status={match.game.status}
              replaying={replaying}
              onNameChange={handleNameChange}
              onNameCommit={handleNameCommit}
            />
            <HowItWorks mathsMode={mathsMode} />
          </aside>

          <section
            className="game-card"
            id="game"
            aria-label="Game board and controls"
          >
            <div className="status-deck">
              {replayStep !== null ? (
                <RoundBanner
                  variant="replay"
                  winner={null}
                  step={replayStep}
                  total={match.game.moves.length}
                />
              ) : roundEnded ? (
                <RoundBanner
                  variant="complete"
                  winner={match.game.winner}
                  winnerName={winnerName}
                />
              ) : (
                <TurnIndicator
                  player={match.game.currentPlayer}
                  name={currentName}
                  moveCount={match.game.moves.length}
                />
              )}
            </div>

            <Board
              board={displayBoard}
              currentPlayer={match.game.currentPlayer}
              status={displayOutcome.status}
              winningLine={displayOutcome.winningLine}
              highlightedCells={highlightedCells}
              mathsMode={mathsMode}
              readOnly={replaying}
              onCell={handleCell}
            />

            <div className="game-card__footer">
              {replayStep !== null ? (
                <ReplayControls
                  step={replayStep}
                  total={match.game.moves.length}
                  playing={replayPlaying}
                  onStep={handleReplayStep}
                  onTogglePlay={toggleReplayPlayback}
                  onExit={exitReplay}
                />
              ) : roundEnded ? (
                <ResultCard
                  winner={match.game.winner}
                  winnerName={winnerName}
                  winningLine={match.game.winningLine}
                  mathsMode={mathsMode}
                  onNextRound={handleNextRound}
                  onReplay={startReplay}
                  onResetMatch={requestResetMatch}
                  onShowMaths={() => handleMathsToggle(true)}
                />
              ) : (
                <ActionBar
                  onNextRound={handleNextRound}
                  onResetMatch={requestResetMatch}
                />
              )}
            </div>
          </section>

          <aside className="rail rail--right" aria-label="Maths and timeline">
            <MathsCard enabled={mathsMode} onToggle={handleMathsToggle} />
            {mathsMode ? (
              <LineSumsCard
                lineSums={lineSums}
                winningLine={displayOutcome.winningLine}
                activeLineId={activeLineId}
                pinnedLineId={pinnedLineId}
                onHoverLine={setHoveredLineId}
                onPinLine={handlePinLine}
              />
            ) : null}
            <Timeline
              moves={match.game.moves}
              mathsMode={mathsMode}
              replayStep={replayStep}
              roundEnded={roundEnded}
              onStep={handleReplayStep}
              onStartReplay={startReplay}
              onExitReplay={exitReplay}
            />
          </aside>
        </div>

        {mathsMode ? (
          <MathsExplainer
            status={displayOutcome.status}
            winningLine={displayOutcome.winningLine}
            onHide={() => handleMathsToggle(false)}
          />
        ) : null}
      </main>

      <footer className="site-footer">
        <span className="site-footer__brand">
          Tic Tac Toe <span aria-hidden="true">·</span> Magic Square Edition
        </span>
        <span className="site-footer__square" aria-hidden="true">
          8&nbsp;1&nbsp;6 <i /> 3&nbsp;5&nbsp;7 <i /> 4&nbsp;9&nbsp;2
        </span>
      </footer>

      <ConfirmDialog
        open={resetDialogOpen}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={performResetMatch}
      />

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
    </div>
  );
}
