import { useEffect, useState } from 'react';
import { UserCheck, Users, Download } from 'lucide-react';
import { getEvents, getEventRsvps } from '../../services/exec';
import type { ExecEvent } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  invited: 'bg-gray-100 text-gray-600',
  registered: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-[#0D4D7C]/10 text-[#0D4D7C]',
  checked_in: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-orange-100 text-orange-700',
};

export default function ExecRSVP() {
  const [events, setEvents] = useState<ExecEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ExecEvent | null>(null);
  const [rsvps, setRsvps] = useState<{ id: string; name?: string; email?: string; status: string; checked_in_at?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents(new Date().toISOString().split('T')[0]).then(({ data }) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  async function loadRsvps(event: ExecEvent) {
    setSelectedEvent(event);
    const { data } = await getEventRsvps(event.id);
    setRsvps(data as typeof rsvps);
  }

  const statusCounts = rsvps.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  function exportRsvps() {
    const csv = ['Name,Email,Status', ...rsvps.map(r => `"${r.name ?? ''}","${r.email ?? ''}","${r.status}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${selectedEvent?.title ?? 'rsvp'}-attendees.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#061E30]">RSVP Management</h1>
        <p className="text-[#7A9BB5] text-sm mt-0.5">Track attendance for upcoming events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="font-semibold text-[#061E30] text-sm mb-3">Upcoming Events</h2>
          <div className="space-y-2">
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => loadRsvps(ev)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all ${selectedEvent?.id === ev.id ? 'border-[#3EC8C8] shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="font-medium text-[#061E30] text-sm">{ev.title}</div>
                <div className="text-xs text-[#7A9BB5] mt-1">
                  {new Date(ev.start_datetime).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  {ev.expected_attendance ? ` · Expected: ${ev.expected_attendance}` : ''}
                </div>
              </button>
            ))}
            {events.length === 0 && <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-[#7A9BB5] text-sm">No upcoming events</div>}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedEvent ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#061E30] text-sm">{selectedEvent.title} — Attendees</h2>
                <button onClick={exportRsvps} className="flex items-center gap-1.5 text-xs text-[#3D6480] px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50">
                  <Download size={12} /> Export
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                    <div className="text-lg font-bold text-[#061E30]">{statusCounts[status] ?? 0}</div>
                    <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${color}`}>{status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>

              {rsvps.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <Users size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-[#7A9BB5] text-sm">No RSVPs yet for this event</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Name</th>
                        <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Email</th>
                        <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsvps.map(r => (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-[#061E30]">{r.name ?? '—'}</td>
                          <td className="px-5 py-3 text-[#7A9BB5]">{r.email ?? '—'}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {r.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <UserCheck size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-[#7A9BB5] text-sm">Select an event to view RSVPs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
