import type { Player } from '../game/types';
import { PlayerMark } from './PlayerMark';

interface TurnIndicatorProps {
  player: Player;
  name: string;
  moveCount: number;
}

export function TurnIndicator({ player, name, moveCount }: TurnIndicatorProps) {
  return (
    <div
      className={`turn-indicator turn-indicator--${player.toLowerCase()}`}
      aria-label={`${name}'s turn. Place an ${player} in any open cell.`}
    >
      <span className="turn-indicator__mark" aria-hidden="true">
        <PlayerMark player={player} />
        <span className="turn-indicator__ring" />
      </span>
      <div className="turn-indicator__copy">
        <p className="turn-indicator__kicker">
          <span className="live-dot" aria-hidden="true" />
          {player} to move
        </p>
        <p className="turn-indicator__name">{name}</p>
        <p className="turn-indicator__hint">
          Place an {player} in any open cell.
        </p>
      </div>
      <span className="turn-indicator__move">Move {moveCount + 1}</span>
    </div>
  );
}
