import { KeyboardIcon, ResetIcon } from './icons';

interface ActionBarProps {
  onNextRound: () => void;
  onResetMatch: () => void;
}

export function ActionBar({ onNextRound, onResetMatch }: ActionBarProps) {
  return (
    <div className="action-bar">
      <p className="action-bar__hint">
        <KeyboardIcon size={17} />
        <span>Tap a cell, or use the arrow keys and Enter.</span>
      </p>
      <div className="action-bar__buttons">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={onNextRound}
          title="Clear the board and keep the scores"
        >
          Next round
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onResetMatch}
        >
          <ResetIcon size={15} />
          Reset match
        </button>
      </div>
    </div>
  );
}
