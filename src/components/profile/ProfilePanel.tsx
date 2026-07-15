import { useState } from 'react';
import { User, Mail, Phone, AtSign, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePanel() {
  const { user, updateProfile, isPending } = useAuth();
  const [first_name, setFirstName] = useState(user?.first_name ?? '');
  const [last_name, setLastName] = useState(user?.last_name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ first_name, last_name, username, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 42px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--uid-dark)', background: '#fff',
    border: '1.5px solid rgba(13,77,124,0.16)', borderRadius: '12px',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.25s, box-shadow 0.25s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--uid-navy)', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', display: 'flex', alignItems: 'center',
  };

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', border: '1px solid rgba(13,77,124,0.08)', boxShadow: '0 8px 32px rgba(13,77,124,0.06)' }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1.25rem' }}>
        <em>Profile Settings</em>
      </h3>
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <div style={{ position: 'relative' }}>
              <div style={iconStyle}><User size={16} /></div>
              <input style={inputStyle} value={first_name} onChange={e => setFirstName(e.target.value)} disabled={isPending} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <div style={{ position: 'relative' }}>
              <div style={iconStyle}><User size={16} /></div>
              <input style={inputStyle} value={last_name} onChange={e => setLastName(e.target.value)} disabled={isPending} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: 'relative' }}>
              <div style={iconStyle}><AtSign size={16} /></div>
              <input style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} disabled={isPending} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <div style={{ position: 'relative' }}>
              <div style={iconStyle}><Phone size={16} /></div>
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} disabled={isPending} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>Email</label>
          <div style={{ position: 'relative' }}>
            <div style={iconStyle}><Mail size={16} /></div>
            <input style={{ ...inputStyle, background: 'var(--off-white)', cursor: 'not-allowed' }} value={user?.email ?? ''} disabled />
          </div>
        </div>
        <button
          type="submit"
          className="shimmer-btn"
          disabled={isPending}
          style={{
            marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '99px', fontSize: '14px', fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #0D4D7C, #1A6A9A)',
            color: '#fff', border: 'none', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s',
            opacity: isPending ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!isPending) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,77,124,0.3)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          {isPending ? 'Saving…' : saved ? 'Saved!' : (<><Save size={15} /> Save Changes</>)}
        </button>
      </form>
    </div>
  );
}
