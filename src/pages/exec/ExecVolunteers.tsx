import { Heart, Users, Clock, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getVolunteers } from '../../services/exec';

export default function ExecVolunteers() {
  const [volunteers, setVolunteers] = useState<{ id: string; hours_volunteered?: number; skills?: string[]; is_active?: boolean; notes?: string; exec_crm_members?: { first_name: string; last_name: string; email?: string; phone?: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVolunteers().then(({ data }) => { setVolunteers(data as typeof volunteers); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  const totalHours = volunteers.reduce((s, v) => s + Number(v.hours_volunteered ?? 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#061E30]">Volunteer Management</h1>
        <p className="text-[#7A9BB5] text-sm mt-0.5">{volunteers.length} volunteers · {totalHours} hours total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Volunteers', value: volunteers.length, icon: Users, color: 'text-[#0D4D7C]' },
          { label: 'Total Hours', value: totalHours, icon: Clock, color: 'text-[#3EC8C8]' },
          { label: 'Active', value: volunteers.filter(v => v.is_active).length, icon: Star, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#7A9BB5]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {volunteers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-[#7A9BB5] text-sm">No volunteers tracked yet.</p>
          <p className="text-xs text-[#7A9BB5] mt-1">Add volunteers through the CRM by linking members to volunteer records.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Volunteer</th>
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Skills</th>
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Hours</th>
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#061E30]">{v.exec_crm_members ? `${v.exec_crm_members.first_name} ${v.exec_crm_members.last_name}` : '—'}</div>
                    <div className="text-xs text-[#7A9BB5]">{v.exec_crm_members?.email ?? ''}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(v.skills ?? []).map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-[#3EC8C8]/10 text-[#2AACAC] rounded-full">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#3D6480]">{v.hours_volunteered ?? 0}h</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
