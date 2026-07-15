import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Calendar, CheckSquare, Bell, TrendingUp, DollarSign,
  ChevronRight, Clock, AlertCircle, UserCheck, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCrmMembers, getTasks, getEvents, getTransactions, getNotifications } from '../../services/exec';
import type { ExecTask, ExecEvent, FinanceTransaction, ExecNotification } from '../../types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  executive_meeting: 'bg-[#0D4D7C]/10 text-[#0D4D7C]',
  youth_meeting: 'bg-teal-50 text-teal-700',
  womens_branch: 'bg-pink-50 text-pink-700',
  community_event: 'bg-green-50 text-green-700',
  fundraiser: 'bg-amber-50 text-amber-700',
  eid_program: 'bg-orange-50 text-orange-700',
  ramadan_program: 'bg-violet-50 text-violet-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function StatCard({ label, value, sub, icon: Icon, color, href }: StatCardProps) {
  const inner = (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#3EC8C8]/30 hover:shadow-lg transition-all duration-300 group cursor-pointer`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        {href && <ChevronRight size={14} className="text-gray-300 group-hover:text-[#3EC8C8] transition-colors mt-1" />}
      </div>
      <div className="text-2xl font-bold text-[#061E30] leading-none mb-1">{value}</div>
      <div className="text-xs font-medium text-[#3D6480]">{label}</div>
      {sub && <div className="text-[11px] text-[#7A9BB5] mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

export default function ExecHome() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ExecTask[]>([]);
  const [events, setEvents] = useState<ExecEvent[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [notifications, setNotifications] = useState<ExecNotification[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const [tm, te, tt, tn, cm] = await Promise.all([
        getTasks(),
        getEvents(today),
        getTransactions(),
        getNotifications(),
        getCrmMembers(),
      ]);
      setTasks(tm.data);
      setEvents(te.data.slice(0, 5));
      setTransactions(tt.data.slice(0, 5));
      setNotifications(tn.data.filter(n => !n.is_read).slice(0, 5));
      setMemberCount(cm.data.length);
      setLoading(false);
    }
    load();
  }, []);

  const tasksDueToday = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0] && t.status !== 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const income = transactions.filter(t => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const stats: StatCardProps[] = [
    { label: 'Total Members', value: memberCount, sub: 'in CRM', icon: Users, color: 'bg-[#0D4D7C]/10 text-[#0D4D7C]', href: '/exec/crm' },
    { label: 'Upcoming Events', value: events.length, sub: 'from today', icon: Calendar, color: 'bg-[#3EC8C8]/15 text-[#2AACAC]', href: '/exec/calendar' },
    { label: 'Active Tasks', value: pendingTasks.length, sub: `${tasksDueToday.length} due today`, icon: CheckSquare, color: 'bg-amber-50 text-amber-600', href: '/exec/tasks' },
    { label: 'Unread Alerts', value: notifications.length, sub: 'notifications', icon: Bell, color: 'bg-red-50 text-red-500', href: '/exec/notifications' },
    { label: 'Revenue (YTD)', value: formatCurrency(income), sub: 'total income', icon: TrendingUp, color: 'bg-green-50 text-green-600', href: '/exec/finance' },
    { label: 'Expenses (YTD)', value: formatCurrency(expense), sub: 'total spend', icon: DollarSign, color: 'bg-orange-50 text-orange-600', href: '/exec/finance' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[#7A9BB5] text-sm mb-1">{greeting()},</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#061E30]">
          Welcome, {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-[#3D6480] text-sm mt-1">
          {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#3EC8C8]" />
              <h2 className="font-semibold text-[#061E30] text-sm">Upcoming Events</h2>
            </div>
            <Link to="/exec/calendar" className="text-xs text-[#3EC8C8] hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {events.length === 0 ? (
              <div className="px-5 py-8 text-center text-[#7A9BB5] text-sm">No upcoming events</div>
            ) : (
              events.map(ev => (
                <div key={ev.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="text-center flex-shrink-0 w-10">
                    <div className="text-[10px] font-semibold uppercase text-[#7A9BB5]">
                      {new Date(ev.start_datetime).toLocaleDateString('en', { month: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-[#0D4D7C] leading-none">
                      {new Date(ev.start_datetime).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#061E30] text-sm truncate">{ev.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={10} className="text-[#7A9BB5]" />
                      <span className="text-xs text-[#7A9BB5]">
                        {new Date(ev.start_datetime).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        {ev.location && ` · ${ev.location}`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${EVENT_TYPE_COLORS[ev.event_type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {ev.event_type.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
          {events.length === 0 && (
            <div className="px-5 pb-4 text-center">
              <Link to="/exec/calendar" className="text-sm text-[#3EC8C8] font-medium hover:underline">+ Create Event</Link>
            </div>
          )}
        </motion.div>

        {/* Tasks Due Today */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-amber-500" />
              <h2 className="font-semibold text-[#061E30] text-sm">Tasks Due Today</h2>
            </div>
            <Link to="/exec/tasks" className="text-xs text-[#3EC8C8] hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {tasksDueToday.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <div className="text-2xl mb-1">✓</div>
                <div className="text-sm text-[#7A9BB5]">No tasks due today</div>
              </div>
            ) : (
              tasksDueToday.slice(0, 6).map(task => (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#061E30] leading-snug truncate">{task.title}</div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${PRIORITY_COLORS[task.priority] ?? ''}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-red-400" />
              <h2 className="font-semibold text-[#061E30] text-sm">Recent Notifications</h2>
            </div>
            <Link to="/exec/notifications" className="text-xs text-[#3EC8C8] hover:underline font-medium">All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-5 py-6 text-center text-[#7A9BB5] text-sm">All caught up!</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <AlertCircle size={14} className="text-[#3EC8C8] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#061E30] leading-snug">{n.title}</div>
                    {n.body && <div className="text-xs text-[#7A9BB5] mt-0.5 truncate">{n.body}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Finance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-500" />
              <h2 className="font-semibold text-[#061E30] text-sm">Recent Transactions</h2>
            </div>
            <Link to="/exec/finance" className="text-xs text-[#3EC8C8] hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${tx.transaction_type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <TrendingUp size={12} className={tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-500 rotate-180'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#061E30] truncate">{tx.description ?? tx.category}</div>
                  <div className="text-xs text-[#7A9BB5]">{formatDate(tx.transaction_date)} · {tx.category}</div>
                </div>
                <div className={`text-sm font-semibold flex-shrink-0 ${tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-[#061E30] to-[#0D4D7C] rounded-2xl p-5 text-white"
        >
          <h2 className="font-semibold text-sm mb-4 opacity-80">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add CRM Member', icon: Users, href: '/exec/crm' },
              { label: 'Create Event', icon: Calendar, href: '/exec/calendar' },
              { label: 'New Task', icon: CheckSquare, href: '/exec/tasks' },
              { label: 'Log Member Call', icon: BookOpen, href: '/exec/calls' },
              { label: 'Add Transaction', icon: DollarSign, href: '/exec/finance' },
              { label: 'Schedule Meeting', icon: UserCheck, href: '/exec/meetings' },
            ].map(a => (
              <Link
                key={a.href}
                to={a.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/8 hover:bg-white/14 transition-colors group"
              >
                <a.icon size={14} className="text-[#3EC8C8]" />
                <span className="text-sm">{a.label}</span>
                <ChevronRight size={12} className="ml-auto opacity-40 group-hover:opacity-70 transition-opacity" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
