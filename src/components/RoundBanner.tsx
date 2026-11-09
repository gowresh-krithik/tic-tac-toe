import type { Player } from '../game/types';
import { DrawIcon, FlagIcon, LockIcon, ReplayIcon } from './icons';
import { PlayerMark } from './PlayerMark';

interface RoundBannerProps {
  variant: 'complete' | 'replay';
  winner: Player | null;
  winnerName?: string;
  step?: number;
  total?: number;
}

export function RoundBanner({
  variant,
  winner,
  winnerName,
  step = 0,
  total = 0,
}: RoundBannerProps) {
  if (variant === 'replay') {
    return (
      <div className="round-banner round-banner--replay">
        <span className="round-banner__icon" aria-hidden="true">
          <ReplayIcon size={22} />
        </span>
        <div className="round-banner__copy">
          <p className="eyebrow">
            <LockIcon size={12} /> Read-only replay
          </p>
          <p className="round-banner__title">
            Move {step} of {total}
          </p>
        </div>
        <span className="chip chip--quiet">Scores frozen</span>
      </div>
    );
  }

  return (
    <div
      className={`round-banner${
        winner ? ` round-banner--${winner.toLowerCase()}` : ' round-banner--draw'
      }`}
    >
      <span className="round-banner__icon" aria-hidden="true">
        {winner ? <PlayerMark player={winner} /> : <DrawIcon size={24} />}
      </span>
      <div className="round-banner__copy">
        <p className="eyebrow">
          <FlagIcon size={12} /> Round complete
        </p>
        <p className="round-banner__title">
          {winner ? `${winnerName ?? `Player ${winner}`} wins` : 'A hard-fought draw'}
        </p>
      </div>
      <span className="chip chip--quiet">Final board</span>
    </div>
  );
}
