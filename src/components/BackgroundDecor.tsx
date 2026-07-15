// Purely decorative SVG/CSS background layers — never compete with text.

/* ─────────────────────────────────────────────
   CITY SKYLINE  (hero bottom, opacity 0.06)
   Combined Toronto + Istanbul
───────────────────────────────────────────── */
export function CityAndIslamicSkyline() {
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px',
        opacity: 0.06, pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="skyBldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D4D7C" stopOpacity="1" />
          <stop offset="100%" stopColor="#0D4D7C" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F9FF" stopOpacity="0" />
          <stop offset="100%" stopColor="#F0F9FF" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Toronto left cluster */}
      <rect x="0"   y="148" width="32" height="52" fill="url(#skyBldg)" />
      <rect x="35"  y="128" width="22" height="72" fill="url(#skyBldg)" />
      <rect x="60"  y="108" width="38" height="92" fill="url(#skyBldg)" />
      <rect x="79"  y="98"  width="4"  height="11" fill="url(#skyBldg)" />
      <rect x="101" y="132" width="24" height="68" fill="url(#skyBldg)" />
      <rect x="128" y="115" width="28" height="85" fill="url(#skyBldg)" />
      {/* CN Tower */}
      <rect x="169" y="18"  width="4"  height="182" fill="url(#skyBldg)" />
      <ellipse cx="171" cy="92" rx="13" ry="6" fill="url(#skyBldg)" />
      <rect x="170" y="10"  width="2"  height="9"  fill="url(#skyBldg)" />
      <circle cx="171" cy="8" r="3" fill="#3EC8C8" fillOpacity="0.65" />
      {/* Toronto mid-left */}
      <rect x="187" y="108" width="42" height="92" fill="url(#skyBldg)" />
      <rect x="232" y="88"  width="36" height="112" fill="url(#skyBldg)" />
      <rect x="249" y="80"  width="3"  height="9"  fill="url(#skyBldg)" />
      <rect x="271" y="118" width="26" height="82" fill="url(#skyBldg)" />
      <rect x="300" y="98"  width="40" height="102" fill="url(#skyBldg)" />
      <rect x="343" y="132" width="28" height="68" fill="url(#skyBldg)" />
      <rect x="374" y="142" width="22" height="58" fill="url(#skyBldg)" />

      {/* Hagia Sophia center-left (~x=590) */}
      <rect x="525" y="145" width="130" height="55" fill="url(#skyBldg)" />
      <rect x="548" y="128" width="84"  height="18" fill="url(#skyBldg)" />
      <path d="M 542,128 Q 590,85 638,128 Z"        fill="url(#skyBldg)" />
      <path d="M 525,145 Q 543,128 562,145 Z"        fill="url(#skyBldg)" />
      <path d="M 628,145 Q 647,128 665,145 Z"        fill="url(#skyBldg)" />
      <rect x="514" y="100" width="7" height="100"  fill="url(#skyBldg)" />
      <path d="M 513,100 L 517.5,86 L 522,100 Z"    fill="url(#skyBldg)" />
      <circle cx="517.5" cy="84" r="2.5"             fill="#3EC8C8" fillOpacity="0.55" />
      <rect x="659" y="100" width="7" height="100"  fill="url(#skyBldg)" />
      <path d="M 658,100 L 662.5,86 L 667,100 Z"    fill="url(#skyBldg)" />
      <circle cx="662.5" cy="84" r="2.5"             fill="#3EC8C8" fillOpacity="0.55" />
      {[543,563,583,603,623].map(x => (
        <path key={x} d={`M ${x},200 L ${x},165 Q ${x+9},152 ${x+18},165 L ${x+18},200`}
          stroke="rgba(67,199,199,0.5)" strokeWidth="1" fill="none" />
      ))}

      {/* Blue Mosque (~x=790) */}
      <rect x="735" y="150" width="110" height="50" fill="url(#skyBldg)" />
      <rect x="755" y="133" width="70"  height="18" fill="url(#skyBldg)" />
      <path d="M 748,133 Q 790,95 832,133 Z"         fill="url(#skyBldg)" />
      <path d="M 735,150 Q 752,133 770,150 Z"         fill="url(#skyBldg)" />
      <path d="M 810,150 Q 828,133 845,150 Z"         fill="url(#skyBldg)" />
      <rect x="720" y="92"  width="8" height="108"  fill="url(#skyBldg)" />
      <path d="M 719,92 L 724,77 L 729,92 Z"          fill="url(#skyBldg)" />
      <circle cx="724" cy="75" r="2.5"                fill="#3EC8C8" fillOpacity="0.55" />
      <rect x="852" y="92"  width="8" height="108"  fill="url(#skyBldg)" />
      <path d="M 851,92 L 856,77 L 861,92 Z"          fill="url(#skyBldg)" />
      <circle cx="856" cy="75" r="2.5"                fill="#3EC8C8" fillOpacity="0.55" />
      <rect x="748" y="108" width="6" height="92"   fill="url(#skyBldg)" />
      <path d="M 747,108 L 751,97 L 755,108 Z"        fill="url(#skyBldg)" />
      <circle cx="751" cy="95" r="2"                  fill="#3EC8C8" fillOpacity="0.5" />
      <rect x="826" y="108" width="6" height="92"   fill="url(#skyBldg)" />
      <path d="M 825,108 L 829,97 L 833,108 Z"        fill="url(#skyBldg)" />
      <circle cx="829" cy="95" r="2"                  fill="#3EC8C8" fillOpacity="0.5" />
      {[745,765,785,805,825].map(x => (
        <path key={x} d={`M ${x},200 L ${x},163 Q ${x+9},150 ${x+18},163 L ${x+18},200`}
          stroke="rgba(67,199,199,0.5)" strokeWidth="1" fill="none" />
      ))}

      {/* Toronto right cluster */}
      <rect x="1010" y="128" width="36" height="72"  fill="url(#skyBldg)" />
      <rect x="1049" y="105" width="26" height="95"  fill="url(#skyBldg)" />
      <rect x="1078" y="88"  width="44" height="112" fill="url(#skyBldg)" />
      <rect x="1082" y="80"  width="4"  height="9"   fill="url(#skyBldg)" />
      <rect x="1125" y="118" width="30" height="82"  fill="url(#skyBldg)" />
      <rect x="1158" y="96"  width="38" height="104" fill="url(#skyBldg)" />
      <rect x="1199" y="132" width="26" height="68"  fill="url(#skyBldg)" />
      <rect x="1228" y="108" width="34" height="92"  fill="url(#skyBldg)" />
      <rect x="1265" y="118" width="28" height="82"  fill="url(#skyBldg)" />
      <rect x="1296" y="94"  width="40" height="106" fill="url(#skyBldg)" />
      <rect x="1299" y="86"  width="3"  height="9"   fill="url(#skyBldg)" />
      <rect x="1339" y="138" width="24" height="62"  fill="url(#skyBldg)" />
      <rect x="1366" y="112" width="36" height="88"  fill="url(#skyBldg)" />
      <rect x="1405" y="145" width="35" height="55"  fill="url(#skyBldg)" />

      {/* Bottom fade */}
      <rect x="0" y="130" width="1440" height="70" fill="url(#skyFade)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   OTTOMAN CORNER ORNAMENTS  (hero, opacity 0.07)
───────────────────────────────────────────── */
function CornerOrnamentSVG({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const flipX = corner === 'tr' || corner === 'br';
  const flipY = corner === 'bl' || corner === 'br';
  const w = 130, h = 130;
  const tx = flipX ? w : 0, ty = flipY ? h : 0;
  const sx = flipX ? -1 : 1, sy = flipY ? -1 : 1;

  return (
    <svg
      width={w} height={h} viewBox={`0 0 ${w} ${h}`}
      fill="none" aria-hidden="true"
      style={{
        position: 'absolute',
        top:    (corner === 'tl' || corner === 'tr') ? 0 : undefined,
        bottom: (corner === 'bl' || corner === 'br') ? 0 : undefined,
        left:   (corner === 'tl' || corner === 'bl') ? 0 : undefined,
        right:  (corner === 'tr' || corner === 'br') ? 0 : undefined,
        opacity: 0.07, pointerEvents: 'none',
      }}
    >
      <g transform={`translate(${tx},${ty}) scale(${sx},${sy})`}>
        <line x1="0" y1="0" x2="130" y2="130" stroke="#0D4D7C" strokeWidth="0.5" strokeOpacity="0.5" />
        <line x1="0" y1="0" x2="95"  y2="130" stroke="#0D4D7C" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="0" y1="0" x2="130" y2="95"  stroke="#0D4D7C" strokeWidth="0.5" strokeOpacity="0.3" />
        <path d="M 0,65 Q 32,0 65,0"   stroke="#0D4D7C" strokeWidth="0.9" strokeOpacity="0.55" />
        <path d="M 0,95 Q 48,0 95,0"   stroke="#0D4D7C" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M 0,42 Q 21,0 42,0"   stroke="#3EC8C8" strokeWidth="0.7" strokeOpacity="0.55" />
        <path d="M 0,32 C 22,18 32,30 22,52 C 16,65 32,68 50,58" stroke="#3EC8C8" strokeWidth="0.6" strokeOpacity="0.4" />
        <path d="M 35,0 C 20,22 30,35 52,25 C 64,18 66,34 58,52"  stroke="#0D4D7C" strokeWidth="0.6" strokeOpacity="0.35" />
        {/* 8-petal rosette at (22,22) */}
        <circle cx="22" cy="22" r="16" stroke="#0D4D7C" strokeWidth="0.9" strokeOpacity="0.65" />
        <circle cx="22" cy="22" r="10" stroke="#3EC8C8" strokeWidth="0.7" strokeOpacity="0.65" />
        <polygon
          points="38,22 27.5,19.7 33.3,10.7 24.3,16.5 22,6 19.7,16.5 10.7,10.7 16.5,19.7 6,22 16.5,24.3 10.7,33.3 19.7,27.5 22,38 24.3,27.5 33.3,33.3 27.5,24.3"
          stroke="#0D4D7C" strokeWidth="0.7" strokeOpacity="0.55" />
        <line x1="6"    y1="22"   x2="38"   y2="22"   stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.55" />
        <line x1="22"   y1="6"    x2="22"   y2="38"   stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.55" />
        <line x1="10.7" y1="10.7" x2="33.3" y2="33.3" stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.45" />
        <line x1="33.3" y1="10.7" x2="10.7" y2="33.3" stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.45" />
        <circle cx="22" cy="22" r="2.2" fill="#3EC8C8" fillOpacity="0.75" />
        {/* Tulip shapes */}
        <path d="M 70,22 C 65,15 63,8 67,4 Q 70,0 70,0 Q 70,0 73,4 C 77,8 75,15 70,22 Z"
          stroke="#0D4D7C" strokeWidth="0.7" strokeOpacity="0.5" />
        <path d="M 95,42 C 90,34 88,26 92,21 Q 95,17 95,17 Q 95,17 98,21 C 102,26 100,34 95,42 Z"
          stroke="#3EC8C8" strokeWidth="0.6" strokeOpacity="0.45" />
        <path d="M 55,72 C 51,66 50,59 53,55 Q 55,52 55,52 Q 55,52 57,55 C 60,59 59,66 55,72 Z"
          stroke="#0D4D7C" strokeWidth="0.6" strokeOpacity="0.4" />
      </g>
    </svg>
  );
}

export function OttomanCorners() {
  return (
    <>
      <CornerOrnamentSVG corner="tl" />
      <CornerOrnamentSVG corner="tr" />
      <CornerOrnamentSVG corner="bl" />
      <CornerOrnamentSVG corner="br" />
    </>
  );
}

/* ─────────────────────────────────────────────
   FLOATING ROSETTES  (hero, opacity 0.05)
───────────────────────────────────────────── */
function RosetteCircle({ size, top, left, delay }: {
  size: number; top: string; left: string; delay: string;
}) {
  const cx = size / 2, cy = size / 2;
  const r1 = size * 0.46, r2 = size * 0.33, r3 = size * 0.18;

  const starPoints = (outerR: number, innerR: number, n = 10) => {
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const angle = (Math.PI / n) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{
        position: 'absolute', top, left,
        opacity: 0.05, pointerEvents: 'none',
        animation: `floatRosette 20s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <circle cx={cx} cy={cy} r={r1} stroke="#0D4D7C" strokeWidth="0.8" strokeOpacity="0.7" />
      <circle cx={cx} cy={cy} r={r2} stroke="#3EC8C8" strokeWidth="0.7" strokeOpacity="0.65" />
      <circle cx={cx} cy={cy} r={r3} stroke="#0D4D7C" strokeWidth="0.7" strokeOpacity="0.7" />
      <polygon points={starPoints(r1, r1 * 0.4)} stroke="#0D4D7C" strokeWidth="0.6" strokeOpacity="0.6" fill="none" />
      <polygon points={starPoints(r2, r2 * 0.4)} stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.55" fill="none" />
      <line x1={cx - r1} y1={cy} x2={cx + r1} y2={cy} stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.5" />
      <line x1={cx} y1={cy - r1} x2={cx} y2={cy + r1} stroke="#3EC8C8" strokeWidth="0.5" strokeOpacity="0.5" />
      <line x1={cx - r1 * 0.707} y1={cy - r1 * 0.707} x2={cx + r1 * 0.707} y2={cy + r1 * 0.707} stroke="#3EC8C8" strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1={cx + r1 * 0.707} y1={cy - r1 * 0.707} x2={cx - r1 * 0.707} y2={cy + r1 * 0.707} stroke="#3EC8C8" strokeWidth="0.4" strokeOpacity="0.4" />
      <circle cx={cx} cy={cy} r={2.5} fill="#3EC8C8" fillOpacity="0.8" />
    </svg>
  );
}

export function FloatingRosettes() {
  return (
    <>
      <RosetteCircle size={120} top="12%" left="5%"  delay="0s"  />
      <RosetteCircle size={90}  top="10%" left="88%" delay="6s"  />
      <RosetteCircle size={70}  top="60%" left="3%"  delay="13s" />
    </>
  );
}

/* ─────────────────────────────────────────────
   MOSQUE SILHOUETTE  (events section, opacity 0.055)
───────────────────────────────────────────── */
export function MosqueSilhouette() {
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px',
        opacity: 0.055, pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="mqBldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D4D7C" stopOpacity="1" />
          <stop offset="100%" stopColor="#0D4D7C" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="mqFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBF5FB" stopOpacity="0" />
          <stop offset="100%" stopColor="#EBF5FB" stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect x="450" y="125" width="540" height="75" fill="url(#mqBldg)" />
      <rect x="550" y="105" width="340" height="22" fill="url(#mqBldg)" />
      <path d="M 538,105 Q 720,50 902,105 Z"  fill="url(#mqBldg)" />
      <path d="M 450,125 Q 500,98 550,125 Z"  fill="url(#mqBldg)" />
      <path d="M 890,125 Q 940,98 990,125 Z"  fill="url(#mqBldg)" />
      {/* Outer minarets */}
      <rect x="428" y="60"  width="14" height="140" fill="url(#mqBldg)" />
      <path d="M 426,60 L 435,44 L 444,60 Z"        fill="url(#mqBldg)" />
      <circle cx="435" cy="42" r="3.5"              fill="#3EC8C8" fillOpacity="0.6" />
      <rect x="998" y="60"  width="14" height="140" fill="url(#mqBldg)" />
      <path d="M 996,60 L 1005,44 L 1014,60 Z"      fill="url(#mqBldg)" />
      <circle cx="1005" cy="42" r="3.5"             fill="#3EC8C8" fillOpacity="0.6" />
      {/* Inner minarets */}
      <rect x="543" y="78"  width="10" height="122" fill="url(#mqBldg)" />
      <path d="M 541,78 L 548,65 L 555,78 Z"         fill="url(#mqBldg)" />
      <circle cx="548" cy="63" r="2.5"              fill="#3EC8C8" fillOpacity="0.55" />
      <rect x="887" y="78"  width="10" height="122" fill="url(#mqBldg)" />
      <path d="M 885,78 L 892,65 L 899,78 Z"         fill="url(#mqBldg)" />
      <circle cx="892" cy="63" r="2.5"              fill="#3EC8C8" fillOpacity="0.55" />
      {/* Arch windows */}
      {[464,494,524,554,584,614,644,674,704,734,764,794,824,854,884,914,944,974].map(x => (
        <path key={x} d={`M ${x},200 L ${x},162 Q ${x+13},148 ${x+26},162 L ${x+26},200`}
          stroke="rgba(67,199,199,0.45)" strokeWidth="1" fill="none" />
      ))}
      <rect x="0" y="140" width="1440" height="60" fill="url(#mqFade)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   ROSETTE WATERMARK  (membership card, opacity 0.04)
───────────────────────────────────────────── */
export function RosetteWatermark() {
  const cx = 350, cy = 350;
  const starPoints = (outerR: number, innerR: number, n = 10) => {
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const angle = (Math.PI / n) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg width="700" height="700" viewBox="0 0 700 700"
      aria-hidden="true"
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.04, pointerEvents: 'none', zIndex: 0,
      }}
    >
      <circle cx={cx} cy={cy} r={320} stroke="#43C7C7" strokeWidth="0.5" fill="none" />
      <circle cx={cx} cy={cy} r={240} stroke="#0D4D7C" strokeWidth="0.5" fill="none" />
      <circle cx={cx} cy={cy} r={140} stroke="#43C7C7" strokeWidth="0.5" fill="none" />
      <polygon points={starPoints(320, 320 * 0.38)} stroke="#43C7C7" strokeWidth="0.5" fill="none" />
      <polygon points={starPoints(240, 240 * 0.38)} stroke="#0D4D7C" strokeWidth="0.5" fill="none" />
      <line x1={cx - 320} y1={cy} x2={cx + 320} y2={cy} stroke="#43C7C7" strokeWidth="0.5" />
      <line x1={cx} y1={cy - 320} x2={cx} y2={cy + 320} stroke="#43C7C7" strokeWidth="0.5" />
      <line x1={cx - 226} y1={cy - 226} x2={cx + 226} y2={cy + 226} stroke="#43C7C7" strokeWidth="0.5" />
      <line x1={cx + 226} y1={cy - 226} x2={cx - 226} y2={cy + 226} stroke="#43C7C7" strokeWidth="0.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   OTTOMAN ARCH ROW  (newsletter top, opacity 0.08)
───────────────────────────────────────────── */
export function OttomanArchRow() {
  const archW = 90, archH = 58, count = 17;
  const totalW = archW * count;

  return (
    <svg viewBox={`0 0 ${totalW} ${archH}`} preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: `${archH}px`,
        opacity: 0.08, pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const x = i * archW, mx = x + archW / 2;
        return (
          <g key={i}>
            <path
              d={`M ${x},${archH} L ${x},${archH * 0.5} Q ${mx},0 ${x + archW},${archH * 0.5} L ${x + archW},${archH}`}
              stroke="rgba(67,199,199,0.6)" strokeWidth="0.9" fill="none"
            />
            <circle cx={mx} cy="2.5" r="2" fill="rgba(67,199,199,0.5)" />
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   FOOTER ARCH BORDER  (footer top)
───────────────────────────────────────────── */
export function FooterArchBorder() {
  const archW = 72, archH = 60, count = 20;
  const totalW = archW * count;

  return (
    <svg viewBox={`0 0 ${totalW} ${archH}`} preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: `${archH}px`,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const x = i * archW;
        return (
          <path key={i}
            d={`M ${x},${archH} L ${x},${archH * 0.5} Q ${x + archW / 2},0 ${x + archW},${archH * 0.5} L ${x + archW},${archH} Z`}
            fill={`rgba(67,199,199,${i % 2 === 0 ? 0.15 : 0.10})`}
          />
        );
      })}
    </svg>
  );
}
