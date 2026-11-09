interface HowItWorksProps {
  mathsMode: boolean;
}

export function HowItWorks({ mathsMode }: HowItWorksProps) {
  return (
    <section className="card how-card" aria-labelledby="how-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">The rule</p>
          <h2 id="how-title">How it works</h2>
        </div>
      </div>

      <ol className="how-list">
        <li>
          <span className="how-list__number" aria-hidden="true">
            1
          </span>
          <p>
            Every cell hides a number from a magic square. Each of its eight
            lines adds to <strong>15</strong>.
          </p>
        </li>
        <li>
          <span className="how-list__number" aria-hidden="true">
            2
          </span>
          <p>
            X stores the number as-is. O stores its <strong>negative</strong>.
            The fixed square never changes.
          </p>
        </li>
        <li>
          <span className="how-list__number" aria-hidden="true">
            3
          </span>
          <p>
            A real line totalling <strong>+15</strong> means X wins;{' '}
            <strong>−15</strong> means O wins. Only the eight real lines count.
          </p>
        </li>
      </ol>

      <p className="how-card__note">
        {mathsMode
          ? 'Maths Mode is on: the live sums are beside the board.'
          : 'Turn on Maths Mode to watch the signed arithmetic live.'}
      </p>
    </section>
  );
}
