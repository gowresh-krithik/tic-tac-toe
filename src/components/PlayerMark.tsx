import type { Player } from '../game/types';

interface PlayerMarkProps {
  player: Player;
  className?: string;
}

export function PlayerMark({ player, className = '' }: PlayerMarkProps) {
  return (
    <svg
      className={`mark mark--${player.toLowerCase()} ${className}`.trim()}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      {player === 'X' ? (
        <>
          <path
            className="mark__stroke mark__stroke--one"
            d="M27 27L73 73"
            pathLength={1}
          />
          <path
            className="mark__stroke mark__stroke--two"
            d="M73 27L27 73"
            pathLength={1}
          />
        </>
      ) : (
        <circle
          className="mark__stroke"
          cx="50"
          cy="50"
          r="23.5"
          pathLength={1}
        />
      )}
    </svg>
  );
}
