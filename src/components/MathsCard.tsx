import { MAGIC_SQUARE } from '../game/magicSquare';
import { formatSigned } from '../game/engine';
import { SparklesIcon } from './icons';
import { LabeledSwitch } from './LabeledSwitch';

interface MathsCardProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
}

export function MathsCard({ enabled, onToggle }: MathsCardProps) {
  return (
    <section
      className={`card maths-card${enabled ? ' is-on' : ''}`}
      aria-labelledby="maths-card-title"
    >
      <div className="card-heading">
        <div>
          <p className="eyebrow">The signature layer</p>
          <h2 id="maths-card-title">Maths Mode</h2>
        </div>
        <span
          className={`status-dot${enabled ? ' is-on' : ''}`}
          aria-label={enabled ? 'Maths mode on' : 'Maths mode off'}
        />
      </div>

      <p className="maths-card__lede">
        See the fixed square, the signed board and all eight live line sums as
        you play.
      </p>

      <div className="mini-square" aria-hidden="true">
        {MAGIC_SQUARE.map((value, index) => (
          <span key={index} className="mini-square__cell">
            {value}
          </span>
        ))}
        <span className="mini-square__glow" />
      </div>

      <div className="target-pair" aria-label="Winning targets">
        <span className="target target--x">
          <span className="target__value">+15</span>
          <span className="target__label">X wins</span>
        </span>
        <span className="target target--o">
          <span className="target__value">{formatSigned(-15)}</span>
          <span className="target__label">O wins</span>
        </span>
      </div>

      <LabeledSwitch
        checked={enabled}
        onChange={onToggle}
        label={enabled ? 'Hide the maths' : 'Show the maths'}
        icon={<SparklesIcon size={17} />}
        className="maths-card__switch"
      />
    </section>
  );
}
