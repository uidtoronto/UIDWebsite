import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Download, FileText, Clock, MapPin } from 'lucide-react';
import { getMeetings, upsertMeeting, deleteMeeting } from '../../services/exec';
import type { ExecMeeting, ActionItem } from '../../types';

function MeetingFormModal({ meeting, onClose, onSave }: {
  meeting: Partial<ExecMeeting> | null;
  onClose: () => void;
  onSave: (m: Partial<ExecMeeting>) => void;
}) {
  const [form, setForm] = useState<Partial<ExecMeeting>>(meeting ?? {
    title: '', meeting_date: '', meeting_time: '', location: '', zoom_url: '',
    status: 'scheduled', agenda: '', notes: '', minutes: '', action_items: []
  });
  const [saving, setSaving] = useState(false);
  const [newAction, setNewAction] = useState('');
  const f = (k: keyof ExecMeeting, v: string) => setForm(p => ({ ...p, [k]: v }));

  function addAction() {
    if (!newAction.trim()) return;
    const item: ActionItem = { id: crypto.randomUUID(), text: newAction.trim(), done: false };
    setForm(p => ({ ...p, action_items: [...(p.action_items ?? []), item] }));
    setNewAction('');
  }

  function toggleAction(id: string) {
    setForm(p => ({
      ...p,
      action_items: (p.action_items ?? []).map(a => a.id === id ? { ...a, done: !a.done } : a)
    }));
  }

  function removeAction(id: string) {
    setForm(p => ({ ...p, action_items: (p.action_items ?? []).filter(a => a.id !== id) }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-[#061E30]">{meeting?.id ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Meeting Title *</label>
            <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.title ?? ''} onChange={e => f('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Date *</label>
              <input type="date" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.meeting_date ?? ''} onChange={e => f('meeting_date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Time</label>
              <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.meeting_time ?? ''} onChange={e => f('meeting_time', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Location</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.location ?? ''} onChange={e => f('location', e.target.value)} />
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
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Zoom Link</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.zoom_url ?? ''} onChange={e => f('zoom_url', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Agenda</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.agenda ?? ''} onChange={e => f('agenda', e.target.value)} placeholder="Meeting agenda items..." />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Meeting Notes</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.notes ?? ''} onChange={e => f('notes', e.target.value)} placeholder="Notes taken during the meeting..." />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Minutes</label>
            <textarea rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.minutes ?? ''} onChange={e => f('minutes', e.target.value)} placeholder="Official meeting minutes..." />
          </div>

          {/* Action Items */}
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-2 block">Action Items</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                placeholder="Add action item..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAction())}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3EC8C8]"
              />
              <button onClick={addAction} className="px-3 py-2 bg-[#0D4D7C] text-white text-sm rounded-xl hover:bg-[#0a3d63] transition-colors">Add</button>
            </div>
            <div className="space-y-1.5">
              {(form.action_items ?? []).map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl group">
                  <input type="checkbox" checked={item.done} onChange={() => toggleAction(item.id)} className="accent-[#3EC8C8]" />
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-[#7A9BB5]' : 'text-[#061E30]'}`}>{item.text}</span>
                  <button onClick={() => removeAction(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button
              onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
              disabled={saving || !form.title || !form.meeting_date}
              className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {meeting?.id ? 'Save' : 'Schedule'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function exportMinutes(meeting: ExecMeeting) {
  const content = [
    `MEETING MINUTES`,
    `UID Toronto — ${meeting.title}`,
    `Date: ${meeting.meeting_date}${meeting.meeting_time ? ` at ${meeting.meeting_time}` : ''}`,
    `Location: ${meeting.location ?? 'N/A'}`,
    ``,
    `AGENDA`,
    meeting.agenda ?? 'N/A',
    ``,
    `NOTES`,
    meeting.notes ?? 'N/A',
    ``,
    `MINUTES`,
    meeting.minutes ?? 'N/A',
    ``,
    `ACTION ITEMS`,
    ...(meeting.action_items ?? []).map((a, i) => `${i + 1}. [${a.done ? 'x' : ' '}] ${a.text}`),
  ].join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${meeting.title.replace(/\s+/g, '-')}-minutes.txt`; a.click();
  URL.revokeObjectURL(url);
}

export default function ExecMeetings() {
  const [meetings, setMeetings] = useState<ExecMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Partial<ExecMeeting> | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<ExecMeeting | null>(null);

  useEffect(() => {
    getMeetings().then(({ data }) => { setMeetings(data); setLoading(false); });
  }, []);

  async function handleSave(m: Partial<ExecMeeting>) {
    const { data } = await upsertMeeting(m);
    if (data) {
      setMeetings(prev => {
        const idx = prev.findIndex(x => x.id === data.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
        return [data, ...prev];
      });
    }
    setShowForm(false);
    setEditMeeting(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this meeting?')) return;
    await deleteMeeting(id);
    setMeetings(prev => prev.filter(m => m.id !== id));
    if (selectedMeeting?.id === id) setSelectedMeeting(null);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Meeting Manager</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{meetings.length} meetings</p>
        </div>
        <button onClick={() => { setEditMeeting(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors">
          <Plus size={14} /> Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {meetings.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedMeeting(m)}
              className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:border-[#3EC8C8]/30 hover:shadow-sm ${selectedMeeting?.id === m.id ? 'border-[#3EC8C8] shadow-sm' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-[#061E30] text-sm leading-snug flex-1">{m.title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${STATUS_COLORS[m.status ?? 'scheduled']}`}>{m.status}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#7A9BB5]">
                <span className="flex items-center gap-1"><Clock size={10} /> {m.meeting_date}{m.meeting_time ? ` · ${m.meeting_time}` : ''}</span>
                {m.location && <span className="flex items-center gap-1"><MapPin size={10} /> {m.location}</span>}
              </div>
              {(m.action_items ?? []).length > 0 && (
                <div className="mt-2 text-xs text-[#7A9BB5]">
                  {(m.action_items ?? []).filter(a => !a.done).length} open action items
                </div>
              )}
            </motion.div>
          ))}
          {meetings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-[#7A9BB5] text-sm">No meetings scheduled</div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selectedMeeting ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-6">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#061E30]">{selectedMeeting.title}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportMinutes(selectedMeeting)} className="flex items-center gap-1.5 text-xs text-[#3D6480] px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Download size={12} /> Export
                  </button>
                  <button onClick={() => { setEditMeeting(selectedMeeting); setShowForm(true); }} className="flex items-center gap-1.5 text-xs text-[#3EC8C8] px-3 py-1.5 border border-[#3EC8C8]/30 rounded-xl hover:bg-[#3EC8C8]/5 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(selectedMeeting.id)} className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 transition-colors">Delete</button>
                </div>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-[#7A9BB5] text-xs block mb-1">Date & Time</span>{selectedMeeting.meeting_date}{selectedMeeting.meeting_time ? ` at ${selectedMeeting.meeting_time}` : ''}</div>
                  <div><span className="text-[#7A9BB5] text-xs block mb-1">Location</span>{selectedMeeting.location ?? '—'}</div>
                  <div><span className="text-[#7A9BB5] text-xs block mb-1">Status</span><span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedMeeting.status ?? 'scheduled']}`}>{selectedMeeting.status}</span></div>
                  {selectedMeeting.zoom_url && (
                    <div><span className="text-[#7A9BB5] text-xs block mb-1">Zoom</span><a href={selectedMeeting.zoom_url} className="text-[#3EC8C8] text-xs hover:underline">Join Meeting</a></div>
                  )}
                </div>
                {selectedMeeting.agenda && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#3D6480] uppercase tracking-wide mb-2">Agenda</h3>
                    <p className="text-sm text-[#3D6480] bg-gray-50 rounded-xl p-3 whitespace-pre-line">{selectedMeeting.agenda}</p>
                  </div>
                )}
                {selectedMeeting.notes && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#3D6480] uppercase tracking-wide mb-2">Notes</h3>
                    <p className="text-sm text-[#3D6480] bg-gray-50 rounded-xl p-3 whitespace-pre-line">{selectedMeeting.notes}</p>
                  </div>
                )}
                {selectedMeeting.minutes && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#3D6480] uppercase tracking-wide mb-2 flex items-center gap-2"><FileText size={12} /> Minutes</h3>
                    <p className="text-sm text-[#3D6480] bg-blue-50/30 rounded-xl p-3 whitespace-pre-line border border-blue-100">{selectedMeeting.minutes}</p>
                  </div>
                )}
                {(selectedMeeting.action_items ?? []).length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#3D6480] uppercase tracking-wide mb-2">Action Items</h3>
                    <div className="space-y-2">
                      {(selectedMeeting.action_items ?? []).map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#3EC8C8] border-[#3EC8C8]' : 'border-gray-300'}`}>
                            {item.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={item.done ? 'line-through text-[#7A9BB5]' : 'text-[#061E30]'}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <FileText size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-[#7A9BB5] text-sm">Select a meeting to view details</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <MeetingFormModal
            meeting={editMeeting}
            onClose={() => { setShowForm(false); setEditMeeting(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
