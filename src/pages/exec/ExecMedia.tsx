import { Image, Upload, Search, FolderOpen } from 'lucide-react';
import { useState } from 'react';

const MEDIA_FOLDERS = ['Photos', 'Videos', 'Graphics', 'Logos', 'Documents'];

const SAMPLE_MEDIA = [
  { id: '1', name: 'Eid Celebration 2025', type: 'photo', folder: 'Photos', url: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', tags: ['eid', '2025'] },
  { id: '2', name: 'Community Meeting', type: 'photo', folder: 'Photos', url: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', tags: ['meeting'] },
  { id: '3', name: 'UID Toronto Logo', type: 'logo', folder: 'Logos', url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', tags: ['logo', 'brand'] },
  { id: '4', name: 'Ramadan Program', type: 'photo', folder: 'Photos', url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', tags: ['ramadan'] },
  { id: '5', name: 'Youth Summit', type: 'photo', folder: 'Photos', url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', tags: ['youth'] },
  { id: '6', name: 'Brand Guidelines', type: 'doc', folder: 'Documents', url: '', tags: ['brand', 'design'] },
];

export default function ExecMedia() {
  const [activeFolder, setActiveFolder] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_MEDIA.filter(m => {
    if (activeFolder !== 'All' && m.folder !== activeFolder) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Media Library</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{SAMPLE_MEDIA.length} assets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors">
          <Upload size={14} /> Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 h-fit">
          {['All', ...MEDIA_FOLDERS].map(f => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-colors ${activeFolder === f ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480] hover:bg-gray-50'}`}
            >
              <FolderOpen size={14} /> {f}
            </button>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9BB5]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#3EC8C8] bg-white" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#3EC8C8]/30 hover:shadow-sm transition-all group cursor-pointer">
                {item.url ? (
                  <div className="h-36 overflow-hidden">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-36 bg-gray-100 flex items-center justify-center">
                    <Image size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-medium text-[#061E30] truncate">{item.name}</div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {item.tags.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-[#3EC8C8]/10 text-[#2AACAC] rounded-full">{tag}</span>)}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-12 text-center text-[#7A9BB5] text-sm">No media found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
