import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Menu, X, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NAV = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/members',  label: 'Members',   icon: Users,           end: false },
] as const;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast('Signed out successfully', 'success');
    navigate('/login');
  };

  const SidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/admin" style={{ textDecoration: 'none' }}>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600 }}>
            UID Toronto
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#fff', fontWeight: 400 }}>
            <em>Admin</em>
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV.map(item => {
          const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.875rem', borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500,
                textDecoration: 'none',
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active ? 'linear-gradient(135deg, rgba(62,200,200,0.18), rgba(26,106,154,0.18))' : 'transparent',
                border: active ? '1px solid rgba(62,200,200,0.25)' : '1px solid transparent',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '1rem 0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.5rem 0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserCircle size={18} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 0.875rem', borderRadius: '10px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--off-white)' }}>
      {/* Desktop sidebar (fixed) */}
      <aside className="hidden md:flex" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '248px',
        background: 'linear-gradient(180deg, #0D4D7C 0%, #061E30 100%)',
        flexDirection: 'column', zIndex: 50,
        boxShadow: '4px 0 24px rgba(6,30,48,0.12)',
      }}>
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(6,30,48,0.5)', zIndex: 60, animation: 'modalBackdropIn 0.2s ease forwards' }} className="md:hidden" />
          <aside className="md:hidden" style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '248px',
            background: 'linear-gradient(180deg, #0D4D7C 0%, #061E30 100%)',
            flexDirection: 'column', zIndex: 61,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}>
            {SidebarContent}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="md:ml-[248px]" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top bar */}
        <div className="md:hidden" style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', background: '#fff',
          borderBottom: '1px solid rgba(13,77,124,0.08)',
        }}>
          <button onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar" style={{ background: 'rgba(13,77,124,0.06)', border: 'none', cursor: 'pointer', width: '38px', height: '38px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--uid-navy)' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--uid-navy)', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin</p>
          <div style={{ width: '38px' }} />
        </div>

        <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
