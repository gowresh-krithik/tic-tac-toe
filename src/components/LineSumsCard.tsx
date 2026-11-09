import { useEffect, useRef, useState } from 'react';
import {
  formatEquation,
  formatLineEquation,
  formatSigned,
} from '../game/engine';
import type { LineSum, WinningLine } from '../game/types';
import { SparklesIcon } from './icons';

interface LineSumsCardProps {
  lineSums: LineSum[];
  winningLine: WinningLine | null;
  activeLineId: string | null;
  pinnedLineId: string | null;
  onHoverLine: (id: string | null) => void;
  onPinLine: (id: string) => void;
}

export function LineSumsCard({
  lineSums,
  winningLine,
  activeLineId,
  pinnedLineId,
  onHoverLine,
  onPinLine,
}: LineSumsCardProps) {
  const signature = lineSums.map((line) => line.sum).join('|');
  const previousSignature = useRef(signature);
  const [changedLines, setChangedLines] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const previous = previousSignature.current;
    if (previous === signature) return;

    const previousSums = previous.split('|').map(Number);
    const nextChanged = new Set<string>();

    lineSums.forEach((line, index) => {
      if (previousSums[index] !== line.sum) nextChanged.add(line.id);
    });

    previousSignature.current = signature;
    setChangedLines(nextChanged);

    if (nextChanged.size === 0) return;

    const timer = window.setTimeout(() => {
      setChangedLines(new Set());
    }, 560);

    return () => window.clearTimeout(timer);
  }, [signature, lineSums]);

  return (
    <section
      className="card line-sums"
      aria-labelledby="line-sums-title"
    >
      <div className="card-heading">
        <div>
          <p className="eyebrow">Algorithm, live</p>
          <h2 id="line-sums-title">Line sums</h2>
        </div>
        <span className="chip chip--accent">
          <SparklesIcon size={13} /> 8 lines
        </span>
      </div>

      <div className="line-sums__targets" aria-hidden="true">
        <span className="line-sums__target line-sums__target--x">+15 = X</span>
        <span className="line-sums__target line-sums__target--o">
          −15 = O
        </span>
      </div>

      <p className="line-sums__hint">
        Hover, focus or tap a line to light up its cells on the board.
      </p>

      <div className="line-list">
        {lineSums.map((line) => {
          const isActive = activeLineId === line.id;
          const isPinned = pinnedLineId === line.id;
          const isChanged = changedLines.has(line.id);
          const isWinning = line.player !== null;

          return (
            <button
              key={line.id}
              type="button"
              className={`line-row${isActive ? ' is-active' : ''}${
                isChanged ? ' is-changed' : ''
              }${isWinning ? ` is-winning is-winning--${line.player?.toLowerCase()}` : ''}`}
              aria-pressed={isPinned}
              aria-label={`${line.label}, ${formatLineEquation(line)}.${
                line.player ? ` ${line.player} wins this line.` : ' No winner.'
              }${isPinned ? ' Highlight pinned.' : ''}`}
              onMouseEnter={() => onHoverLine(line.id)}
              onMouseLeave={() => onHoverLine(null)}
              onFocus={() => onHoverLine(line.id)}
              onBlur={() => onHoverLine(null)}
              onClick={() => onPinLine(line.id)}
            >
              <span className="line-row__top">
                <span className="line-row__label">{line.label}</span>
                <span
                  key={`${line.id}-${line.sum}`}
                  className="line-row__sum"
                >
                  {formatSigned(line.sum)}
                </span>
              </span>
              <span className="line-row__bottom">
                <span className="line-row__formula">
                  {line.values.map(formatSigned).join(' ')}
                </span>
                {line.player ? (
                  <span
                    className={`line-row__winner line-row__winner--${line.player.toLowerCase()}`}
                  >
                    {line.player} wins
                  </span>
                ) : (
                  <span className="line-row__quiet">in play</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {winningLine ? (
        <div
          className={`line-sums__equation${
            winningLine.player === 'O' ? ' line-sums__equation--o' : ''
          }`}
        >
          <span className="eyebrow">Winning equation</span>
          <strong>
            {formatEquation(
              winningLine.values,
              winningLine.sum,
              winningLine.player,
            )}
          </strong>
        </div>
      ) : null}
    </section>
  );
}
