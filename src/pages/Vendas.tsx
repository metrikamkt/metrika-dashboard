import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePeriod } from '../context/PeriodContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';
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

export default function Vendas() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const { period } = usePeriod();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Omit<Lancamento, 'id'>>(BLANK);

  const filtered = filterLanc(data.lancamentos, period);
  const total = filtered.reduce((s, l) => s + l.valor, 0);
  const ticket = filtered.length > 0 ? total / filtered.length : 0;

  // Leads funnel from CRM data
  const etapas = ['lead','qualificado','proposta','negociacao','fechado'] as const;
  const funnelData = etapas.map(e => ({ etapa: e, qty: data.leads.filter(l => l.etapa === e).length }));
  const maxF = Math.max(...funnelData.map(f => f.qty), 1);

  // Conversion rate per stage
  const taxas = etapas.slice(0, -1).map((_e, i) => {
    const atual = funnelData[i].qty;
    const proximo = funnelData[i + 1].qty;
    return { etapa: `${etapas[i]}→${etapas[i + 1]}`, taxa: atual > 0 ? +(proximo / atual * 100).toFixed(1) : 0 };
  });

  // Monthly revenue chart
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    let m = NOW_MES - offset;
    let a = NOW_ANO;
    if (m <= 0) { m += 12; a -= 1; }
    const v = data.lancamentos.filter(l => l.mes === m && l.ano === a).reduce((s, l) => s + l.valor, 0);
    return { mes: MESES[m - 1], valor: v };
  });

  const handleAdd = () => {
    if (!form.valor || form.valor <= 0) { showToast('Informe um valor válido'); return; }
    const d = new Date(form.data);
    const novo: Lancamento = { ...form, id: `l${Date.now()}`, mes: d.getMonth() + 1, ano: d.getFullYear() };
    dispatch({ type: 'ADD_LANCAMENTO', payload: novo });
    showToast('Venda registrada com sucesso');
    setForm(BLANK);
    setDrawerOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendas</h1>
          <p className="text-gray-500 text-sm">Fechamentos e receita gerada</p>
        </div>
        <button onClick={() => { setForm(BLANK); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium transition-all">
          <Plus size={14} /> Registrar Venda
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Receita no Período', value: fmt(total) },
          { label: 'Vendas Fechadas', value: String(filtered.length) },
          { label: 'Ticket Médio', value: fmt(ticket) },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Monthly revenue */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h3 className="text-white font-semibold mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="mes" stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [fmt(v), 'Receita']} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
              <Bar dataKey="valor" fill="#0087f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h3 className="text-white font-semibold mb-4">Funil CRM (tempo real)</h3>
          <div className="flex flex-col gap-2 mb-4">
            {funnelData.map((f, i) => (
              <div key={f.etapa}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 capitalize">{f.etapa}</span>
                  <span className="text-white font-semibold">{f.qty}</span>
                </div>
                <div className="h-6 bg-bg rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-700"
                    style={{ width: `${(f.qty / maxF) * 100}%`, background: 'linear-gradient(90deg,#0087f0,#01c2f0)', opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Taxa de conversão por etapa</p>
            {taxas.map(t => (
              <div key={t.etapa} className="flex justify-between text-xs py-1">
                <span className="text-gray-500 capitalize">{t.etapa.replace('→',' → ')}</span>
                <span className={`font-medium ${t.taxa >= 50 ? 'text-green-400' : t.taxa >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>{t.taxa}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-white font-semibold">Vendas Registradas</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Nenhuma venda neste período</p>
            <button onClick={() => setDrawerOpen(true)} className="mt-3 text-primary text-sm hover:underline">+ Registrar venda</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Data','Cliente','Produto','NF','Valor',''].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].sort((a, b) => b.data.localeCompare(a.data)).map(l => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-gray-400 text-sm">{new Date(l.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-white text-sm">{l.clienteNome || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{l.produtoNome || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{l.nfNumero || '—'}</td>
                  <td className="px-4 py-3 text-primary font-semibold">{fmt(l.valor)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { dispatch({ type: 'DELETE_LANCAMENTO', payload: l.id }); showToast('Venda excluída'); }}
                      className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Registrar Venda">
        <FormField label="Data do Fechamento" value={form.data} type="date" onChange={v => setForm(f => ({ ...f, data: v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Cliente</label>
          <select value={form.clienteId}
            onChange={e => { const c = data.clientes.find(x => x.id === e.target.value); setForm(f => ({ ...f, clienteId: e.target.value, clienteNome: c?.nome || '' })); }}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">Selecione o cliente</option>
            {data.clientes.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.empresa}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Produto</label>
          <select value={form.produtoId}
            onChange={e => { const p = data.produtos.find(x => x.id === e.target.value); setForm(f => ({ ...f, produtoId: e.target.value, produtoNome: p?.nome || '' })); }}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">Selecione o produto</option>
            {data.produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <FormField label="Valor (R$)" value={form.valor} type="number" onChange={v => setForm(f => ({ ...f, valor: +v }))} />
        <FormField label="Número da NF" value={form.nfNumero} onChange={v => setForm(f => ({ ...f, nfNumero: v }))} />
        <FormField label="Descrição" value={form.descricao} onChange={v => setForm(f => ({ ...f, descricao: v }))} />
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleAdd} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar Venda</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
