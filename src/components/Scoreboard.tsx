import type { GameStatus, Player, PlayerNames, Scores } from '../game/types';
import { DrawIcon } from './icons';
import { PlayerMark } from './PlayerMark';

interface ScoreboardProps {
  names: PlayerNames;
  scores: Scores;
  activePlayer: Player | null;
  winner: Player | null;
  status: GameStatus;
  replaying: boolean;
  onNameChange: (player: Player, value: string) => void;
  onNameCommit: (player: Player) => void;
}

export function Scoreboard({
  names,
  scores,
  activePlayer,
  winner,
  status,
  replaying,
  onNameChange,
  onNameCommit,
}: ScoreboardProps) {
  const active =
    !replaying && status === 'playing' ? activePlayer : null;

  const captionFor = (player: Player) => {
    if (active === player) return 'To move';
    if (!replaying && status === 'won' && winner === player) {
      return 'Round winner';
    }
    return 'Wins';
  };

  return (
    <section className="card scoreboard" aria-labelledby="scoreboard-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">The match</p>
          <h2 id="scoreboard-title">Scoreboard</h2>
        </div>
        <span className="chip chip--quiet">Local 2P</span>
      </div>

      <div className="score-list">
        {(['X', 'O'] as const).map((player) => {
          const isActive = active === player;
          return (
            <div
              key={player}
              className={`score-row score-row--${player.toLowerCase()}${
                isActive ? ' is-active' : ''
              }`}
            >
              <span
                className={`mark-badge mark-badge--${player.toLowerCase()}`}
                aria-hidden="true"
              >
                <PlayerMark player={player} />
              </span>

              <div className="score-row__identity">
                <input
                  className="name-input"
                  value={names[player]}
                  maxLength={18}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label={`Name for ${player}`}
                  placeholder={`Player ${player}`}
                  onChange={(event) =>
                    onNameChange(player, event.target.value)
                  }
                  onBlur={() => onNameCommit(player)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur();
                  }}
                />
                <span className="score-row__caption">
                  {isActive ? (
                    <>
                      <span className="live-dot" aria-hidden="true" />
                      To move
                    </>
                  ) : (
                    captionFor(player)
                  )}
                </span>
              </div>

              <span
                key={`${player}-${scores[player]}`}
                className="score-row__value"
                aria-label={`${scores[player]} wins`}
              >
                {scores[player]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="draw-row">
        <span className="draw-row__icon" aria-hidden="true">
          <DrawIcon size={17} />
        </span>
        <span className="draw-row__label">Draws</span>
        <span
          key={`draws-${scores.draws}`}
          className="draw-row__value"
          aria-label={`${scores.draws} draws`}
        >
          {scores.draws}
        </span>
      </div>

      <p className="scoreboard__foot">
        <span aria-hidden="true">↺</span> X starts every round. Names are
        editable.
      </p>
    </section>
  );
}
