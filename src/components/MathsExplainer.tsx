import { formatEquation } from '../game/engine';
import { MAGIC_SQUARE } from '../game/magicSquare';
import type { GameStatus, WinningLine } from '../game/types';
import { ArrowRightIcon, DrawIcon } from './icons';

interface MathsExplainerProps {
  status: GameStatus;
  winningLine: WinningLine | null;
  onHide: () => void;
}

export function MathsExplainer({
  status,
  winningLine,
  onHide,
}: MathsExplainerProps) {
  return (
    <section className="maths-explainer" aria-labelledby="explainer-title">
      <div className="maths-explainer__copy">
        <p className="eyebrow">Maths Mode · explained</p>
        <h2 id="explainer-title">One square. Two signs. Eight lines.</h2>

        <p>
          A magic square is a grid where every row, column and diagonal adds to
          the same total. In this fixed square, that total is <strong>15</strong>.
        </p>
        <p>
          X stores a cell&apos;s magic value as-is; O stores its negative. The
          fixed square and the signed game board are kept separate, so the
          original weights are never overwritten.
        </p>
        <p>
          A completed line of X therefore sums to <strong>+15</strong>, and a
          completed line of O sums to <strong>−15</strong>. A mixed line sits
          strictly between those targets, so it cannot win.
        </p>
        <p className="maths-explainer__rule">
          Only the eight real lines are tested — never arbitrary groups of
          three, and never the total of the whole board.
        </p>

        <div className="legend">
          <span className="legend__item">
            <span className="legend__sample legend__sample--fixed">8</span>
            <span>
              <strong>Fixed value</strong>
              <small>from the magic square</small>
            </span>
          </span>
          <span className="legend__item">
            <span className="legend__sample legend__sample--signed">+8</span>
            <span>
              <strong>Signed value</strong>
              <small>stored on the game board</small>
            </span>
          </span>
        </div>

        <button type="button" className="text-button" onClick={onHide}>
          Hide Maths Mode <ArrowRightIcon size={15} />
        </button>
      </div>

      <div className="maths-explainer__visual">
        <div className="fixed-square">
          <div className="fixed-square__head">
            <span>Fixed magic square</span>
            <span className="fixed-square__total">every line = 15</span>
          </div>
          <div className="fixed-square__grid" aria-hidden="true">
            {MAGIC_SQUARE.map((value, index) => {
              const isWinning = winningLine?.cells.includes(index) ?? false;
              return (
                <span
                  key={index}
                  className={`fixed-square__cell${
                    isWinning
                      ? ` is-winning is-winning--${winningLine?.player.toLowerCase()}`
                      : ''
                  }`}
                >
                  {value}
                </span>
              );
            })}
          </div>
          <p className="fixed-square__note">
            The weights stay fixed for the whole match.
          </p>
        </div>

        <div className="maths-explainer__examples">
          <span className="equation-chip equation-chip--x">
            +8 +1 +6 = +15 <ArrowRightIcon size={13} /> X
          </span>
          <span className="equation-chip equation-chip--o">
            −4 −9 −2 = −15 <ArrowRightIcon size={13} /> O
          </span>
        </div>

        <div
          className={`maths-explainer__outcome${
            winningLine
              ? ` maths-explainer__outcome--${winningLine.player.toLowerCase()}`
              : ''
          }`}
        >
          {winningLine ? (
            <>
              <p className="eyebrow">Winning equation</p>
              <strong>
                {formatEquation(
                  winningLine.values,
                  winningLine.sum,
                  winningLine.player,
                )}
              </strong>
              <span className="maths-explainer__line-name">
                {winningLine.label} · all three cells share the same sign
              </span>
            </>
          ) : status === 'draw' ? (
            <>
              <p className="eyebrow">Round result</p>
              <strong>
                <DrawIcon size={18} /> No line reached ±15
              </strong>
              <span className="maths-explainer__line-name">
                The board is full, so the round is a draw.
              </span>
            </>
          ) : (
            <>
              <p className="eyebrow">Live status</p>
              <strong>No line has reached ±15 yet</strong>
              <span className="maths-explainer__line-name">
                Keep an eye on the eight sums beside the board.
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
