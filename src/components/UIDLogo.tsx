interface UIDLogoProps {
  width?: number;
  variant?: 'default' | 'white';
}

// ─── Standalone animated tulip icon ───────────────────────────────────────────
export function UIDTulipIcon({
  size = 40,
  className = '',
  animate = false,
}: {
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  const id = 'tulip-icon';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 115"
      fill="none"
      className={className}
      aria-label="UID tulip icon"
    >
      {animate && (
        <defs>
          <style>{`
            @keyframes ${id}-stroke { to { stroke-dashoffset: 0; } }
            @keyframes ${id}-fill   { to { fill-opacity: 1; }      }
          `}</style>
        </defs>
      )}

      {/* ── Outer navy bulb – left half ── */}
      <path
        d="
          M50 108
          C50 108  12 90  12 58
          C12 38   24 24  36 26
          C30 36   28 56  42 70
          C44 72   47 74  50 76
          Z
        "
        fill="#0D4D7C"
      />

      {/* ── Outer navy bulb – right half ── */}
      <path
        d="
          M50 108
          C50 108  88 90  88 58
          C88 38   76 24  64 26
          C70 36   72 56  58 70
          C56 72   53 74  50 76
          Z
        "
        fill="#0D4D7C"
      />

      {/* ── White separator gaps at base – left ── */}
      <path
        d="
          M50 108
          C50 108  20 92  18 68
          C22 72   30 82  42 88
          C44 90   47 92  50 94
          Z
        "
        fill="white"
        fillOpacity="0.18"
      />
      {/* ── White separator gaps at base – right ── */}
      <path
        d="
          M50 108
          C50 108  80 92  82 68
          C78 72   70 82  58 88
          C56 90   53 92  50 94
          Z
        "
        fill="white"
        fillOpacity="0.18"
      />

      {/* ── Inner teal flame – left ── */}
      <path
        d="
          M50 98
          C50 98   26 80  26 58
          C26 44   34 32  40 34
          C36 44   36 62  50 76
          Z
        "
        fill="#3EC8C8"
      />

      {/* ── Inner teal flame – right ── */}
      <path
        d="
          M50 98
          C50 98   74 80  74 58
          C74 44   66 32  60 34
          C64 44   64 62  50 76
          Z
        "
        fill="#3EC8C8"
      />

      {/* ── White oval negative space (center gap between teal flames) ── */}
      <ellipse cx="50" cy="66" rx="5" ry="12" fill="white" />

      {/* ── White line separating navy outer from teal inner – left ── */}
      <path
        d="M40 34 C36 44 36 62 50 76"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* ── White line separating navy outer from teal inner – right ── */}
      <path
        d="M60 34 C64 44 64 62 50 76"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Crown spike (teal, centered above flames) ── */}
      <path
        d="
          M46 30
          C46 30   48 20  50 12
          C52 20   54 30  54 30
          C52 26   48 26  46 30
          Z
        "
        fill="#3EC8C8"
      />
    </svg>
  );
}

// ─── Animated tulip for the loading screen / hero ─────────────────────────────
export function UIDTulipAnimated({ size = 120 }: { size?: number }) {
  const dur = (ms: number) => `${ms}ms`;
  const delay = (ms: number) => `${ms}ms`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 100 115"
      fill="none"
      aria-label="UID tulip animated"
    >
      <defs>
        <style>{`
          .tulip-path { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); fill-opacity: 0; }
          @keyframes draw { to { stroke-dashoffset: 0; } }
          @keyframes fadeFill { to { fill-opacity: 1; } }
        `}</style>
      </defs>

      {/* Navy outer left */}
      <path
        className="tulip-path"
        style={{ '--len': '300', animationDelay: delay(0), animationDuration: dur(700), animationFillMode: 'forwards', animationName: 'draw,fadeFill', animationTimingFunction: 'ease-out,ease-in' } as React.CSSProperties}
        d="M50 108 C50 108 12 90 12 58 C12 38 24 24 36 26 C30 36 28 56 42 70 C44 72 47 74 50 76 Z"
        stroke="#0D4D7C" strokeWidth="1.5" fill="#0D4D7C"
      />

      {/* Navy outer right */}
      <path
        className="tulip-path"
        style={{ '--len': '300', animationDelay: delay(150), animationDuration: dur(700), animationFillMode: 'forwards', animationName: 'draw,fadeFill', animationTimingFunction: 'ease-out,ease-in' } as React.CSSProperties}
        d="M50 108 C50 108 88 90 88 58 C88 38 76 24 64 26 C70 36 72 56 58 70 C56 72 53 74 50 76 Z"
        stroke="#0D4D7C" strokeWidth="1.5" fill="#0D4D7C"
      />

      {/* Inner teal left */}
      <path
        className="tulip-path"
        style={{ '--len': '220', animationDelay: delay(450), animationDuration: dur(600), animationFillMode: 'forwards', animationName: 'draw,fadeFill', animationTimingFunction: 'ease-out,ease-in' } as React.CSSProperties}
        d="M50 98 C50 98 26 80 26 58 C26 44 34 32 40 34 C36 44 36 62 50 76 Z"
        stroke="#3EC8C8" strokeWidth="1.5" fill="#3EC8C8"
      />

      {/* Inner teal right */}
      <path
        className="tulip-path"
        style={{ '--len': '220', animationDelay: delay(550), animationDuration: dur(600), animationFillMode: 'forwards', animationName: 'draw,fadeFill', animationTimingFunction: 'ease-out,ease-in' } as React.CSSProperties}
        d="M50 98 C50 98 74 80 74 58 C74 44 66 32 60 34 C64 44 64 62 50 76 Z"
        stroke="#3EC8C8" strokeWidth="1.5" fill="#3EC8C8"
      />

      {/* White negative-space oval */}
      <ellipse cx="50" cy="66" rx="5" ry="12" fill="white" />

      {/* White separator lines */}
      <path d="M40 34 C36 44 36 62 50 76" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M60 34 C64 44 64 62 50 76" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Crown spike */}
      <path
        className="tulip-path"
        style={{ '--len': '80', animationDelay: delay(700), animationDuration: dur(500), animationFillMode: 'forwards', animationName: 'draw,fadeFill', animationTimingFunction: 'ease-out,ease-in' } as React.CSSProperties}
        d="M46 30 C46 30 48 20 50 12 C52 20 54 30 54 30 C52 26 48 26 46 30 Z"
        stroke="#3EC8C8" strokeWidth="1.2" fill="#3EC8C8"
      />
    </svg>
  );
}

// ─── Full horizontal logo (icon + UID | TORONTO) ───────────────────────────────
export function UIDLogo({ width = 160, variant = 'default' }: UIDLogoProps) {
  const navy = variant === 'white' ? '#FFFFFF' : '#0D4D7C';
  const teal = variant === 'white' ? 'rgba(255,255,255,0.85)' : '#3EC8C8';
  const white = variant === 'white' ? 'rgba(255,255,255,0.15)' : 'white';
  const tealGradId = `tealGrad-${variant}`;

  // icon occupies a ~68×78 box; total canvas 390×90
  const vb = '0 0 390 90';

  return (
    <svg
      width={width}
      height={Math.round(width * (90 / 390))}
      viewBox={vb}
      fill="none"
      aria-label="UID Toronto Logo"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={tealGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3EC8C8" />
          <stop offset="100%" stopColor="#2AACAC" />
        </linearGradient>
      </defs>

      {/* ── Tulip in a 68w × 82h box, vertically centred in 90h canvas ── */}
      <g transform="translate(4, 4) scale(0.68)">
        {/* Outer navy – left */}
        <path
          d="M50 108 C50 108 12 90 12 58 C12 38 24 24 36 26 C30 36 28 56 42 70 C44 72 47 74 50 76 Z"
          fill={navy}
        />
        {/* Outer navy – right */}
        <path
          d="M50 108 C50 108 88 90 88 58 C88 38 76 24 64 26 C70 36 72 56 58 70 C56 72 53 74 50 76 Z"
          fill={navy}
        />
        {/* Inner teal – left */}
        <path
          d="M50 98 C50 98 26 80 26 58 C26 44 34 32 40 34 C36 44 36 62 50 76 Z"
          fill={teal}
        />
        {/* Inner teal – right */}
        <path
          d="M50 98 C50 98 74 80 74 58 C74 44 66 32 60 34 C64 44 64 62 50 76 Z"
          fill={teal}
        />
        {/* White oval gap */}
        <ellipse cx="50" cy="66" rx="5" ry="12" fill={white} />
        {/* White separator lines */}
        <path d="M40 34 C36 44 36 62 50 76" stroke={white} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M60 34 C64 44 64 62 50 76" stroke={white} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Crown spike */}
        <path
          d="M46 30 C46 30 48 20 50 12 C52 20 54 30 54 30 C52 26 48 26 46 30 Z"
          fill={teal}
        />
      </g>

      {/* ── UID text ── */}
      <text
        x="84"
        y="68"
        fontFamily="'DM Sans', sans-serif"
        fontSize="52"
        fontWeight="700"
        fill={navy}
        letterSpacing="-1"
      >
        UID
      </text>

      {/* ── Divider ── */}
      <line x1="188" y1="22" x2="188" y2="76" stroke={navy} strokeWidth="1.5" opacity="0.35" />

      {/* ── TORONTO text ── */}
      <text
        x="200"
        y="68"
        fontFamily="'DM Sans', sans-serif"
        fontSize="38"
        fontWeight="700"
        fill={variant === 'white' ? 'rgba(255,255,255,0.85)' : `url(#${tealGradId})`}
        letterSpacing="0.5"
      >
        TORONTO
      </text>
    </svg>
  );
}
