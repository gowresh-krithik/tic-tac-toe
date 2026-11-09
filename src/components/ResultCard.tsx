import { formatEquation } from '../game/engine';
import type { Player, WinningLine } from '../game/types';
import { ArrowRightIcon, DrawIcon, ReplayIcon, ResetIcon, TrophyIcon } from './icons';

interface ResultCardProps {
  winner: Player | null;
  winnerName: string;
  winningLine: WinningLine | null;
  mathsMode: boolean;
  onNextRound: () => void;
  onReplay: () => void;
  onResetMatch: () => void;
  onShowMaths: () => void;
}

export function ResultCard({
  winner,
  winnerName,
  winningLine,
  mathsMode,
  onNextRound,
  onReplay,
  onResetMatch,
  onShowMaths,
}: ResultCardProps) {
  const isDraw = winner === null;
  const tone = winner ? winner.toLowerCase() : 'draw';

  return (
    <section
      className={`result-card result-card--${tone}`}
      aria-labelledby="result-title"
    >
      <div className="result-card__main">
        <span className="result-card__icon" aria-hidden="true">
          {winner ? <TrophyIcon size={30} /> : <DrawIcon size={30} />}
        </span>

        <div className="result-card__copy">
          <p className="eyebrow">Round complete</p>
          <h2 id="result-title">
            {isDraw ? "It's a draw" : `${winnerName} wins`}
          </h2>
          <p className="result-card__detail">
            {isDraw
              ? 'Every cell is filled, and no real line reached ±15.'
              : `Three in a row on the ${winningLine?.ariaLabel ?? 'winning line'}.`}
          </p>

          {winningLine ? (
            mathsMode ? (
              <p className="result-card__equation">
                <span className="result-card__equation-label">
                  Winning equation
                </span>
                <span>
                  {formatEquation(
                    winningLine.values,
                    winningLine.sum,
                    winningLine.player,
                  )}
                </span>
              </p>
            ) : (
              <button
                type="button"
                className="result-card__maths-link"
                onClick={onShowMaths}
              >
                Show the winning maths <ArrowRightIcon size={15} />
              </button>
            )
          ) : null}
        </div>
      </div>

      <div className="result-card__actions">
        <button type="button" className="btn btn--primary" onClick={onNextRound}>
          Next round
        </button>
        <button type="button" className="btn btn--secondary" onClick={onReplay}>
          <ReplayIcon size={17} />
          Replay round
        </button>
        <button
          type="button"
          className="btn btn--ghost result-card__reset"
          onClick={onResetMatch}
          aria-label="Reset match and clear scores"
        >
          <ResetIcon size={16} />
          Reset match
        </button>
      </div>
    </section>
  );
}
