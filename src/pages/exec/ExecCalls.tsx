import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Clock, Check, AlertCircle, PhoneMissed, PhoneCall } from 'lucide-react';
import { getCrmMembers, getCallLog, addCallLog } from '../../services/exec';
import type { CrmMember } from '../../types';

const OUTCOMES = [
  { value: 'interested', label: 'Interested', icon: Check, color: 'bg-green-100 text-green-700' },
  { value: 'not_interested', label: 'Not Interested', icon: X, color: 'bg-red-100 text-red-700' },
  { value: 'call_again', label: 'Call Again', icon: PhoneCall, color: 'bg-blue-100 text-blue-700' },
  { value: 'voicemail', label: 'Left Voicemail', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'no_answer', label: 'No Answer', icon: PhoneMissed, color: 'bg-gray-100 text-gray-600' },
];

function LogCallModal({ member, onClose, onSave }: {
  member: CrmMember;
  onClose: () => void;
  onSave: () => void;
}) {
  const [outcome, setOutcome] = useState('no_answer');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await addCallLog({ member_id: member.id, call_outcome: outcome, notes, follow_up_date: followUp || undefined });
    onSave();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#061E30]">Log Call — {member.first_name} {member.last_name}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-2 block">Call Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map(o => (
                <button
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${outcome === o.value ? `${o.color} border-transparent` : 'border-gray-200 text-[#3D6480] hover:bg-gray-50'}`}
                >
                  <o.icon size={12} /> {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Notes</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="What was discussed..." />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Follow-up Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={followUp} onChange={e => setFollowUp(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Log Call
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExecCalls() {
  const [members, setMembers] = useState<CrmMember[]>([]);
  const [callLog, setCallLog] = useState<{ id: string; member_id: string; call_outcome: string; notes?: string; follow_up_date?: string; created_at: string; exec_crm_members?: { first_name: string; last_name: string; phone?: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [callMember, setCallMember] = useState<CrmMember | null>(null);
  const [search, setSearch] = useState('');

  async function load() {
    const [m, c] = await Promise.all([getCrmMembers(), getCallLog()]);
    setMembers(m.data);
    setCallLog(c.data as typeof callLog);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filteredMembers = search ? members.filter(m => `${m.first_name} ${m.last_name} ${m.phone}`.toLowerCase().includes(search.toLowerCase())) : members;

  const getLastCall = (memberId: string) => callLog.find(c => c.member_id === memberId);

  const outcomeConfig = (o: string) => OUTCOMES.find(x => x.value === o) ?? OUTCOMES[OUTCOMES.length - 1];

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#061E30]">Member Calls</h1>
        <p className="text-[#7A9BB5] text-sm mt-0.5">Track outreach and follow-ups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members to Call */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9BB5]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#3EC8C8] bg-white" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filteredMembers.map(m => {
                const last = getLastCall(m.id);
                const oc = last ? outcomeConfig(last.call_outcome) : null;
                return (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#0D4D7C]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#0D4D7C]">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#061E30] text-sm">{m.first_name} {m.last_name}</div>
                      <div className="text-xs text-[#7A9BB5] flex items-center gap-2">
                        <Phone size={9} /> {m.phone ?? 'No phone'}
                        {last && oc && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${oc.color}`}>{oc.label}</span>}
                      </div>
                    </div>
                    {last && (
                      <div className="text-[11px] text-[#7A9BB5] flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(last.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    <button
                      onClick={() => setCallMember(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D4D7C] text-white text-xs rounded-xl hover:bg-[#0a3d63] transition-colors"
                    >
                      <Phone size={11} /> Log Call
                    </button>
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <div className="px-5 py-10 text-center text-[#7A9BB5] text-sm">No members found</div>
              )}
            </div>
          </div>
        </div>

        {/* Call Log */}
        <div>
          <h2 className="font-semibold text-[#061E30] text-sm mb-3">Recent Calls</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {callLog.length === 0 ? (
              <div className="p-8 text-center text-[#7A9BB5] text-sm">No calls logged yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {callLog.slice(0, 15).map(c => {
                  const oc = outcomeConfig(c.call_outcome);
                  const m = c.exec_crm_members;
                  return (
                    <div key={c.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#061E30]">{m ? `${m.first_name} ${m.last_name}` : 'Unknown'}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${oc.color}`}>{oc.label}</span>
                      </div>
                      {c.notes && <p className="text-xs text-[#7A9BB5] mb-1 truncate">{c.notes}</p>}
                      <div className="text-[11px] text-[#7A9BB5] flex items-center gap-1">
                        <Clock size={9} /> {new Date(c.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {c.follow_up_date && <span className="ml-2 text-[#3EC8C8]">Follow-up: {c.follow_up_date}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {callMember && (
          <LogCallModal
            member={callMember}
            onClose={() => setCallMember(null)}
            onSave={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
