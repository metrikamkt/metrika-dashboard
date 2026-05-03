import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePeriod } from '../context/PeriodContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';
import type { Custo } from '../data/mockData';

const NOW_MES = 5;
const NOW_ANO = 2026;
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function fmt(n: number) {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

function filterCustos(items: Custo[], period: string) {
  if (period === 'mes') return items.filter(i => i.mes === NOW_MES && i.ano === NOW_ANO);
  if (period === 'trimestre') return items.filter(i => i.ano === NOW_ANO && i.mes >= NOW_MES - 2 && i.mes <= NOW_MES);
  return items.filter(i => i.ano === NOW_ANO);
}
function filterLanc(items: { mes: number; ano: number; valor: number }[], period: string) {
  if (period === 'mes') return items.filter(i => i.mes === NOW_MES && i.ano === NOW_ANO);
  if (period === 'trimestre') return items.filter(i => i.ano === NOW_ANO && i.mes >= NOW_MES - 2 && i.mes <= NOW_MES);
  return items.filter(i => i.ano === NOW_ANO);
}

const BLANK: Omit<Custo, 'id'> = {
  descricao: '', valor: 0, tipo: 'fixo', categoria: '', data: new Date().toISOString().slice(0, 10), mes: NOW_MES, ano: NOW_ANO,
};

export default function Financeiro() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const { period } = usePeriod();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Omit<Custo, 'id'>>(BLANK);

  const custosFiltrados = filterCustos(data.custos, period);
  const lancFiltrados = filterLanc(data.lancamentos, period);

  const fixos = custosFiltrados.filter(c => c.tipo === 'fixo');
  const variaveis = custosFiltrados.filter(c => c.tipo === 'variavel');
  const totalFixo = fixos.reduce((s, c) => s + c.valor, 0);
  const totalVariavel = variaveis.reduce((s, c) => s + c.valor, 0);
  const totalCustos = totalFixo + totalVariavel;
  const totalReceita = lancFiltrados.reduce((s, l) => s + l.valor, 0);
  const lucro = totalReceita - totalCustos;
  const margem = totalReceita > 0 ? (lucro / totalReceita * 100) : 0;

  // Monthly chart data – last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    let m = NOW_MES - offset;
    let a = NOW_ANO;
    if (m <= 0) { m += 12; a -= 1; }
    const rec = data.lancamentos.filter(l => l.mes === m && l.ano === a).reduce((s, l) => s + l.valor, 0);
    const cst = data.custos.filter(c => c.mes === m && c.ano === a).reduce((s, c) => s + c.valor, 0);
    return { mes: MESES[m - 1], receita: rec, custos: cst };
  });

  const handleAdd = () => {
    if (!form.descricao || form.valor <= 0) { showToast('Preencha descrição e valor'); return; }
    const d = new Date(form.data);
    const novo: Custo = { ...form, id: `cu${Date.now()}`, mes: d.getMonth() + 1, ano: d.getFullYear() };
    dispatch({ type: 'ADD_CUSTO', payload: novo });
    showToast('Custo adicionado');
    setForm(BLANK);
    setDrawerOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-gray-500 text-sm">DRE e controle de custos</p>
        </div>
        <button onClick={() => { setForm(BLANK); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium transition-all">
          <Plus size={14} /> Registrar Custo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Receita', value: fmt(totalReceita), color: 'text-cyan' },
          { label: 'Total de Custos', value: fmt(totalCustos), color: 'text-orange-400' },
          { label: 'Resultado', value: fmt(lucro), color: lucro >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Margem Bruta', value: `${margem.toFixed(1)}%`, color: margem >= 30 ? 'text-green-400' : 'text-yellow-400' },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
            <p className={`text-2xl font-bold mt-2 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border rounded-card p-5 mb-6">
        <h3 className="text-white font-semibold mb-4">Receita vs Custos — Evolução Mensal</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="mes" stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} stroke="#444" tick={{ fill: '#777', fontSize: 10 }} />
            <Tooltip formatter={(v) => [fmt(v as number)]} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#888' }} />
            <Bar dataKey="receita" name="Receita" fill="#0087f0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="custos" name="Custos" fill="#01c2f0" radius={[4, 4, 0, 0]} opacity={0.65} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost tables */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fixed */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-white font-semibold">Custos Fixos</h3>
            <span className="text-primary font-semibold text-sm">{fmt(totalFixo)}</span>
          </div>
          {fixos.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-8">Nenhum custo fixo no período</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Descrição','Categoria','Valor',''].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fixos.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-white text-sm">{c.descricao}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{c.categoria}</td>
                    <td className="px-4 py-2.5 text-primary font-medium text-sm whitespace-nowrap">{fmt(c.valor)}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { dispatch({ type: 'DELETE_CUSTO', payload: c.id }); showToast('Custo excluído'); }}
                        className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Variable */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-white font-semibold">Custos Variáveis</h3>
            <span className="text-cyan font-semibold text-sm">{fmt(totalVariavel)}</span>
          </div>
          {variaveis.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-8">Nenhum custo variável no período</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Descrição','Categoria','Valor',''].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variaveis.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-white text-sm">{c.descricao}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{c.categoria}</td>
                    <td className="px-4 py-2.5 text-cyan font-medium text-sm whitespace-nowrap">{fmt(c.valor)}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { dispatch({ type: 'DELETE_CUSTO', payload: c.id }); showToast('Custo excluído'); }}
                        className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer: Add cost */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Registrar Custo">
        <FormField label="Descrição" value={form.descricao} onChange={v => setForm(f => ({ ...f, descricao: v }))} />
        <FormField label="Valor (R$)" value={form.valor} type="number" onChange={v => setForm(f => ({ ...f, valor: +v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Tipo</label>
          <div className="flex gap-2">
            {(['fixo', 'variavel'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                className={`flex-1 py-2 rounded-input text-sm transition-all border ${form.tipo === t ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-400 border-border'}`}>
                {t === 'fixo' ? 'Fixo' : 'Variável'}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Categoria" value={form.categoria} onChange={v => setForm(f => ({ ...f, categoria: v }))} />
        <FormField label="Data" value={form.data} type="date" onChange={v => setForm(f => ({ ...f, data: v }))} />
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleAdd} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
