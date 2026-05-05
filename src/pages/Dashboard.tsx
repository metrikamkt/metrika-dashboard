import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { usePeriod } from '../context/PeriodContext';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { AlertCircle, ArrowRight, Plus, CheckCircle2 } from 'lucide-react';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import type { DemandaPrioridade } from '../data/mockData';

const NOW_MES = 5;
const NOW_ANO = 2026;

function fmt(n: number) {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$${n}`;
}

function filterLancamentos(items: { mes: number; ano: number }[], period: string) {
  if (period === 'mes') return items.filter(i => i.mes === NOW_MES && i.ano === NOW_ANO);
  if (period === 'trimestre') return items.filter(i => i.ano === NOW_ANO && i.mes >= NOW_MES - 2 && i.mes <= NOW_MES);
  return items.filter(i => i.ano === NOW_ANO);
}

const PRIORIDADE_CONFIG: Record<DemandaPrioridade, { color: string; label: string }> = {
  urgente: { color: 'text-red-400 bg-red-500/10 border-red-500/30', label: 'Urgente' },
  alta:    { color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', label: 'Alta' },
  media:   { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', label: 'Média' },
  baixa:   { color: 'text-gray-400 bg-gray-500/10 border-gray-500/30', label: 'Baixa' },
};

function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export default function Dashboard() {
  const { data } = useData();
  const { period } = usePeriod();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const lFiltered = filterLancamentos(data.lancamentos, period) as typeof data.lancamentos;
  const totalFat = lFiltered.reduce((s, l) => s + l.valor, 0);

  const novosClientes = data.clientes.filter(c => {
    const d = new Date(c.dataCadastro);
    if (period === 'mes') return d.getMonth() + 1 === NOW_MES && d.getFullYear() === NOW_ANO;
    if (period === 'trimestre') return d.getFullYear() === NOW_ANO && d.getMonth() + 1 >= NOW_MES - 2 && d.getMonth() + 1 <= NOW_MES;
    return d.getFullYear() === NOW_ANO;
  }).length;

  const totalAtivos = data.clientes.filter(c => c.status === 'ativo').length;
  const custosFiltrados = filterLancamentos(data.custos, period) as typeof data.custos;
  const totalCustos = custosFiltrados.reduce((s, c) => s + c.valor, 0);
  const margem = totalFat > 0 ? ((totalFat - totalCustos) / totalFat * 100) : 0;
  const metaNovos = data.metaNovosClientes;
  const faltaNovos = Math.max(0, metaNovos - novosClientes);
  const pctNovos = metaNovos > 0 ? Math.min((novosClientes / metaNovos) * 100, 100) : 0;

  const porServico = data.produtos.map(p => ({
    nome: p.nome.split(' ')[0],
    valor: lFiltered.filter(l => l.produtoId === p.id).reduce((s, l) => s + l.valor, 0),
  })).filter(p => p.valor > 0);

  const urgentes = data.demandas.filter(d => d.prioridade === 'urgente' && d.status !== 'concluida');
  const altas = data.demandas.filter(d => d.prioridade === 'alta' && d.status !== 'concluida');
  const demandasDestaque = [...urgentes, ...altas].slice(0, 5);

  const counterFat = useCounter(totalFat);
  const counterAtivos = useCounter(totalAtivos);

  const etapas = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado'] as const;
  const funnelData = etapas.map(e => ({ etapa: e, qty: data.leads.filter(l => l.etapa === e).length }));
  const maxFunnel = Math.max(...funnelData.map(f => f.qty), 1);

  return (
    <div>
      {/* ── Welcome ────────────────────────────────────────────────── */}
      <div className="mb-8 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}>
        <p className="text-sm text-gray-500 mb-1">Bem-vindo de volta 👋</p>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-white">Olá, </span>
          <span style={{ background: 'linear-gradient(90deg,#0087f0,#01c2f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin
          </span>
          <span className="inline-block" style={{ animation: 'pulse 2s ease-in-out infinite' }}>✦</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="mt-3">
          <PeriodSelector />
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Faturamento', value: fmt(counterFat), pct: data.metaFaturamento > 0 ? totalFat / data.metaFaturamento * 100 : 0, sub: `Meta: ${fmt(data.metaFaturamento)}` },
          { label: 'Clientes Ativos', value: String(counterAtivos), pct: null, sub: `${novosClientes} novos no período` },
          { label: 'Novos Clientes', value: String(novosClientes), pct: pctNovos, sub: `Meta: ${metaNovos}` },
          { label: 'Margem Bruta', value: `${margem.toFixed(1)}%`, pct: null, sub: totalFat > 0 ? `Custos: ${fmt(totalCustos)}` : '—' },
        ].map((k, i) => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5 transition-all duration-500"
            style={{ opacity: visible ? 1 : 0, transitionDelay: `${i * 80}ms`, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}>
            <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{k.value}</p>
            {k.pct !== null ? (
              <div className="mt-2">
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${k.pct}%`, background: 'linear-gradient(90deg,#0087f0,#01c2f0)' }} />
                </div>
                <p className="text-xs text-gray-600 mt-1">{k.pct.toFixed(0)}% da meta · {k.sub}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-600 mt-1">{k.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Row 2 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-surface border border-border rounded-card p-5">
          <h3 className="text-white font-semibold mb-4">Faturamento por Serviço</h3>
          {porServico.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-10">Nenhum lançamento no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={porServico} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" width={90} stroke="#444" tick={{ fill: '#aaa', fontSize: 11 }} />
                <Tooltip formatter={(v) => [fmt(v as number), 'Valor']} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {porServico.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#0087f0' : '#01c2f0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* New clients goal */}
        <div className="bg-surface border border-border rounded-card p-5 flex flex-col">
          <h3 className="text-white font-semibold mb-1">Meta de Novos Clientes</h3>
          <p className="text-xs text-gray-500 mb-4">Mês atual</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#cgoal)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - pctNovos / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                <defs>
                  <linearGradient id="cgoal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0087f0" /><stop offset="100%" stopColor="#01c2f0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{novosClientes}</span>
                <span className="text-xs text-gray-500">de {metaNovos}</span>
              </div>
            </div>
            <p className={`mt-3 text-sm font-medium ${faltaNovos === 0 ? 'text-green-400' : 'text-gray-300'}`}>
              {faltaNovos === 0 ? '🎉 Meta batida!' : `Faltam ${faltaNovos} clientes`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 3: Demands + Funnel ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-surface border border-border rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" /> Demandas Urgentes & Altas
            </h3>
            <button onClick={() => navigate('/demandas')} className="flex items-center gap-1 text-xs text-primary hover:text-cyan transition-colors">
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          {demandasDestaque.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-600">
              <CheckCircle2 size={32} className="mb-2 text-green-500/40" />
              <p className="text-sm">Nenhuma demanda urgente</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {demandasDestaque.map(d => {
                const cfg = PRIORIDADE_CONFIG[d.prioridade];
                return (
                  <div key={d.id} onClick={() => navigate('/demandas')}
                    className="flex items-center gap-3 p-3 rounded-input bg-bg border border-border hover:border-primary/40 cursor-pointer transition-all">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{d.titulo}</p>
                      <p className="text-gray-500 text-xs">{d.responsavel} · vence {new Date(d.dataVencimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pipeline CRM</h3>
            <button onClick={() => navigate('/crm')} className="text-xs text-primary hover:text-cyan flex items-center gap-1 transition-colors">
              Abrir <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {funnelData.map((f, i) => (
              <div key={f.etapa}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 capitalize">{f.etapa}</span>
                  <span className="text-white font-semibold">{f.qty}</span>
                </div>
                <div className="h-5 bg-bg rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-700"
                    style={{ width: `${(f.qty / maxFunnel) * 100}%`, background: 'linear-gradient(90deg,#0087f0,#01c2f0)', opacity: 1 - i * 0.13 }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/crm')}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary/30 text-primary rounded-input text-xs hover:bg-primary/5 transition-colors">
            <Plus size={12} /> Novo Lead
          </button>
        </div>
      </div>
    </div>
  );
}
