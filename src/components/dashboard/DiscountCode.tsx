import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface DiscountCodeProps {
  code: string;
}

export default function DiscountCode({ code }: DiscountCodeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(62,200,200,0.06)', border: '1px solid rgba(62,200,200,0.2)', borderRadius: '14px' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-soft)', fontWeight: 600, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>Your Discount Code</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 600, letterSpacing: '1px', color: 'var(--uid-navy)', margin: 0 }}>{code}</p>
      </div>
      <button
        onClick={copy}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          background: copied ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))',
          color: '#fff', border: 'none', cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
      >
        {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
      </button>
    </div>
  );
}
