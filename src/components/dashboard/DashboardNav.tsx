import { Link } from 'react-router-dom';
import { UIDLogo } from '../UIDLogo';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Calendar, Newspaper, Sparkles, Shield } from 'lucide-react';

interface DashboardNavProps {
  active: string;
  onNavigate: (section: string) => void;
}

const EXEC_ROLES = ['admin', 'regional_president', 'executive', 'youth_branch', 'womens_branch', 'volunteer_coordinator', 'media_team', 'finance_team'];

export default function DashboardNav({ active, onNavigate }: DashboardNavProps) {
  const { user, logout } = useAuth();
  const isExec = user?.is_exec || EXEC_ROLES.includes(user?.exec_role ?? '');

  const items = [
    { key: 'overview', label: 'Overview', icon: Sparkles },
    { key: 'events', label: 'Upcoming Events', icon: Calendar },
    { key: 'news', label: 'Recent News', icon: Newspaper },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '76px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(62,200,200,0.12)', boxShadow: '0 2px 40px rgba(13,77,124,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem' }}>
      <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <UIDLogo width={128} />
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '99px',
              fontSize: '13.5px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              background: active === key ? 'rgba(62,200,200,0.1)' : 'transparent',
              color: active === key ? 'var(--uid-teal-dark)' : 'var(--text-mid)',
              border: '1.5px solid', borderColor: active === key ? 'rgba(62,200,200,0.3)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.25s',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="hidden md:flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
        {isExec && (
          <Link
            to="/exec"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 500,
              background: 'rgba(13,77,124,0.08)', color: '#0D4D7C',
              border: '1.5px solid rgba(13,77,124,0.15)', textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,77,124,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,77,124,0.08)'; }}
          >
            <Shield size={13} />
            Exec Board
          </Link>
        )}
        <span style={{ fontSize: '13px', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif" }}>
          {user?.first_name}
        </span>
        <button
          onClick={logout}
          className="shimmer-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '99px', fontSize: '13.5px', fontWeight: 500,
            background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff',
            border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'transform 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,77,124,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>

      {/* Mobile logout */}
      <button
        onClick={logout}
        className="flex md:hidden"
        style={{ padding: '8px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <LogOut size={14} />
      </button>
    </nav>
  );
}
