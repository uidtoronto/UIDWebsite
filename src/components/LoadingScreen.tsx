import { useEffect, useRef } from 'react';

interface LoadingScreenProps {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loaderRef.current) {
        loaderRef.current.style.animation = 'loaderExit 0.6s ease-in forwards';
      }
      setTimeout(onDone, 600);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div ref={loaderRef} id="loader">
      {/* Animated Tulip SVG */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        {/* viewBox matches UIDTulipIcon: 100×115 */}
        <svg width="80" height="92" viewBox="0 0 100 115" fill="none">
          <defs>
            <style>{`
              /* stroke draw – each class has its own dasharray length */
              .lp1 { stroke:#0D4D7C; stroke-width:2; fill:transparent; stroke-dasharray:320; stroke-dashoffset:320; animation:drawPetal 0.65s ease-out forwards 0ms;   }
              .lp2 { stroke:#0D4D7C; stroke-width:2; fill:transparent; stroke-dasharray:320; stroke-dashoffset:320; animation:drawPetal 0.65s ease-out forwards 150ms;  }
              .lp3 { stroke:#3EC8C8; stroke-width:2; fill:transparent; stroke-dasharray:240; stroke-dashoffset:240; animation:drawPetal 0.65s ease-out forwards 450ms;  }
              .lp4 { stroke:#3EC8C8; stroke-width:2; fill:transparent; stroke-dasharray:240; stroke-dashoffset:240; animation:drawPetal 0.65s ease-out forwards 550ms;  }
              .lp5 { stroke:#3EC8C8; stroke-width:1.5;fill:transparent; stroke-dasharray:90;  stroke-dashoffset:90;  animation:drawPetal 0.45s ease-out forwards 700ms;  }
              /* fill fade-in per layer */
              .lp1f { fill:#0D4D7C; opacity:0; animation:fillIn 0.35s ease-out forwards 800ms;  }
              .lp2f { fill:#0D4D7C; opacity:0; animation:fillIn 0.35s ease-out forwards 900ms;  }
              .lp3f { fill:#3EC8C8; opacity:0; animation:fillIn 0.35s ease-out forwards 1000ms; }
              .lp4f { fill:#3EC8C8; opacity:0; animation:fillIn 0.35s ease-out forwards 1050ms; }
              .lp5f { fill:#3EC8C8; opacity:0; animation:fillIn 0.35s ease-out forwards 1100ms; }
              @keyframes drawPetal { to { stroke-dashoffset: 0; } }
              @keyframes fillIn    { to { opacity: 1; } }
            `}</style>
          </defs>

          {/* ── Stroke layers (draw in sequence) ── */}
          {/* Navy outer left */}
          <path className="lp1" d="M50 108 C50 108 12 90 12 58 C12 38 24 24 36 26 C30 36 28 56 42 70 C44 72 47 74 50 76 Z"/>
          {/* Navy outer right */}
          <path className="lp2" d="M50 108 C50 108 88 90 88 58 C88 38 76 24 64 26 C70 36 72 56 58 70 C56 72 53 74 50 76 Z"/>
          {/* Teal inner left */}
          <path className="lp3" d="M50 98 C50 98 26 80 26 58 C26 44 34 32 40 34 C36 44 36 62 50 76 Z"/>
          {/* Teal inner right */}
          <path className="lp4" d="M50 98 C50 98 74 80 74 58 C74 44 66 32 60 34 C64 44 64 62 50 76 Z"/>
          {/* Crown spike */}
          <path className="lp5" d="M46 30 C46 30 48 20 50 12 C52 20 54 30 54 30 C52 26 48 26 46 30 Z"/>

          {/* ── Fill layers (fade in after stroke) ── */}
          <path className="lp1f" d="M50 108 C50 108 12 90 12 58 C12 38 24 24 36 26 C30 36 28 56 42 70 C44 72 47 74 50 76 Z"/>
          <path className="lp2f" d="M50 108 C50 108 88 90 88 58 C88 38 76 24 64 26 C70 36 72 56 58 70 C56 72 53 74 50 76 Z"/>
          <path className="lp3f" d="M50 98 C50 98 26 80 26 58 C26 44 34 32 40 34 C36 44 36 62 50 76 Z"/>
          <path className="lp4f" d="M50 98 C50 98 74 80 74 58 C74 44 66 32 60 34 C64 44 64 62 50 76 Z"/>
          <path className="lp5f" d="M46 30 C46 30 48 20 50 12 C52 20 54 30 54 30 C52 26 48 26 46 30 Z"/>

          {/* ── White details (always visible, appear over filled shapes) ── */}
          <ellipse cx="50" cy="66" rx="5" ry="12" fill="white"/>
          <path d="M40 34 C36 44 36 62 50 76" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M60 34 C64 44 64 62 50 76" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Wordmark row */}
        <div className="loader-wordmark" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '32px', fontWeight: 700, color: '#0D4D7C', letterSpacing: '-0.5px' }}>UID</span>
          <div className="loader-divider" />
          <span className="loader-toronto" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 700, background: 'linear-gradient(90deg, #3EC8C8, #2AACAC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>TORONTO</span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '200px', height: '2px', background: 'rgba(62,200,200,0.15)', borderRadius: '99px', overflow: 'hidden' }}>
          <div className="loader-progress-bar" />
        </div>

        {/* Tagline */}
        <p className="loader-tagline" style={{ fontSize: '11px', letterSpacing: '2px', color: '#7A9BB5', textTransform: 'uppercase', margin: 0 }}>
          Union of International Democrats
        </p>
      </div>
    </div>
  );
}
