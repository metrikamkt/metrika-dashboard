import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePeriod } from '../context/PeriodContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { SaveCancelButtons } from '../components/ui/SaveCancelButtons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, Upload, Target, TrendingUp } from 'lucide-react';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import type { Lancamento } from '../data/mockData';

const NOW_MES = 5;
const NOW_ANO = 2026;
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function fmt(n: number) {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

function filterLanc(items: Lancamento[], period: string) {
  if (period === 'mes') return items.filter(i => i.mes === NOW_MES && i.ano === NOW_ANO);
  if (period === 'trimestre') return items.filter(i => i.ano === NOW_ANO && i.mes >= NOW_MES - 2 && i.mes <= NOW_MES);
  return items.filter(i => i.ano === NOW_ANO);
}

const BLANK: Omit<Lancamento, 'id'> = {
  data: new Date().toISOString().slice(0, 10),
  clienteId: '', clienteNome: '', produtoId: '', produtoNome: '',
  valor: 0, nfNumero: '', descricao: '', mes: NOW_MES, ano: NOW_ANO,
};

export default function Faturamento() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const { period } = usePeriod();

  const [drawerMode, setDrawerMode] = useState<'lancamento' | 'metas' | null>(null);
  const [form, setForm] = useState<Omit<Lancamento, 'id'>>(BLANK);
  const [metaEdit, setMetaEdit] = useState(data.metaFaturamento);

  const filtered = filterLanc(data.lancamentos, period);
  const total = filtered.reduce((s, l) => s + l.valor, 0);
  const meta = data.metaFaturamento;
  const atingimento = meta > 0 ? (total / meta) * 100 : 0;

  const evolucao = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    let m = NOW_MES - offset;
    let a = NOW_ANO;
    if (m <= 0) { m += 12; a -= 1; }
    const v = data.lancamentos.filter(l => l.mes === m && l.ano === a).reduce((s, l) => s + l.valor, 0);
    return { mes: MESES[m - 1], valor: v };
  });

  const porProduto = data.produtos.map(p => ({
    nome: p.nome.split(' ')[0],
    valor: filtered.filter(l => l.produtoId === p.id).reduce((s, l) => s + l.valor, 0),
  })).filter(p => p.valor > 0);

  const handleAddLancamento = () => {
    if (!form.valor || form.valor <= 0) { showToast('Informe um valor válido'); return; }
    const d = new Date(form.data);
    const novo: Lancamento = { ...form, id: `l${Date.now()}`, mes: d.getMonth() + 1, ano: d.getFullYear() };
    dispatch({ type: 'ADD_LANCAMENTO', payload: novo });
    showToast('Lançamento adicionado com sucesso');
    setForm(BLANK);
    setDrawerMode(null);
  };

  const handleSaveMeta = () => {
    dispatch({ type: 'SET_META_FATURAMENTO', payload: metaEdit });
    showToast('Meta atualizada');
    setDrawerMode(null);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Faturamento</h1>
            <p className="text-gray-500 text-sm mt-0.5">Lançamentos e receita do período</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => { setMetaEdit(data.metaFaturamento); setDrawerMode('metas'); }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-input text-gray-300 text-sm hover:border-primary/40 transition-all">
              <Target size={14} /> Metas
            </button>
            <button onClick={() => { setForm(BLANK); setDrawerMode('lancamento'); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium transition-all">
              <Plus size={14} /> <span className="hidden sm:inline">Novo </span>Lançamento
            </button>
          </div>
        </div>
        <PeriodSelector />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-card p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Faturamento Total</p>
          <p className="text-3xl font-bold text-white mt-2">{fmt(total)}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Atingimento</span><span>{atingimento.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(atingimento, 100)}%`, background: 'linear-gradient(90deg,#0087f0,#01c2f0)' }} />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-card p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Meta do Período</p>
          <p className="text-3xl font-bold text-white mt-2">{fmt(meta)}</p>
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> Faltam {fmt(Math.max(0, meta - total))}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-card p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Lançamentos</p>
          <p className="text-3xl font-bold text-white mt-2">{filtered.length}</p>
          <p className="text-xs text-gray-600 mt-2">no período selecionado</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-card p-5">
          <h3 className="text-white font-semibold mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="mes" stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
              <Tooltip formatter={(v) => [fmt(v as number), 'Receita']} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
              <Line type="monotone" dataKey="valor" stroke="#0087f0" strokeWidth={2} dot={{ fill: '#0087f0', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-surface border border-border rounded-card p-5">
          <h3 className="text-white font-semibold mb-4">Por Linha de Serviço</h3>
          {porProduto.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-16">Nenhum lançamento no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porProduto} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" width={90} stroke="#444" tick={{ fill: '#aaa', fontSize: 11 }} />
                <Tooltip formatter={(v) => [fmt(v as number), 'Valor']} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {porProduto.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#0087f0' : '#01c2f0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-white font-semibold">Lançamentos</h3>
          <span className="text-xs text-gray-500">{filtered.length} registros</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Upload size={32} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">Nenhum lançamento neste período</p>
            <button onClick={() => setDrawerMode('lancamento')} className="mt-3 text-primary text-sm hover:underline">
              + Adicionar lançamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  {['Data','Cliente','Produto','NF','Descrição','Valor',''].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a, b) => b.data.localeCompare(a.data)).map(l => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{new Date(l.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-white text-sm">{l.clienteNome || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{l.produtoNome || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.nfNumero || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-[160px] truncate">{l.descricao || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{fmt(l.valor)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { dispatch({ type: 'DELETE_LANCAMENTO', payload: l.id }); showToast('Lançamento excluído'); }}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bg/50">
                  <td colSpan={5} className="px-4 py-3 text-gray-400 text-sm font-medium">Total</td>
                  <td className="px-4 py-3 text-white font-bold">{fmt(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Drawer: New lancamento */}
      <Drawer open={drawerMode === 'lancamento'} onClose={() => setDrawerMode(null)} title="Novo Lançamento">
        <FormField label="Data" value={form.data} type="date" onChange={v => setForm(f => ({ ...f, data: v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Cliente</label>
          <select value={form.clienteId}
            onChange={e => { const c = data.clientes.find(x => x.id === e.target.value); setForm(f => ({ ...f, clienteId: e.target.value, clienteNome: c?.nome || '' })); }}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">Selecione um cliente</option>
            {data.clientes.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.empresa}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Produto / Serviço</label>
          <select value={form.produtoId}
            onChange={e => { const p = data.produtos.find(x => x.id === e.target.value); setForm(f => ({ ...f, produtoId: e.target.value, produtoNome: p?.nome || '' })); }}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">Selecione um produto</option>
            {data.produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <FormField label="Valor (R$)" value={form.valor} type="number" onChange={v => setForm(f => ({ ...f, valor: +v }))} />
        <FormField label="Número da NF" value={form.nfNumero} onChange={v => setForm(f => ({ ...f, nfNumero: v }))} />
        <FormField label="Descrição" value={form.descricao} onChange={v => setForm(f => ({ ...f, descricao: v }))} />
        <div className="mb-4 p-3 bg-bg border border-dashed border-border rounded-input">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-2"><Upload size={12} /> Anexar NF (PDF/XML/Imagem)</p>
          <input type="file" accept=".pdf,.xml,.png,.jpg" className="text-xs text-gray-400 w-full" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleAddLancamento} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar Lançamento</button>
          <button onClick={() => setDrawerMode(null)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>

      {/* Drawer: Metas */}
      <Drawer open={drawerMode === 'metas'} onClose={() => setDrawerMode(null)} title="Meta de Faturamento">
        <FormField label="Meta Mensal de Receita (R$)" value={metaEdit} type="number" onChange={v => setMetaEdit(+v)} />
        <SaveCancelButtons onSave={handleSaveMeta} onCancel={() => setDrawerMode(null)} />
      </Drawer>
    </div>
  );
}
