import { useState } from 'react';
import { MessageSquare, Send, Hash, Pin, Megaphone } from 'lucide-react';

const MOCK_CHANNELS = [
  { id: '1', name: 'General', type: 'group', unread: 3 },
  { id: '2', name: 'Executive Board', type: 'group', unread: 0 },
  { id: '3', name: 'Finance Team', type: 'group', unread: 1 },
  { id: '4', name: 'Announcements', type: 'announcement', unread: 2 },
];

const MOCK_MESSAGES: Record<string, { id: string; sender: string; content: string; time: string; pinned?: boolean }[]> = {
  '1': [
    { id: 'm1', sender: 'Ahmed Y.', content: 'The next community meeting is scheduled for next Saturday at 2 PM. Please confirm attendance.', time: '10:32 AM' },
    { id: 'm2', sender: 'Fatima O.', content: "I'll be there. Should I prepare the presentation slides?", time: '10:45 AM', pinned: true },
    { id: 'm3', sender: 'Ahmed Y.', content: "Yes please! Also bring the Q2 report.", time: '10:47 AM' },
  ],
  '2': [
    { id: 'm4', sender: 'President', content: 'Important: Board meeting agenda has been updated. Please review before Thursday.', time: 'Yesterday', pinned: true },
    { id: 'm5', sender: 'Secretary', content: 'Minutes from last meeting have been uploaded to Documents.', time: '9:15 AM' },
  ],
  '3': [
    { id: 'm6', sender: 'Treasurer', content: 'Q2 financial report is ready for review.', time: '8:00 AM' },
  ],
  '4': [
    { id: 'm7', sender: 'Admin', content: '📢 Eid al-Adha celebration registration is now open! Register at the membership portal.', time: 'Yesterday', pinned: true },
    { id: 'm8', sender: 'Admin', content: '🎉 Welcome our newest executive board member, Ibrahim Arslan!', time: '2 days ago' },
  ],
};

export default function ExecMessages() {
  const [activeChannel, setActiveChannel] = useState('1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const channelMessages = messages[activeChannel] ?? [];

  function sendMessage() {
    if (!message.trim()) return;
    const newMsg = { id: `m${Date.now()}`, sender: 'You', content: message.trim(), time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] ?? []), newMsg] }));
    setMessage('');
  }

  const activeChannelData = MOCK_CHANNELS.find(c => c.id === activeChannel);
  const pinnedMessages = channelMessages.filter(m => m.pinned);

  return (
    <div className="h-[calc(100vh-56px)] flex bg-[#F0F4F8]">
      {/* Sidebar */}
      <div className="w-56 bg-[#061E30] flex-shrink-0 flex flex-col">
        <div className="px-4 py-4 border-b border-white/10">
          <h2 className="text-white text-sm font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">Channels</div>
          {MOCK_CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-0.5 transition-colors ${activeChannel === ch.id ? 'bg-[#3EC8C8]/20 text-[#3EC8C8]' : 'text-white/60 hover:text-white hover:bg-white/8'}`}
            >
              {ch.type === 'announcement' ? <Megaphone size={13} /> : <Hash size={13} />}
              <span className="flex-1 text-left truncate">{ch.name}</span>
              {ch.unread > 0 && <span className="w-4 h-4 bg-[#3EC8C8] rounded-full text-[10px] text-white font-bold flex items-center justify-center">{ch.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash size={15} className="text-[#7A9BB5]" />
            <span className="font-semibold text-[#061E30] text-sm">{activeChannelData?.name}</span>
          </div>
          {pinnedMessages.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#7A9BB5]">
              <Pin size={11} /> {pinnedMessages.length} pinned
            </div>
          )}
        </div>

        {/* Pinned */}
        {pinnedMessages.length > 0 && (
          <div className="bg-[#3EC8C8]/5 border-b border-[#3EC8C8]/10 px-5 py-2.5">
            <div className="flex items-center gap-2 text-xs text-[#2AACAC]">
              <Pin size={10} />
              <span className="font-medium">Pinned:</span>
              <span className="text-[#3D6480] truncate">{pinnedMessages[0].content}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {channelMessages.map(msg => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0D4D7C]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#0D4D7C]">
                {msg.sender[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#061E30]">{msg.sender}</span>
                  <span className="text-xs text-[#7A9BB5]">{msg.time}</span>
                  {msg.pinned && <Pin size={10} className="text-[#3EC8C8]" />}
                </div>
                <p className="text-sm text-[#3D6480] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {channelMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[#7A9BB5] text-sm gap-2">
              <MessageSquare size={32} className="text-gray-200" />
              <span>No messages yet</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={`Message #${activeChannelData?.name ?? '...'}`}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="p-2.5 bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
