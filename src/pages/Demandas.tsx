import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Demanda, DemandaPrioridade, DemandaStatus } from '../data/mockData';

const PRIORIDADE: { key: DemandaPrioridade; label: string; color: string }[] = [
  { key: 'urgente', label: 'Urgente', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { key: 'alta',    label: 'Alta',    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { key: 'media',   label: 'Média',   color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { key: 'baixa',   label: 'Baixa',   color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
];

const STATUS: { key: DemandaStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { key: 'aberta',       label: 'Aberta',       icon: AlertCircle },
  { key: 'em_andamento', label: 'Em andamento',  icon: Clock },
  { key: 'concluida',    label: 'Concluída',     icon: CheckCircle2 },
];

const BLANK: Omit<Demanda, 'id'> = {
  titulo: '', descricao: '', prioridade: 'media', responsavel: '',
  status: 'aberta', dataCriacao: new Date().toISOString().slice(0, 10), dataVencimento: '',
};

export default function Demandas() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDemanda, setEditDemanda] = useState<Demanda | null>(null);
  const [form, setForm] = useState<Omit<Demanda, 'id'>>(BLANK);
  const [filterStatus, setFilterStatus] = useState<DemandaStatus | 'todas'>('todas');
  const [filterPrioridade, setFilterPrioridade] = useState<DemandaPrioridade | 'todas'>('todas');

  const openNew = () => { setEditDemanda(null); setForm(BLANK); setDrawerOpen(true); };
  const openEdit = (d: Demanda) => {
    setEditDemanda(d);
    setForm({ titulo: d.titulo, descricao: d.descricao, prioridade: d.prioridade, responsavel: d.responsavel, status: d.status, dataCriacao: d.dataCriacao, dataVencimento: d.dataVencimento });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.titulo) { showToast('Informe o título'); return; }
    if (editDemanda) {
      dispatch({ type: 'UPDATE_DEMANDA', payload: { ...form, id: editDemanda.id } });
      showToast('Demanda atualizada');
    } else {
      dispatch({ type: 'ADD_DEMANDA', payload: { ...form, id: `d${Date.now()}` } });
      showToast('Demanda criada');
    }
    setDrawerOpen(false);
  };

  const toggleStatus = (d: Demanda) => {
    const next: DemandaStatus = d.status === 'aberta' ? 'em_andamento' : d.status === 'em_andamento' ? 'concluida' : 'aberta';
    dispatch({ type: 'UPDATE_DEMANDA', payload: { ...d, status: next } });
  };

  const filtered = data.demandas.filter(d =>
    (filterStatus === 'todas' || d.status === filterStatus) &&
    (filterPrioridade === 'todas' || d.prioridade === filterPrioridade)
  );

  const counts = {
    urgentes: data.demandas.filter(d => d.prioridade === 'urgente' && d.status !== 'concluida').length,
    abertas: data.demandas.filter(d => d.status === 'aberta').length,
    andamento: data.demandas.filter(d => d.status === 'em_andamento').length,
    concluidas: data.demandas.filter(d => d.status === 'concluida').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Demandas</h1>
          <p className="text-gray-500 text-sm">{counts.urgentes} urgentes · {counts.abertas} abertas</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium">
          <Plus size={14} /> Nova Demanda
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Urgentes', value: counts.urgentes, color: 'text-red-400' },
          { label: 'Abertas', value: counts.abertas, color: 'text-orange-400' },
          { label: 'Em Andamento', value: counts.andamento, color: 'text-yellow-400' },
          { label: 'Concluídas', value: counts.concluidas, color: 'text-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
            <p className={`text-3xl font-bold mt-2 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters — selects on mobile, button groups on desktop */}
      <div className="mb-4">
        {/* Mobile */}
        <div className="flex gap-2 md:hidden">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as DemandaStatus | 'todas')}
            className="flex-1 bg-surface border border-border rounded-input px-3 py-2 text-xs text-white focus:outline-none focus:border-primary">
            <option value="todas">Status: Todos</option>
            {STATUS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select value={filterPrioridade} onChange={e => setFilterPrioridade(e.target.value as DemandaPrioridade | 'todas')}
            className="flex-1 bg-surface border border-border rounded-input px-3 py-2 text-xs text-white focus:outline-none focus:border-primary">
            <option value="todas">Prioridade: Todas</option>
            {PRIORIDADE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        {/* Desktop */}
        <div className="hidden md:flex gap-3 flex-wrap">
          <div className="flex bg-surface border border-border rounded-input p-0.5 gap-0.5">
            {([{ key: 'todas', label: 'Todas' }, ...STATUS.map(s => ({ key: s.key, label: s.label }))] as { key: DemandaStatus | 'todas'; label: string }[]).map(s => (
              <button key={s.key} onClick={() => setFilterStatus(s.key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filterStatus === s.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex bg-surface border border-border rounded-input p-0.5 gap-0.5">
            {([{ key: 'todas', label: 'Prioridades' }, ...PRIORIDADE.map(p => ({ key: p.key, label: p.label }))] as { key: DemandaPrioridade | 'todas'; label: string }[]).map(p => (
              <button key={p.key} onClick={() => setFilterPrioridade(p.key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filterPrioridade === p.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-green-500/30" />
            <p>Nenhuma demanda encontrada</p>
          </div>
        )}
        {filtered.sort((a, b) => {
          const order: Record<DemandaPrioridade, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };
          return order[a.prioridade] - order[b.prioridade];
        }).map(d => {
          const pCfg = PRIORIDADE.find(p => p.key === d.prioridade)!;
          const sCfg = STATUS.find(s => s.key === d.status)!;
          const Icon = sCfg.icon;
          const isOverdue = d.dataVencimento && new Date(d.dataVencimento) < new Date() && d.status !== 'concluida';
          return (
            <div key={d.id}
              className={`bg-surface border rounded-card p-4 flex items-start gap-4 transition-all hover:border-primary/30 ${d.status === 'concluida' ? 'opacity-60' : 'border-border'}`}>
              <button onClick={() => toggleStatus(d)}
                className={`mt-0.5 flex-shrink-0 transition-colors ${d.status === 'concluida' ? 'text-green-400' : d.status === 'em_andamento' ? 'text-yellow-400' : 'text-gray-600 hover:text-primary'}`}>
                <Icon size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${pCfg.color}`}>{pCfg.label}</span>
                  <span className="text-[10px] text-gray-500 bg-surface border border-border rounded-full px-2 py-0.5">{sCfg.label}</span>
                  {isOverdue && <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">Atrasada</span>}
                </div>
                <p className={`text-sm font-medium ${d.status === 'concluida' ? 'line-through text-gray-500' : 'text-white'}`}>{d.titulo}</p>
                {d.descricao && <p className="text-gray-500 text-xs mt-1 truncate">{d.descricao}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                  <span>👤 {d.responsavel}</span>
                  {d.dataVencimento && <span>📅 Vence {new Date(d.dataVencimento).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-primary transition-colors text-xs">Editar</button>
                <button onClick={() => { dispatch({ type: 'DELETE_DEMANDA', payload: d.id }); showToast('Demanda excluída'); }}
                  className="p-1.5 hover:bg-red-500/10 rounded text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editDemanda ? 'Editar Demanda' : 'Nova Demanda'}>
        <FormField label="Título *" value={form.titulo} onChange={v => setForm(f => ({ ...f, titulo: v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Descrição</label>
          <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Prioridade</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORIDADE.map(p => (
              <button key={p.key} onClick={() => setForm(f => ({ ...f, prioridade: p.key }))}
                className={`py-2 rounded-input text-xs font-medium border transition-all ${form.prioridade === p.key ? p.color : 'bg-bg text-gray-500 border-border'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Status</label>
          <div className="flex gap-2">
            {STATUS.map(s => (
              <button key={s.key} onClick={() => setForm(f => ({ ...f, status: s.key }))}
                className={`flex-1 py-2 rounded-input text-xs border transition-all ${form.status === s.key ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-400 border-border'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Responsável" value={form.responsavel} onChange={v => setForm(f => ({ ...f, responsavel: v }))} />
        <FormField label="Data de Vencimento" value={form.dataVencimento} type="date" onChange={v => setForm(f => ({ ...f, dataVencimento: v }))} />
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
