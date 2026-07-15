import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock } from 'lucide-react';
import { getTasks, upsertTask, deleteTask } from '../../services/exec';
import type { ExecTask } from '../../types';

const COLUMNS: { id: ExecTask['status']; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-600' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'waiting', label: 'Waiting', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

function TaskCard({ task, onEdit, onDelete, onMove }: {
  task: ExecTask;
  onEdit: (t: ExecTask) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: ExecTask['status']) => void;
}) {
  const pc = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-[#061E30] leading-snug flex-1">{task.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            value={task.status}
            onChange={e => onMove(task.id, e.target.value as ExecTask['status'])}
            className="text-[10px] border-0 bg-transparent text-[#7A9BB5] focus:outline-none cursor-pointer p-0"
            onClick={e => e.stopPropagation()}
          >
            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {task.description && <p className="text-xs text-[#7A9BB5] mb-2 line-clamp-2">{task.description}</p>}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${pc.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
          {pc.label}
        </span>

        {task.due_date && (
          <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isOverdue ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-[#7A9BB5]'}`}>
            <Clock size={9} />
            {new Date(task.due_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {task.progress !== undefined && task.progress > 0 && (
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] text-[#7A9BB5] mb-1">
            <span>Progress</span><span>{task.progress}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#3EC8C8] rounded-full transition-all" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="text-[11px] text-[#3EC8C8] hover:underline">Edit</button>
        <span className="text-gray-300">·</span>
        <button onClick={() => onDelete(task.id)} className="text-[11px] text-red-400 hover:underline">Delete</button>
      </div>
    </div>
  );
}

function TaskFormModal({ task, onClose, onSave }: {
  task: Partial<ExecTask> | null;
  onClose: () => void;
  onSave: (t: Partial<ExecTask>) => void;
}) {
  const [form, setForm] = useState<Partial<ExecTask>>(task ?? {
    title: '', description: '', status: 'todo', priority: 'medium', due_date: null, progress: 0
  });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof ExecTask, v: string | number | null) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#061E30]">{task?.id ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Title *</label>
            <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.title ?? ''} onChange={e => f('title', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Description</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] resize-none" value={form.description ?? ''} onChange={e => f('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Priority</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.priority ?? 'medium'} onChange={e => f('priority', e.target.value)}>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Status</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.status ?? 'todo'} onChange={e => f('status', e.target.value)}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Due Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.due_date ?? ''} onChange={e => f('due_date', e.target.value || null)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Progress ({form.progress ?? 0}%)</label>
              <input type="range" min={0} max={100} step={5} className="w-full mt-1 accent-[#3EC8C8]" value={form.progress ?? 0} onChange={e => f('progress', Number(e.target.value))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button
              onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
              disabled={saving || !form.title}
              className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {task?.id ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExecTasks() {
  const [tasks, setTasks] = useState<ExecTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Partial<ExecTask> | null>(null);

  useEffect(() => {
    getTasks().then(({ data }) => { setTasks(data); setLoading(false); });
  }, []);

  async function handleSave(t: Partial<ExecTask>) {
    const { data } = await upsertTask(t);
    if (data) {
      setTasks(prev => {
        const idx = prev.findIndex(x => x.id === data.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
        return [...prev, data];
      });
    }
    setShowForm(false);
    setEditTask(null);
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function handleMove(id: string, status: ExecTask['status']) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, status };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    await upsertTask(updated);
  }

  const getColumnTasks = (status: ExecTask['status']) =>
    tasks.filter(t => t.status === status).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Task Manager</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{tasks.filter(t => t.status !== 'completed').length} active tasks</p>
        </div>
        <button
          onClick={() => { setEditTask({ status: 'todo' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors"
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="bg-gray-50 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-[#7A9BB5] font-medium">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => { setEditTask({ status: col.id }); setShowForm(true); }}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-[#7A9BB5]"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div className="space-y-2.5">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditTask(t); setShowForm(true); }}
                    onDelete={handleDelete}
                    onMove={handleMove}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-[#7A9BB5]">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <TaskFormModal
            task={editTask}
            onClose={() => { setShowForm(false); setEditTask(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
