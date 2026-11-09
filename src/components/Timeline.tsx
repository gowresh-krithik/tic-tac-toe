import { cellCoordinate } from '../game/magicSquare';
import { formatSigned } from '../game/engine';
import type { Move } from '../game/types';
import { CloseIcon, ReplayIcon } from './icons';
import { PlayerMark } from './PlayerMark';

interface TimelineProps {
  moves: Move[];
  mathsMode: boolean;
  replayStep: number | null;
  roundEnded: boolean;
  onStep: (step: number) => void;
  onStartReplay: () => void;
  onExitReplay: () => void;
}

export function Timeline({
  moves,
  mathsMode,
  replayStep,
  roundEnded,
  onStep,
  onStartReplay,
  onExitReplay,
}: TimelineProps) {
  const replaying = replayStep !== null;

  return (
    <section className="card timeline-card" aria-labelledby="timeline-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{replaying ? 'Read-only replay' : 'Round log'}</p>
          <h2 id="timeline-title">Move timeline</h2>
        </div>
        <span className="chip chip--quiet">
          {replaying ? `${replayStep} / ${moves.length}` : `${moves.length} / 9`}
        </span>
      </div>

      {moves.length === 0 ? (
        <div className="timeline-empty">
          <span className="timeline-empty__line" aria-hidden="true" />
          <p>Your moves will appear here, one signed number at a time.</p>
        </div>
      ) : (
        <ol className="timeline" aria-label="Move timeline">
          {moves.map((move, index) => {
            const step = index + 1;
            const isCurrent = replayStep === step;
            const isPast = replayStep !== null && replayStep >= step;
            const classes = `move-chip${isCurrent ? ' is-current' : ''}${
              isPast ? ' is-past' : ''
            }`;
            const valueLabel = mathsMode
              ? `, signed value ${formatSigned(move.value)}`
              : '';
            const content = (
              <>
                <span className="move-chip__number">
                  {String(step).padStart(2, '0')}
                </span>
                <span
                  className={`move-chip__mark move-chip__mark--${move.player.toLowerCase()}`}
                  aria-hidden="true"
                >
                  <PlayerMark player={move.player} />
                </span>
                <span className="move-chip__cell">
                  {cellCoordinate(move.cell)}
                </span>
                {mathsMode ? (
                  <span className="move-chip__value">
                    {formatSigned(move.value)}
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={`${step}-${move.cell}`}>
                {replaying ? (
                  <button
                    type="button"
                    className={classes}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Go to move ${step}: ${move.player} played ${cellCoordinate(
                      move.cell,
                    )}${valueLabel}`}
                    onClick={() => onStep(step)}
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    className={classes}
                    aria-label={`Move ${step}: ${move.player} played ${cellCoordinate(
                      move.cell,
                    )}${valueLabel}`}
                  >
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {roundEnded && !replaying ? (
        <button
          type="button"
          className="text-button timeline-card__action"
          onClick={onStartReplay}
        >
          <ReplayIcon size={17} />
          Replay round
        </button>
      ) : null}

      {replaying ? (
        <button
          type="button"
          className="text-button timeline-card__action"
          onClick={onExitReplay}
        >
          <CloseIcon size={17} />
          Exit replay
        </button>
      ) : null}
    </section>
  );
}
