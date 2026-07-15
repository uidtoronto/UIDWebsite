import { useState } from 'react';
import { Building, Bell, Lock } from 'lucide-react';

const SECTIONS = [
  { id: 'org', label: 'Organisation', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function ExecSettings() {
  const [section, setSection] = useState('org');

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#061E30]">Settings</h1>
        <p className="text-[#7A9BB5] text-sm mt-0.5">Manage organisation and dashboard settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-2 h-fit">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${section === s.id ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480] hover:bg-gray-50'}`}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
          {section === 'org' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#061E30] mb-4">Organisation Settings</h2>
              {[
                { label: 'Organisation Name', value: 'UID Toronto', placeholder: 'UID Toronto' },
                { label: 'Contact Email', value: 'info@uid-toronto.ca', placeholder: '' },
                { label: 'Phone', value: '+1 (416) 555-0100', placeholder: '' },
                { label: 'City', value: 'Toronto', placeholder: '' },
                { label: 'Province', value: 'Ontario', placeholder: '' },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">{field.label}</label>
                  <input defaultValue={field.value} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-[#3D6480] mb-1 block">Timezone</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]">
                  <option>America/Toronto (EST)</option>
                  <option>America/Vancouver (PST)</option>
                </select>
              </div>
              <button className="px-6 py-2.5 bg-[#0D4D7C] text-white text-sm font-medium rounded-xl hover:bg-[#0a3d63] transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {section === 'notifications' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-[#061E30] mb-4">Notification Preferences</h2>
              {[
                { label: 'Upcoming Meetings', sub: 'Notify 24h before scheduled meetings' },
                { label: 'Membership Expiring', sub: 'Alert when membership expires within 30 days' },
                { label: 'Task Due Reminders', sub: 'Daily digest of tasks due today' },
                { label: 'New RSVP', sub: 'When a member registers for an event' },
                { label: 'New Member', sub: 'When a new member joins the organisation' },
                { label: 'Donation Received', sub: 'When a donation is processed' },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <div className="text-sm font-medium text-[#061E30]">{pref.label}</div>
                    <div className="text-xs text-[#7A9BB5]">{pref.sub}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#3EC8C8] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {section === 'security' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-[#061E30] mb-4">Security Settings</h2>
              <div className="bg-[#0D4D7C]/5 border border-[#0D4D7C]/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Lock size={16} className="text-[#0D4D7C]" />
                  <span className="text-sm font-medium text-[#061E30]">Role-Based Access Control</span>
                </div>
                <p className="text-xs text-[#3D6480]">Access to this dashboard is restricted to Executive Board members and Administrators. Role management is handled through Supabase authentication metadata.</p>
              </div>
              <div className="space-y-3">
                {[
                  { role: 'Administrator', desc: 'Full access to all modules', color: 'bg-red-100 text-red-700' },
                  { role: 'Regional President', desc: 'Nearly full access, excluding some admin tools', color: 'bg-orange-100 text-orange-700' },
                  { role: 'Executive Board', desc: 'Access to assigned modules', color: 'bg-blue-100 text-blue-700' },
                  { role: 'Youth Branch', desc: 'Youth-related modules only', color: 'bg-green-100 text-green-700' },
                  { role: "Women's Branch", desc: "Women's branch modules only", color: 'bg-pink-100 text-pink-700' },
                ].map(r => (
                  <div key={r.role} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <div className="text-sm font-medium text-[#061E30]">{r.role}</div>
                      <div className="text-xs text-[#7A9BB5]">{r.desc}</div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.color}`}>{r.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
