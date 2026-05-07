import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { Plus, Trash2, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import type { Lead, LeadEtapa } from '../data/mockData';

/* ─── Etapas do Kanban ─────────────────────────────────────────────────────── */
const ETAPAS: { key: LeadEtapa; label: string; color: string }[] = [
  { key: 'lead',        label: 'Lead',              color: 'border-gray-500/40'   },
  { key: 'qualificado', label: 'Lead Qualificado',  color: 'border-blue-500/40'   },
  { key: 'proposta',    label: 'Reunião Agendada',  color: 'border-yellow-500/40' },
  { key: 'negociacao',  label: 'Reunião Feita',     color: 'border-orange-500/40' },
  { key: 'fechado',     label: 'Fechamento',        color: 'border-green-500/40'  },
  { key: 'perdido',     label: 'Perdido',           color: 'border-red-500/40'    },
];

const ETAPA_TEXT: Record<LeadEtapa, string> = {
  lead: 'text-gray-400', qualificado: 'text-blue-400', proposta: 'text-yellow-400',
  negociacao: 'text-orange-400', fechado: 'text-green-400', perdido: 'text-red-400',
};

/* ─── Funil de Conversão ────────────────────────────────────────────────────── */
// metaConv = taxa de conversão esperada EM RELAÇÃO À ETAPA ANTERIOR (%)
// metaPct  = % acumulada em relação a 100 leads na entrada
const FUNIL_STAGES: {
  key: LeadEtapa;
  label: string;
  metaConv: number | null;
  metaPct: number;
  color: string;
}[] = [
  { key: 'lead',        label: 'Lead',             metaConv: null, metaPct: 100, color: '#6b7280' },
  { key: 'qualificado', label: 'Lead Qualificado', metaConv: 40,   metaPct: 40,  color: '#3b82f6' },
  { key: 'proposta',    label: 'Reunião Agendada', metaConv: 30,   metaPct: 12,  color: '#eab308' },
  { key: 'negociacao',  label: 'Reunião Feita',    metaConv: 75,   metaPct: 9,   color: '#f97316' },
  { key: 'fechado',     label: 'Fechamento',       metaConv: 33.3, metaPct: 3,   color: '#22c55e' },
];

function FunnelChart({ leads }: { leads: Lead[] }) {
  const [tooltip, setTooltip] = useState<number | null>(null);

  const cumulativeCounts = FUNIL_STAGES.map((_, i) => {
    const keysFromHere = FUNIL_STAGES.slice(i).map(s => s.key);
    return leads.filter(l => keysFromHere.includes(l.etapa)).length;
  });
  const counts = cumulativeCounts;
  const baseReal = counts[0] || 1;

  return (
    <div className="bg-surface border border-border rounded-card p-4 mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Funil de Conversão</h3>
          <p className="text-gray-500 text-xs mt-0.5">Real vs Meta · sincronizado com o kanban</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm bg-gradient-to-r from-[#0087f0] to-[#01c2f0]" />
            Real
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm border-2 border-dashed border-gray-500" />
            Meta
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {FUNIL_STAGES.map((stage, i) => {
          const count     = counts[i];
          const prevCount = i > 0 ? counts[i - 1] : null;
          const realConv  = prevCount != null
            ? (prevCount > 0 ? +(count / prevCount * 100).toFixed(1) : 0)
            : null;
          const realPct   = +(count / baseReal * 100).toFixed(1);
          const metaPct   = stage.metaPct;
          const aboveMeta = realConv != null && stage.metaConv != null && realConv >= stage.metaConv;
          const isTooltip = tooltip === i;

          return (
            <div
              key={stage.key}
              className="relative"
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Label row — compact on mobile */}
              <div className="flex items-center justify-between mb-1 gap-1">
                <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 min-w-0 flex-1 overflow-hidden">
                  <span className="text-xs font-medium text-gray-300 w-20 md:w-36 flex-shrink-0 truncate">{stage.label}</span>
                  <span className="text-sm font-bold text-white flex-shrink-0">{count}</span>
                  {realConv != null && (
                    <span className={`text-xs font-semibold flex-shrink-0 ${aboveMeta ? 'text-green-400' : 'text-red-400'}`}>
                      {aboveMeta ? '✅' : '❌'} {realConv}%
                    </span>
                  )}
                </div>
                {stage.metaConv != null && (
                  <span className="hidden md:block text-[10px] text-gray-600 flex-shrink-0">
                    meta: {stage.metaConv}%
                  </span>
                )}
              </div>

              {/* Bar track */}
              <div className="relative h-6 bg-bg rounded-input overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 border-2 border-dashed border-gray-500/60 rounded-input transition-all duration-500"
                  style={{ width: `${metaPct}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-input transition-all duration-700"
                  style={{ width: `${realPct}%`, background: `linear-gradient(90deg, ${stage.color}cc, ${stage.color})` }}
                />
                {realPct > 8 && (
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold text-white/80 select-none">
                    {realPct}%
                  </span>
                )}
              </div>

              {/* Tooltip — desktop only */}
              {isTooltip && (
                <div className="hidden md:block absolute left-40 top-0 z-20 bg-gray-900 border border-border rounded-input px-3 py-2 text-xs shadow-xl whitespace-nowrap">
                  <p className="text-white font-semibold mb-1">{stage.label}</p>
                  <p className="text-gray-400">Leads: <span className="text-white">{count}</span></p>
                  <p className="text-gray-400">% do topo: <span className="text-white">{realPct}%</span></p>
                  {realConv != null && (
                    <>
                      <p className="text-gray-400">Conversão real: <span className={aboveMeta ? 'text-green-400' : 'text-red-400'}>{realConv}%</span></p>
                      <p className="text-gray-400">Meta: <span className="text-white">{stage.metaConv}%</span></p>
                      <p className={`font-semibold mt-1 ${aboveMeta ? 'text-green-400' : 'text-red-400'}`}>
                        {aboveMeta ? '✅ Acima da meta' : '❌ Abaixo da meta'}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row — desktop only (evita overflow no mobile) */}
      <div className="hidden md:grid grid-cols-5 gap-2 mt-5 pt-4 border-t border-border">
        {FUNIL_STAGES.map((stage, i) => {
          const count     = counts[i];
          const prevCount = i > 0 ? counts[i - 1] : null;
          const realConv  = prevCount != null
            ? (prevCount > 0 ? +(count / prevCount * 100).toFixed(1) : 0)
            : null;
          const above = realConv != null && stage.metaConv != null && realConv >= stage.metaConv;
          return (
            <div key={stage.key} className="bg-bg border border-border rounded-input p-2.5 text-center">
              <p className="text-[9px] text-gray-500 truncate">{stage.label}</p>
              <p className="text-base font-bold text-white mt-0.5">{count}</p>
              {realConv != null
                ? <p className={`text-[10px] font-semibold ${above ? 'text-green-400' : 'text-red-400'}`}>{realConv}%</p>
                : <p className="text-[10px] text-gray-600">—</p>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const BLANK: Omit<Lead, 'id'> = {
  nome: '', empresa: '', whatsapp: '', email: '', etapa: 'lead',
  produtoId: '', produtoNome: '', valor: 0, dataCriacao: new Date().toISOString().slice(0, 10), notas: '',
};

function fmt(n: number) {
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$${n}`;
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function CRM() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<Omit<Lead, 'id'>>(BLANK);
  const [currentCol, setCurrentCol] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openNew  = () => { setEditLead(null); setForm(BLANK); setDrawerOpen(true); };
  const openEdit = (l: Lead) => {
    setEditLead(l);
    setForm({ nome: l.nome, empresa: l.empresa, whatsapp: l.whatsapp, email: l.email,
              etapa: l.etapa, produtoId: l.produtoId, produtoNome: l.produtoNome,
              valor: l.valor, dataCriacao: l.dataCriacao, notas: l.notas });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.nome) { showToast('Informe o nome'); return; }
    if (editLead) {
      dispatch({ type: 'UPDATE_LEAD', payload: { ...form, id: editLead.id } });
      showToast('Lead atualizado');
    } else {
      dispatch({ type: 'ADD_LEAD', payload: { ...form, id: `ld${Date.now()}` } });
      showToast('Lead adicionado');
    }
    setDrawerOpen(false);
  };

  const moveEtapa = (lead: Lead, dir: 'prev' | 'next') => {
    const idx    = ETAPAS.findIndex(e => e.key === lead.etapa);
    const newIdx = dir === 'next' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= ETAPAS.length) return;
    dispatch({ type: 'UPDATE_LEAD', payload: { ...lead, etapa: ETAPAS[newIdx].key } });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    setCurrentCol(Math.round(scrollLeft / offsetWidth));
  };

  const totalPipeline = data.leads
    .filter(l => l.etapa !== 'perdido' && l.etapa !== 'fechado')
    .reduce((s, l) => s + l.valor, 0);

  // Shared lead card renderer
  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div
      key={lead.id}
      onClick={() => openEdit(lead)}
      className="bg-bg border border-border rounded-input p-3 cursor-pointer active:border-primary/60 hover:border-primary/40 transition-all"
    >
      <p className="text-white text-sm font-semibold truncate">{lead.nome}</p>
      <p className="text-gray-500 text-xs truncate mt-0.5">{lead.empresa}</p>
      {lead.produtoNome && (
        <span className="inline-block mt-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
          {lead.produtoNome.split(' ')[0]}
        </span>
      )}
      {lead.valor > 0 && (
        <p className="text-primary text-xs font-semibold mt-1">{fmt(lead.valor)}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-1">
          <button onClick={e => { e.stopPropagation(); moveEtapa(lead, 'prev'); }}
            className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors">
            <ChevronLeft size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); moveEtapa(lead, 'next'); }}
            className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors">
            <ChevronRight size={13} />
          </button>
        </div>
        <div className="flex gap-1">
          {lead.whatsapp && (
            <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 hover:bg-green-500/20 rounded text-gray-500 hover:text-green-400 transition-colors">
              <MessageCircle size={13} />
            </a>
          )}
          <button onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_LEAD', payload: lead.id }); showToast('Lead excluído'); }}
            className="p-1.5 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM — Pipeline</h1>
          <p className="text-gray-500 text-sm">
            Pipeline: <span className="text-primary font-semibold">{fmt(totalPipeline)}</span>
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium">
          <Plus size={14} /> Novo Lead
        </button>
      </div>

      {/* ── MOBILE KANBAN — full-width swipe, one column at a time ── */}
      <div className="md:hidden overflow-hidden">
        {/* Etapa indicator */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className={`text-xs font-semibold uppercase tracking-wide ${ETAPA_TEXT[ETAPAS[currentCol].key]}`}>
            {ETAPAS[currentCol].label}
          </span>
          <span className="text-xs text-gray-500">{currentCol + 1} / {ETAPAS.length}</span>
        </div>

        {/* Scroll container — exactly the width of the page content area, no overflow */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-scroll snap-x snap-mandatory rounded-card w-full"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%' } as React.CSSProperties}
        >
          {ETAPAS.map(etapa => {
            const colLeads = data.leads.filter(l => l.etapa === etapa.key);
            const colTotal = colLeads.reduce((s, l) => s + l.valor, 0);
            return (
              <div
                key={etapa.key}
                className={`snap-start flex-shrink-0 bg-surface border rounded-card flex flex-col ${etapa.color}`}
                style={{ minWidth: '100%', height: 'calc(100svh - 240px)' }}
              >
                {/* Column header */}
                <div className="px-4 py-3 border-b border-border flex-shrink-0 flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${ETAPA_TEXT[etapa.key]}`}>{etapa.label}</p>
                    {colTotal > 0 && <p className="text-[10px] text-gray-600 mt-0.5">{fmt(colTotal)}</p>}
                  </div>
                  <span className="text-xs bg-bg border border-border rounded-full px-2.5 py-0.5 text-gray-400 font-semibold">
                    {colLeads.length}
                  </span>
                </div>
                {/* Cards — scrollable vertically */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                  {colLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
                  <button onClick={openNew}
                    className="mt-1 text-xs text-gray-600 hover:text-primary transition-colors py-2 flex items-center gap-1 justify-center border border-dashed border-border rounded-input hover:border-primary/30">
                    <Plus size={11} /> Adicionar lead
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-1.5 py-3">
          {ETAPAS.map((e, i) => (
            <button
              key={e.key}
              onClick={() => scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' })}
              className={`rounded-full transition-all duration-300 ${i === currentCol ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-700'}`}
            />
          ))}
        </div>
      </div>

      {/* ── DESKTOP KANBAN — 6-column grid ── */}
      <div className="hidden md:grid md:grid-cols-6 gap-3 mb-5">
        {ETAPAS.map(etapa => {
          const leads = data.leads.filter(l => l.etapa === etapa.key);
          const total = leads.reduce((s, l) => s + l.valor, 0);
          return (
            <div key={etapa.key}
              className={`bg-surface border rounded-card flex flex-col max-h-[calc(100vh-220px)] ${etapa.color}`}>
              <div className="p-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${ETAPA_TEXT[etapa.key]}`}>{etapa.label}</span>
                  <span className="text-xs bg-bg border border-border rounded-full px-2 py-0.5 text-gray-400">{leads.length}</span>
                </div>
                {total > 0 && <p className="text-xs text-gray-600 mt-0.5">{fmt(total)}</p>}
              </div>
              <div className="flex-1 min-h-0 p-2 flex flex-col gap-2 overflow-y-auto">
                {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
                <button onClick={openNew}
                  className="text-[10px] text-gray-600 hover:text-primary transition-colors py-1 flex items-center gap-1 justify-center border border-dashed border-border rounded-input hover:border-primary/30">
                  <Plus size={10} /> Lead
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel chart */}
      <FunnelChart leads={data.leads} />

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editLead ? 'Editar Lead' : 'Novo Lead'}>
        <FormField label="Nome" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} />
        <FormField label="Empresa" value={form.empresa} onChange={v => setForm(f => ({ ...f, empresa: v }))} />
        <FormField label="WhatsApp (ex: 5511999887766)" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
        <FormField label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Etapa</label>
          <select value={form.etapa}
            onChange={e => setForm(f => ({ ...f, etapa: e.target.value as LeadEtapa }))}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Produto de Interesse</label>
          <select value={form.produtoId}
            onChange={e => { const p = data.produtos.find(x => x.id === e.target.value); setForm(f => ({ ...f, produtoId: e.target.value, produtoNome: p?.nome || '' })); }}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">Selecione</option>
            {data.produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <FormField label="Valor Estimado (R$)" value={form.valor} type="number" onChange={v => setForm(f => ({ ...f, valor: +v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Notas</label>
          <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={3}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
