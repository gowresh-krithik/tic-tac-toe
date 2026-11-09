import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { formatSigned } from '../game/engine';
import { CELL_NAMES, MAGIC_SQUARE } from '../game/magicSquare';
import type { Board as BoardState, GameStatus, Player, WinningLine } from '../game/types';
import { PlayerMark } from './PlayerMark';

interface BoardProps {
  board: BoardState;
  currentPlayer: Player;
  status: GameStatus;
  winningLine: WinningLine | null;
  highlightedCells: readonly number[];
  mathsMode: boolean;
  readOnly: boolean;
  onCell: (cell: number) => void;
}

interface LineCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

export function Board({
  board,
  currentPlayer,
  status,
  winningLine,
  highlightedCells,
  mathsMode,
  readOnly,
  onCell,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [lineCoordinates, setLineCoordinates] =
    useState<LineCoordinates | null>(null);

  const winningLineId = winningLine?.id;

  useLayoutEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement || !winningLineId) {
      setLineCoordinates(null);
      return;
    }

    let frame = 0;

    const measure = () => {
      const firstCell = boardElement.querySelector<HTMLElement>(
        `[data-cell="${winningLine?.cells[0]}"]`,
      );
      const lastCell = boardElement.querySelector<HTMLElement>(
        `[data-cell="${winningLine?.cells[2]}"]`,
      );

      if (!firstCell || !lastCell) return;

      const boardRect = boardElement.getBoundingClientRect();
      const firstRect = firstCell.getBoundingClientRect();
      const lastRect = lastCell.getBoundingClientRect();

      const next: LineCoordinates = {
        x1: firstRect.left + firstRect.width / 2 - boardRect.left,
        y1: firstRect.top + firstRect.height / 2 - boardRect.top,
        x2: lastRect.left + lastRect.width / 2 - boardRect.left,
        y2: lastRect.top + lastRect.height / 2 - boardRect.top,
        width: boardRect.width,
        height: boardRect.height,
      };

      setLineCoordinates((previous) => {
        if (
          previous &&
          Math.abs(previous.x1 - next.x1) < 0.1 &&
          Math.abs(previous.y1 - next.y1) < 0.1 &&
          Math.abs(previous.x2 - next.x2) < 0.1 &&
          Math.abs(previous.y2 - next.y2) < 0.1 &&
          Math.abs(previous.width - next.width) < 0.1 &&
          Math.abs(previous.height - next.height) < 0.1
        ) {
          return previous;
        }
        return next;
      });
    };

    frame = window.requestAnimationFrame(measure);

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(measure);
          });
    observer?.observe(boardElement);
    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
    // The winning line identity is enough to remeasure; positions update on resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winningLineId]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : 8;
      setFocusIndex(next);
      cellRefs.current[next]?.focus();
      return;
    }

    const step = KEY_STEPS[event.key];
    if (!step) return;

    event.preventDefault();
    const row = Math.floor(index / 3);
    const column = index % 3;
    const nextRow = Math.min(2, Math.max(0, row + step[0]));
    const nextColumn = Math.min(2, Math.max(0, column + step[1]));
    const next = nextRow * 3 + nextColumn;

    if (next === index) return;
    setFocusIndex(next);
    cellRefs.current[next]?.focus();
  };

  return (
    <div className="board-frame">
      <div
        className={`board${mathsMode ? ' board--maths' : ''}`}
        ref={boardRef}
        role="group"
        aria-label={
          readOnly
            ? 'Tic Tac Toe board, read-only replay'
            : 'Tic Tac Toe board'
        }
        aria-describedby="board-help"
      >
        <div className="board__grid">
          {board.map((value, index) => {
            const isOccupied = value !== 0;
            const player: Player | null = isOccupied
              ? value > 0
                ? 'X'
                : 'O'
              : null;
            const isWinning = winningLine?.cells.includes(index) ?? false;
            const isHinted = highlightedCells.includes(index);
            const isInert = readOnly || status !== 'playing' || isOccupied;
            const row = Math.floor(index / 3) + 1;
            const column = (index % 3) + 1;
            const accessibleValue = isOccupied
              ? `${player}, stored value ${formatSigned(value)}`
              : `empty, fixed value ${MAGIC_SQUARE[index]}`;
            const label = `${CELL_NAMES[index]} cell, row ${row} column ${column}. ${accessibleValue}.${
              isWinning ? ' Winning cell.' : ''
            }${readOnly ? ' Read-only replay.' : ''}`;

            const cellClasses = [
              'cell',
              isOccupied ? 'cell--filled' : '',
              player ? `cell--${player.toLowerCase()}` : '',
              isWinning ? 'cell--winning' : '',
              isHinted ? 'cell--hinted' : '',
              isInert ? 'cell--inert' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={index}
                ref={(element) => {
                  cellRefs.current[index] = element;
                }}
                type="button"
                className={cellClasses}
                data-cell={index}
                tabIndex={focusIndex === index ? 0 : -1}
                aria-label={label}
                aria-disabled={isInert}
                onClick={() => {
                  setFocusIndex(index);
                  onCell(index);
                }}
                onFocus={() => setFocusIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {mathsMode ? (
                  <span className="cell__fixed" aria-hidden="true">
                    {MAGIC_SQUARE[index]}
                  </span>
                ) : null}

                <span className="cell__symbol" aria-hidden="true">
                  {isOccupied && player ? (
                    <PlayerMark player={player} />
                  ) : status === 'playing' && !readOnly ? (
                    <span className="cell__ghost">
                      <PlayerMark player={currentPlayer} />
                    </span>
                  ) : null}
                </span>

                {mathsMode ? (
                  <span
                    className={`cell__stored${
                      player ? ` cell__stored--${player.toLowerCase()}` : ''
                    }`}
                    aria-hidden="true"
                  >
                    {formatSigned(value)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {winningLine && lineCoordinates ? (
          <svg
            className={`win-line win-line--${winningLine.player.toLowerCase()}`}
            viewBox={`0 0 ${lineCoordinates.width} ${lineCoordinates.height}`}
            aria-hidden="true"
            focusable="false"
          >
            <line
              key={`${winningLine.id}-${lineCoordinates.width}-${lineCoordinates.height}`}
              className="win-line__stroke"
              x1={lineCoordinates.x1}
              y1={lineCoordinates.y1}
              x2={lineCoordinates.x2}
              y2={lineCoordinates.y2}
              pathLength={1}
            />
          </svg>
        ) : null}
      </div>

      <p id="board-help" className="sr-only">
        Use the arrow keys to move between cells. Press Enter or Space to place
        your mark.
      </p>
    </div>
  );
}
