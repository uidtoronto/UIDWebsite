import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Link as LinkIcon, Users } from 'lucide-react';
import { getEvents, upsertEvent, deleteEvent } from '../../services/exec';
import type { ExecEvent } from '../../types';

const EVENT_TYPES = [
  { value: 'executive_meeting', label: 'Executive Meeting', color: '#0D4D7C' },
  { value: 'youth_meeting', label: 'Youth Meeting', color: '#0ea5e9' },
  { value: 'womens_branch', label: "Women's Branch", color: '#ec4899' },
  { value: 'community_event', label: 'Community Event', color: '#22c55e' },
  { value: 'ramadan_program', label: 'Ramadan Program', color: '#8b5cf6' },
  { value: 'eid_program', label: 'Eid Program', color: '#f97316' },
  { value: 'conference', label: 'Conference', color: '#06b6d4' },
  { value: 'visit', label: 'Visit', color: '#84cc16' },
  { value: 'campaign', label: 'Campaign', color: '#f59e0b' },
  { value: 'fundraiser', label: 'Fundraiser', color: '#ef4444' },
];

function getEventColor(type: string) {
  return EVENT_TYPES.find(t => t.value === type)?.color ?? '#3EC8C8';
}

function EventFormModal({ event, onClose, onSave }: {
  event: Partial<ExecEvent> | null;
  onClose: () => void;
  onSave: (e: Partial<ExecEvent>) => void;
}) {
  const [form, setForm] = useState<Partial<ExecEvent>>(event ?? {
    title: '', event_type: 'executive_meeting', start_datetime: '',
    end_datetime: '', location: '', zoom_url: '', description: '',
    expected_attendance: undefined, status: 'scheduled'
  });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof ExecEvent, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-[#061E30]">{event?.id ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Event Title *</label>
            <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.title ?? ''} onChange={e => f('title', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Event Type</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.event_type ?? 'executive_meeting'} onChange={e => f('event_type', e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Start *</label>
              <input type="datetime-local" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.start_datetime?.slice(0, 16) ?? ''} onChange={e => f('start_datetime', e.target.value + ':00Z')} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">End</label>
              <input type="datetime-local" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.end_datetime?.slice(0, 16) ?? ''} onChange={e => f('end_datetime', e.target.value + ':00Z')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Location</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.location ?? ''} onChange={e => f('location', e.target.value)} placeholder="Address or venue" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Zoom Link</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.zoom_url ?? ''} onChange={e => f('zoom_url', e.target.value)} placeholder="https://zoom.us/j/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Expected Attendance</label>
              <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.expected_attendance ?? ''} onChange={e => f('expected_attendance', Number(e.target.value))} />
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
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Description</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.description ?? ''} onChange={e => f('description', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button
              onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
              disabled={saving || !form.title || !form.start_datetime}
              className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {event?.id ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ExecCalendar() {
  const [events, setEvents] = useState<ExecEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<Partial<ExecEvent> | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ExecEvent | null>(null);
  const [view, setView] = useState<'month' | 'list'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  async function load() {
    setLoading(true);
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month + 2, 0).toISOString();
    const { data } = await getEvents(from, to);
    setEvents(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [year, month]);

  async function handleSave(ev: Partial<ExecEvent>) {
    const { data } = await upsertEvent(ev);
    if (data) {
      setEvents(prev => {
        const idx = prev.findIndex(e => e.id === data.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
        return [...prev, data];
      });
    }
    setShowForm(false);
    setEditEvent(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    await deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const eventsForDay = (day: number) =>
    events.filter(ev => {
      const d = new Date(ev.start_datetime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const upcomingEvents = events
    .filter(ev => new Date(ev.start_datetime) >= today)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Calendar</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{events.length} events this period</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['month', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${view === v ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480] hover:bg-gray-50'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => { setEditEvent(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors">
            <Plus size={14} /> Create
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {EVENT_TYPES.slice(0, 6).map(t => (
          <div key={t.value} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
            <span className="text-xs text-[#7A9BB5]">{t.label}</span>
          </div>
        ))}
      </div>

      {view === 'month' ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-[#061E30]">{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-[#7A9BB5] uppercase tracking-wide">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[88px] border-b border-r border-gray-50 bg-gray-50/30" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const dayEvents = eventsForDay(day);
                return (
                  <div key={day} className={`min-h-[88px] border-b border-r border-gray-50 p-1.5 ${isToday ? 'bg-[#3EC8C8]/5' : 'hover:bg-gray-50/50'} transition-colors`}>
                    <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480]'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className="w-full text-left text-[10px] px-1.5 py-0.5 rounded font-medium truncate text-white"
                          style={{ background: getEventColor(ev.event_type) }}
                        >
                          {ev.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-[#7A9BB5] px-1">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#061E30] text-sm">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#7A9BB5] text-sm">No upcoming events</div>
            ) : upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => setSelectedEvent(ev)}>
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: getEventColor(ev.event_type) }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#061E30]">{ev.title}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-[#7A9BB5] flex items-center gap-1">
                      <Clock size={10} /> {new Date(ev.start_datetime).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(ev.start_datetime).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {ev.location && <span className="text-xs text-[#7A9BB5] flex items-center gap-1"><MapPin size={10} /> {ev.location}</span>}
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: getEventColor(ev.event_type) }}>
                  {EVENT_TYPES.find(t => t.value === ev.event_type)?.label ?? ev.event_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="h-1.5 rounded-t-2xl" style={{ background: getEventColor(selectedEvent.event_type) }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-[#061E30] text-lg">{selectedEvent.title}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: getEventColor(selectedEvent.event_type) }}>
                      {EVENT_TYPES.find(t => t.value === selectedEvent.event_type)?.label}
                    </span>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#3D6480]">
                    <Clock size={14} className="text-[#7A9BB5]" />
                    {new Date(selectedEvent.start_datetime).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(selectedEvent.start_datetime).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-sm text-[#3D6480]"><MapPin size={14} className="text-[#7A9BB5]" /> {selectedEvent.location}</div>
                  )}
                  {selectedEvent.zoom_url && (
                    <div className="flex items-center gap-3 text-sm text-[#3EC8C8]"><LinkIcon size={14} /> <a href={selectedEvent.zoom_url} target="_blank" rel="noreferrer" className="hover:underline">Join Zoom Meeting</a></div>
                  )}
                  {selectedEvent.expected_attendance && (
                    <div className="flex items-center gap-3 text-sm text-[#3D6480]"><Users size={14} className="text-[#7A9BB5]" /> Expected: {selectedEvent.expected_attendance}</div>
                  )}
                  {selectedEvent.description && (
                    <p className="text-sm text-[#3D6480] bg-gray-50 rounded-xl p-3">{selectedEvent.description}</p>
                  )}
                </div>
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <button onClick={() => handleDelete(selectedEvent.id)} className="text-sm text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  <button onClick={() => { setEditEvent(selectedEvent); setShowForm(true); setSelectedEvent(null); }} className="flex items-center gap-2 px-4 py-2 bg-[#0D4D7C] text-white text-sm rounded-xl hover:bg-[#0a3d63] transition-colors">
                    Edit Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showForm && (
          <EventFormModal
            event={editEvent}
            onClose={() => { setShowForm(false); setEditEvent(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
