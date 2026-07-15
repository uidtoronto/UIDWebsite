import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getCrmMembers, getTransactions, getTasks, getEvents } from '../../services/exec';

const COLORS = ['#0D4D7C', '#3EC8C8', '#22c55e', '#f59e0b', '#ef4444'];

function formatCAD(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
}

export default function ExecAnalytics() {
  const [loading, setLoading] = useState(true);
  const [membersByStatus, setMembersByStatus] = useState<{ name: string; value: number }[]>([]);
  const [membersByType, setMembersByType] = useState<{ name: string; value: number }[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<{ name: string; value: number }[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [eventsByType, setEventsByType] = useState<{ name: string; value: number }[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    async function load() {
      const [cm, tx, tk, ev] = await Promise.all([getCrmMembers(), getTransactions(), getTasks(), getEvents()]);

      setTotalMembers(cm.data.length);

      const statuses: Record<string, number> = {};
      const types: Record<string, number> = {};
      cm.data.forEach(m => {
        const s = m.membership_status ?? 'unknown';
        statuses[s] = (statuses[s] ?? 0) + 1;
        const t = m.member_type ?? 'unknown';
        types[t] = (types[t] ?? 0) + 1;
      });
      setMembersByStatus(Object.entries(statuses).map(([name, value]) => ({ name, value })));
      setMembersByType(Object.entries(types).map(([name, value]) => ({ name, value })));

      const months: Record<string, { month: string; income: number; expense: number }> = {};
      let rev = 0;
      tx.data.forEach(t => {
        const d = new Date(t.transaction_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
        if (!months[key]) months[key] = { month: label, income: 0, expense: 0 };
        if (t.transaction_type === 'income') { months[key].income += Number(t.amount); rev += Number(t.amount); }
        else months[key].expense += Number(t.amount);
      });
      setTotalRevenue(rev);
      setMonthlyRevenue(Object.values(months).sort((a, b) => a.month.localeCompare(b.month)));

      const taskStatuses: Record<string, number> = {};
      let done = 0;
      tk.data.forEach(t => {
        taskStatuses[t.status] = (taskStatuses[t.status] ?? 0) + 1;
        if (t.status === 'completed') done++;
      });
      setCompletedTasks(done);
      setTasksByStatus(Object.entries(taskStatuses).map(([name, value]) => ({ name, value })));

      setTotalEvents(ev.data.length);
      const evTypes: Record<string, number> = {};
      ev.data.forEach(e => { evTypes[e.event_type] = (evTypes[e.event_type] ?? 0) + 1; });
      setEventsByType(Object.entries(evTypes).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: 'Total Members', value: totalMembers, color: 'text-[#0D4D7C]', bg: 'bg-[#0D4D7C]/8' },
    { label: 'Total Revenue (YTD)', value: formatCAD(totalRevenue), color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Events', value: totalEvents, color: 'text-[#3EC8C8]', bg: 'bg-[#3EC8C8]/10' },
    { label: 'Tasks Completed', value: completedTasks, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#061E30]">Analytics</h1>
        <p className="text-[#7A9BB5] text-sm mt-0.5">Organisation performance overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-[#7A9BB5]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#061E30] text-sm mb-4">Monthly Revenue & Expenses</h2>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A9BB5' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A9BB5' }} tickFormatter={v => `$${Math.round(v / 100) * 100 === v ? v / 1000 + 'k' : v}`} />
                <Tooltip formatter={(v) => formatCAD(Number(v))} />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incGrad)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-[#7A9BB5] text-sm">No data yet</div>}
        </div>

        {/* Members by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#061E30] text-sm mb-4">Members by Status</h2>
          {membersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={membersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {membersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-[#7A9BB5] text-sm">No members yet</div>}
        </div>

        {/* Tasks by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#061E30] text-sm mb-4">Tasks by Status</h2>
          {tasksByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={tasksByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#7A9BB5' }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#7A9BB5' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3EC8C8" radius={[0, 4, 4, 0]} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-[#7A9BB5] text-sm">No tasks yet</div>}
        </div>

        {/* Events by Type */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#061E30] text-sm mb-4">Events by Type</h2>
          {eventsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={eventsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7A9BB5' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A9BB5' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0D4D7C" radius={[4, 4, 0, 0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-[#7A9BB5] text-sm">No events yet</div>}
        </div>
      </div>

      {/* Member Type breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#061E30] text-sm mb-4">Members by Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {membersByType.map((m, i) => (
            <div key={m.name} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS[i % COLORS.length] }}>{m.value}</div>
              <div className="text-xs text-[#7A9BB5] capitalize">{m.name}</div>
            </div>
          ))}
          {membersByType.length === 0 && <div className="col-span-4 text-center text-[#7A9BB5] text-sm py-4">No data yet</div>}
        </div>
      </div>
    </div>
  );
}
