export function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="brand-surface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#142242" />
          <stop offset="1" stopColor="#0a1124" />
        </linearGradient>
        <linearGradient id="brand-x" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8cf9ff" />
          <stop offset="1" stopColor="#19d7e8" />
        </linearGradient>
        <linearGradient id="brand-o" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb4a5" />
          <stop offset="1" stopColor="#ff6752" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="13"
        fill="url(#brand-surface)"
        stroke="rgba(255,255,255,.14)"
      />
      <g stroke="rgba(255,255,255,.1)" strokeWidth="1">
        <path d="M19 8v32M29 8v32M8 19h32M8 29h32" />
      </g>
      <path
        d="M13 13l11 11M24 13L13 24"
        stroke="url(#brand-x)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle
        cx="34"
        cy="34"
        r="6"
        fill="none"
        stroke="url(#brand-o)"
        strokeWidth="3.6"
      />
      <circle cx="15.5" cy="34" r="1.6" fill="#3ee7f2" />
      <circle cx="34" cy="15.5" r="1.6" fill="#ff7a68" />
    </svg>
  );
}
