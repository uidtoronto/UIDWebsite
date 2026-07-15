import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, AlertCircle, Calendar, User, DollarSign, Clock } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/exec';
import type { ExecNotification } from '../../types';

const TYPE_ICONS: Record<string, React.ElementType> = {
  meeting: Calendar,
  membership: User,
  task: AlertCircle,
  finance: DollarSign,
  info: Bell,
};

export default function ExecNotifications() {
  const [notifications, setNotifications] = useState<ExecNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(({ data }) => { setNotifications(data); setLoading(false); });
  }, []);

  async function handleRead(id: string) {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const unread = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Notifications</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={handleReadAll} className="flex items-center gap-2 text-sm text-[#3EC8C8] hover:underline">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Bell size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-[#7A9BB5]">No notifications</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <AnimatePresence>
            {notifications.map(n => {
              const Icon = TYPE_ICONS[n.notif_type ?? 'info'] ?? Bell;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-start gap-4 px-5 py-4 border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${!n.is_read ? 'bg-[#3EC8C8]/3' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.is_read ? 'bg-[#0D4D7C]/10' : 'bg-gray-100'}`}>
                    <Icon size={15} className={!n.is_read ? 'text-[#0D4D7C]' : 'text-[#7A9BB5]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${!n.is_read ? 'text-[#061E30]' : 'text-[#3D6480]'}`}>{n.title}</div>
                    {n.body && <div className="text-xs text-[#7A9BB5] mt-0.5">{n.body}</div>}
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#7A9BB5]">
                      <Clock size={10} />
                      {new Date(n.created_at!).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => handleRead(n.id)} className="p-1.5 hover:bg-[#3EC8C8]/10 rounded-lg transition-colors flex-shrink-0" title="Mark as read">
                      <Check size={14} className="text-[#3EC8C8]" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
