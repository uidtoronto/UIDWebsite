import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, UserPlus, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMemberStats, getRecentMembers } from '../../services/members';
import { StatusBadge } from '../../components/admin/AdminField';
import { fullName, formatRelative, STATUS_CHART_COLORS, statusStyle } from '../../lib/memberUtils';
import type { MemberStats, Member } from '../../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [recent, setRecent] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [statsRes, recentRes] = await Promise.all([getMemberStats(), getRecentMembers(6)]);
      if (cancelled) return;
      if (statsRes.error) { setError(statsRes.error); setLoading(false); return; }
      if (recentRes.error) { setError(recentRes.error); setLoading(false); return; }
      setStats(statsRes.data);
      setRecent(recentRes.data);
      setError(null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const chartData = stats
    ? stats.byStatus
        .filter(s => s.count > 0)
        .map(s => ({ name: statusStyle(s.status).label, status: s.status, value: s.count }))
    : [];

  return (
    <div className="admin-fade-up">
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal-dark)', fontWeight: 600, marginBottom: '0.5rem' }}>
          Dashboard
        </p>
        <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 400, color: 'var(--uid-navy)', lineHeight: 1.2 }}>
          <em>Welcome, {user?.first_name || 'Admin'}</em>
        </h1>
        <p style={{ margin: '0.5rem 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-mid)' }}>
          Here's what's happening with your members today.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--text-soft)' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--uid-teal)' }} />
        </div>
      ) : error ? (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <StatCard icon={<Users size={20} />} label="Total members" value={stats?.total ?? 0} accent="navy" />
            <StatCard icon={<TrendingUp size={20} />} label="Active" value={stats?.byStatus.find(s => s.status === 'active')?.count ?? 0} accent="teal" />
            <StatCard icon={<UserPlus size={20} />} label="Pending" value={stats?.byStatus.find(s => s.status === 'pending')?.count ?? 0} accent="amber" />
          </div>

          {/* Chart + recent */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }} className="admin-dash-grid">
            {/* Status chart */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(13,77,124,0.07)', boxShadow: '0 4px 20px rgba(13,77,124,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--uid-navy)' }}>Members by status</h3>
              {chartData.length === 0 ? (
                <p style={{ color: 'var(--text-soft)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>No data</p>
              ) : (
                <>
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} stroke="none">
                          {chartData.map((d) => (
                            <Cell key={d.status} fill={STATUS_CHART_COLORS[d.status as keyof typeof STATUS_CHART_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid rgba(13,77,124,0.1)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', boxShadow: '0 8px 24px rgba(13,77,124,0.12)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {stats!.byStatus.map(s => (
                      <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-mid)' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: STATUS_CHART_COLORS[s.status] }} />
                          {statusStyle(s.status).label}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--uid-navy)' }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Recent members */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(13,77,124,0.07)', boxShadow: '0 4px 20px rgba(13,77,124,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--uid-navy)' }}>Recent members</h3>
                <Link to="/admin/members" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--uid-teal-dark)', textDecoration: 'none' }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {recent.length === 0 ? (
                <p style={{ color: 'var(--text-soft)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>No members yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {recent.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid rgba(13,77,124,0.05)' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, color: 'var(--uid-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fullName(m.first_name, m.last_name)}
                        </p>
                        <p style={{ margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.email} · {formatRelative(m.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 820px) {
          .admin-dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Stat card ──
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: 'navy' | 'teal' | 'amber' }) {
  const colors = {
    navy: { bg: 'rgba(13,77,124,0.08)', fg: 'var(--uid-navy)' },
    teal: { bg: 'rgba(62,200,200,0.10)', fg: 'var(--uid-teal-dark)' },
    amber: { bg: 'rgba(245,158,11,0.10)', fg: '#b45309' },
  }[accent];

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(13,77,124,0.07)', boxShadow: '0 4px 20px rgba(13,77,124,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(13,77,124,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,77,124,0.05)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.fg, flexShrink: 0 }}>
          {icon}
        </div>
        <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 500, color: 'var(--text-mid)' }}>{label}</p>
      </div>
      <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 500, color: 'var(--uid-navy)', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}
