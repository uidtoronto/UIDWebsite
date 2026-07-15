import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, X, Download, FileText, Search, Trash2 } from 'lucide-react';
import { getDocuments, upsertDocument, deleteDocument } from '../../services/exec';

const FOLDERS = ['meeting_minutes', 'financial_reports', 'membership_forms', 'event_documents', 'government_letters', 'templates', 'media_kit', 'brand_assets', 'general'];

const FOLDER_ICONS: Record<string, string> = {
  meeting_minutes: '📋',
  financial_reports: '💰',
  membership_forms: '📝',
  event_documents: '📅',
  government_letters: '🏛️',
  templates: '📄',
  media_kit: '🎨',
  brand_assets: '✨',
  general: '📁',
};

export default function ExecDocuments() {
  const [documents, setDocuments] = useState<{ id: string; name: string; folder: string; file_url?: string; file_type?: string; description?: string; tags?: string[]; created_at?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', folder: 'general', description: '', file_url: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await getDocuments();
    setDocuments(data as typeof documents);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = documents.filter(d => {
    if (activeFolder !== 'all' && d.folder !== activeFolder) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleSave() {
    setSaving(true);
    await upsertDocument(form);
    await load();
    setForm({ name: '', folder: 'general', description: '', file_url: '' });
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete document?')) return;
    await deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }

  const folderCounts = FOLDERS.reduce((acc, f) => { acc[f] = documents.filter(d => d.folder === f).length; return acc; }, {} as Record<string, number>);

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Document Center</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{documents.length} documents</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors">
          <Plus size={14} /> Add Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Nav */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 h-fit">
          <button
            onClick={() => setActiveFolder('all')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${activeFolder === 'all' ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480] hover:bg-gray-50'}`}
          >
            <span className="flex items-center gap-2"><Folder size={14} /> All Documents</span>
            <span className="text-xs">{documents.length}</span>
          </button>
          {FOLDERS.map(folder => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-colors ${activeFolder === folder ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480] hover:bg-gray-50'}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">{FOLDER_ICONS[folder]}</span>
                <span className="capitalize">{folder.replace(/_/g, ' ')}</span>
              </span>
              <span className="text-xs">{folderCounts[folder] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Documents */}
        <div className="lg:col-span-3">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9BB5]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#3EC8C8] bg-white" />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <FileText size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-[#7A9BB5] text-sm">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#3EC8C8]/30 hover:shadow-sm transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#0D4D7C]/8 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-[#0D4D7C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#061E30] text-sm truncate">{doc.name}</div>
                      <div className="text-xs text-[#7A9BB5] capitalize mt-0.5">{doc.folder.replace(/_/g, ' ')}</div>
                      {doc.description && <p className="text-xs text-[#3D6480] mt-1 line-clamp-2">{doc.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.file_url && <a href={doc.file_url} download className="flex items-center gap-1 text-xs text-[#3EC8C8] hover:underline"><Download size={11} /> Download</a>}
                    <button onClick={() => handleDelete(doc.id)} className="flex items-center gap-1 text-xs text-red-400 hover:underline ml-auto"><Trash2 size={11} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#061E30]">Add Document</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">Document Name *</label>
                  <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">Folder</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] capitalize" value={form.folder} onChange={e => setForm(f => ({ ...f, folder: e.target.value }))}>
                    {FOLDERS.map(fo => <option key={fo} value={fo} className="capitalize">{fo.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">File URL</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#3D6480] mb-1 block">Description</label>
                  <textarea rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl">Cancel</button>
                  <button onClick={handleSave} disabled={saving || !form.name} className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2">
                    {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Add Document
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
