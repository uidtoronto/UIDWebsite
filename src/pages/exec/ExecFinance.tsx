import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getTransactions, upsertTransaction, deleteTransaction } from '../../services/exec';
import type { FinanceTransaction } from '../../types';

const CATEGORIES = ['membership', 'donation', 'program', 'fundraiser', 'event', 'operations', 'marketing', 'technology', 'travel', 'other'];

const PIE_COLORS = ['#0D4D7C', '#3EC8C8', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

function formatCAD(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
}

function TxFormModal({ tx, onClose, onSave }: {
  tx: Partial<FinanceTransaction> | null;
  onClose: () => void;
  onSave: (t: Partial<FinanceTransaction>) => void;
}) {
  const [form, setForm] = useState<Partial<FinanceTransaction>>(tx ?? {
    transaction_type: 'income', category: 'membership', amount: 0,
    description: '', transaction_date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof FinanceTransaction, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#061E30]">{tx?.id ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => f('transaction_type', t)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${form.transaction_type === t ? (t === 'income' ? 'bg-green-600 text-white border-green-600' : 'bg-red-500 text-white border-red-500') : 'border-gray-200 text-[#3D6480] hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Amount (CAD)</label>
            <input type="number" min={0} step={0.01} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.amount ?? ''} onChange={e => f('amount', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Category</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] capitalize" value={form.category ?? 'membership'} onChange={e => f('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Description</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.description ?? ''} onChange={e => f('description', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.transaction_date ?? ''} onChange={e => f('transaction_date', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button
              onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
              disabled={saving || !form.amount}
              className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {tx?.id ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function buildMonthlyData(txs: FinanceTransaction[]) {
  const months: Record<string, { month: string; income: number; expense: number }> = {};
  txs.forEach(tx => {
    const d = new Date(tx.transaction_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
    if (!months[key]) months[key] = { month: label, income: 0, expense: 0 };
    if (tx.transaction_type === 'income') months[key].income += Number(tx.amount);
    else months[key].expense += Number(tx.amount);
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
}

function buildCategoryData(txs: FinanceTransaction[], type: string) {
  const cats: Record<string, number> = {};
  txs.filter(t => t.transaction_type === type).forEach(t => {
    cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount);
  });
  return Object.entries(cats).map(([name, value]) => ({ name, value }));
}

export default function ExecFinance() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Partial<FinanceTransaction> | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    getTransactions().then(({ data }) => { setTransactions(data); setLoading(false); });
  }, []);

  async function handleSave(t: Partial<FinanceTransaction>) {
    const { data } = await upsertTransaction(t);
    if (data) {
      setTransactions(prev => {
        const idx = prev.findIndex(x => x.id === data.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
        return [data, ...prev];
      });
    }
    setShowForm(false); setEditTx(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  const income = transactions.filter(t => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const net = income - expense;

  const filtered = typeFilter === 'all' ? transactions : transactions.filter(t => t.transaction_type === typeFilter);
  const monthlyData = buildMonthlyData(transactions);
  const incomeByCategory = buildCategoryData(transactions, 'income');

  function exportCSV() {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = filtered.map(t => [t.transaction_date, t.transaction_type, t.category, t.amount, t.description ?? '']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'uid-transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Finance Overview</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{transactions.length} transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 text-sm text-[#3D6480] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"><Download size={14} /> Export</button>
          <button onClick={() => { setEditTx(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors"><Plus size={14} /> Add Transaction</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: income, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Total Expenses', value: expense, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Net Balance', value: net, icon: DollarSign, color: net >= 0 ? 'text-[#0D4D7C]' : 'text-red-600', bg: net >= 0 ? 'bg-[#0D4D7C]/8' : 'bg-red-50', border: net >= 0 ? 'border-[#0D4D7C]/10' : 'border-red-100' },
        ].map(card => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-2xl border ${card.border} p-5`}>
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{formatCAD(card.value)}</div>
            <div className="text-xs text-[#7A9BB5] mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#061E30] text-sm mb-4">Monthly Income vs Expenses</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A9BB5' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A9BB5' }} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatCAD(Number(v))} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#7A9BB5] text-sm">No data yet</div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#061E30] text-sm mb-4">Income by Category</h2>
          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={incomeByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {incomeByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCAD(Number(v))} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#7A9BB5] text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#061E30] text-sm">Transactions</h2>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${typeFilter === t ? 'bg-[#0D4D7C] text-white' : 'text-[#3D6480] hover:bg-gray-50'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Description</th>
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Type</th>
                <th className="text-right px-5 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Amount</th>
                <th className="w-16 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-[#7A9BB5] text-xs">{tx.transaction_date}</td>
                  <td className="px-5 py-3 text-[#061E30]">{tx.description ?? '—'}</td>
                  <td className="px-5 py-3 text-[#3D6480] capitalize">{tx.category}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${tx.transaction_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold ${tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.transaction_type === 'income' ? '+' : '-'}{formatCAD(Number(tx.amount))}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditTx(tx); setShowForm(true); }} className="p-1 hover:bg-gray-100 rounded-lg text-[#3D6480] transition-colors text-xs">Edit</button>
                      <button onClick={() => handleDelete(tx.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-400 transition-colors text-xs">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#7A9BB5] text-sm">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <TxFormModal
            tx={editTx}
            onClose={() => { setShowForm(false); setEditTx(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
