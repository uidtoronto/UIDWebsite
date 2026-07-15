import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { getEvents, upsertEvent, deleteEvent } from '../../services/exec';
import type { ExecEvent } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ExecPrograms() {
  const [programs, setPrograms] = useState<ExecEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ExecEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ExecEvent>>({
    title: '', event_type: 'community_event', start_datetime: '',
    location: '', expected_attendance: undefined, actual_attendance: undefined,
    budget: undefined, description: '', status: 'scheduled'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEvents().then(({ data }) => {
      setPrograms(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const { data } = await upsertEvent(form);
    if (data) {
      setPrograms(prev => {
        const idx = prev.findIndex(x => x.id === data.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
        return [data, ...prev];
      });
    }
    setShowForm(false);
    setForm({ title: '', event_type: 'community_event', start_datetime: '', status: 'scheduled' });
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this program?')) return;
    await deleteEvent(id);
    setPrograms(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const f = (k: keyof ExecEvent, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Programs</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{programs.length} programs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors">
          <Plus size={14} /> New Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelected(p)}
            className={`bg-white rounded-2xl border p-5 cursor-pointer hover:border-[#3EC8C8]/30 hover:shadow-sm transition-all ${selected?.id === p.id ? 'border-[#3EC8C8]' : 'border-gray-100'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-[#061E30] text-sm leading-snug flex-1">{p.title}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${STATUS_COLORS[p.status ?? 'scheduled']}`}>{p.status}</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#7A9BB5]">
              <div className="flex items-center gap-2"><Calendar size={10} /> {new Date(p.start_datetime).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              {p.location && <div className="flex items-center gap-2"><MapPin size={10} /> {p.location}</div>}
              {p.expected_attendance && <div className="flex items-center gap-2"><Users size={10} /> Expected: {p.expected_attendance}{p.actual_attendance ? ` · Actual: ${p.actual_attendance}` : ''}</div>}
              {p.budget && <div className="flex items-center gap-2"><DollarSign size={10} /> Budget: ${p.budget.toLocaleString()}</div>}
            </div>
            {p.description && <p className="text-xs text-[#3D6480] mt-2 line-clamp-2">{p.description}</p>}
            <div className="mt-3 flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} className="text-xs text-red-400 hover:underline">Delete</button>
            </div>
          </motion.div>
        ))}
        {programs.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-12 text-center text-[#7A9BB5] text-sm">No programs yet</div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                <h2 className="font-semibold text-[#061E30]">New Program</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">Program Name *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.title ?? ''} onChange={e => f('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#3D6480] mb-1 block">Date *</label>
                    <input type="datetime-local" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.start_datetime?.slice(0, 16) ?? ''} onChange={e => f('start_datetime', e.target.value + ':00Z')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3D6480] mb-1 block">Status</label>
                    <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.status ?? 'scheduled'} onChange={e => f('status', e.target.value)}>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3D6480] mb-1 block">Location</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.location ?? ''} onChange={e => f('location', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3D6480] mb-1 block">Budget (CAD)</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.budget ?? ''} onChange={e => f('budget', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3D6480] mb-1 block">Expected Attendance</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.expected_attendance ?? ''} onChange={e => f('expected_attendance', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3D6480] mb-1 block">Actual Attendance</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.actual_attendance ?? ''} onChange={e => f('actual_attendance', Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">Description</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.description ?? ''} onChange={e => f('description', e.target.value)} />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl">Cancel</button>
                  <button onClick={handleSave} disabled={saving || !form.title || !form.start_datetime} className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2">
                    {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Create Program
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
