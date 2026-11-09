import type { CSSProperties } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  LockIcon,
  PauseIcon,
  PlayIcon,
  SkipEndIcon,
  SkipStartIcon,
} from './icons';

interface ReplayControlsProps {
  step: number;
  total: number;
  playing: boolean;
  onStep: (step: number) => void;
  onTogglePlay: () => void;
  onExit: () => void;
}

export function ReplayControls({
  step,
  total,
  playing,
  onStep,
  onTogglePlay,
  onExit,
}: ReplayControlsProps) {
  const progress = total === 0 ? 0 : (step / total) * 100;

  return (
    <div
      className="replay-bar"
      role="group"
      aria-label="Round replay controls"
    >
      <div className="replay-bar__head">
        <span className="chip chip--quiet">
          <LockIcon size={13} /> Read-only
        </span>
        <span className="replay-bar__step">
          Move <strong>{step}</strong> of {total}
        </span>
        <button
          type="button"
          className="text-button replay-bar__exit"
          onClick={onExit}
        >
          <CloseIcon size={16} />
          Exit replay
        </button>
      </div>

      <div className="replay-bar__controls">
        <button
          type="button"
          className="icon-button"
          aria-label="Go to start"
          disabled={step === 0}
          onClick={() => onStep(0)}
        >
          <SkipStartIcon size={19} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Previous move"
          disabled={step === 0}
          onClick={() => onStep(step - 1)}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <button
          type="button"
          className="icon-button icon-button--play"
          aria-label={playing ? 'Pause replay' : 'Play replay'}
          onClick={onTogglePlay}
        >
          {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Next move"
          disabled={step === total}
          onClick={() => onStep(step + 1)}
        >
          <ChevronRightIcon size={20} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Go to final move"
          disabled={step === total}
          onClick={() => onStep(total)}
        >
          <SkipEndIcon size={19} />
        </button>

        <input
          className="replay-range"
          type="range"
          min={0}
          max={total}
          step={1}
          value={step}
          aria-label="Replay position"
          style={{ '--replay-progress': `${progress}%` } as CSSProperties}
          onChange={(event) => onStep(Number(event.target.value))}
        />
      </div>

      <p className="replay-bar__note">
        Scores are frozen while you step through the round.
      </p>
    </div>
  );
}
