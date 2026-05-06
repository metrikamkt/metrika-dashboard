import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Drawer } from '../components/layout/Drawer';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { Meta } from '../data/mockData';

function getColor(pct: number) {
  if (pct >= 80) return { bar: 'from-green-500 to-green-400', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
  if (pct >= 50) return { bar: 'from-yellow-500 to-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
  return { bar: 'from-red-500 to-red-400', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
}

const BLANK: Omit<Meta, 'id'> = { nome: '', alvo: 100, atual: 0, responsavel: '', unidade: '', source: undefined };

// Returns the effective current value — auto-computed for CRM-linked metas
function getAtual(meta: Meta, leads: { etapa: string }[]): number {
  if (meta.source === 'crm_fechados') {
    return leads.filter(l => l.etapa === 'fechado').length;
  }
  return meta.atual;
}

export default function Metas() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Meta, 'id'>>(BLANK);
  const [metaFat, setMetaFat] = useState(data.metaFaturamento);
  const [metaClientes, setMetaClientes] = useState(data.metaNovosClientes);
  const [globalDrawer, setGlobalDrawer] = useState(false);

  const openNew = () => { setEditIndex(null); setForm(BLANK); setDrawerOpen(true); };
  const openEdit = (m: Meta, i: number) => {
    setEditIndex(i);
    setForm({ nome: m.nome, alvo: m.alvo, atual: m.atual, responsavel: m.responsavel, unidade: m.unidade, source: m.source });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.nome) { showToast('Informe o nome da meta'); return; }
    const novas = [...data.metas];
    if (editIndex !== null) {
      novas[editIndex] = { ...form, id: data.metas[editIndex].id };
    } else {
      novas.push({ ...form, id: `m${Date.now()}` });
    }
    dispatch({ type: 'SET_METAS', payload: novas });
    showToast('Meta salva');
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'SET_METAS', payload: data.metas.filter(m => m.id !== id) });
    showToast('Meta removida');
  };

  const handleSaveGlobal = () => {
    dispatch({ type: 'SET_META_FATURAMENTO', payload: metaFat });
    dispatch({ type: 'SET_META_NOVOS_CLIENTES', payload: metaClientes });
    showToast('Metas globais atualizadas');
    setGlobalDrawer(false);
  };

  const fmt = (n: number, u: string) => {
    if (u === 'R$') return `R$ ${n.toLocaleString('pt-BR')}`;
    return `${n} ${u}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Metas & OKRs</h1>
          <p className="text-gray-500 text-sm">{data.metas.length} metas ativas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMetaFat(data.metaFaturamento); setMetaClientes(data.metaNovosClientes); setGlobalDrawer(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-input text-gray-300 text-sm hover:border-primary/40 transition-all">
            <Edit2 size={14} /> Metas Globais
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium">
            <Plus size={14} /> Nova Meta
          </button>
        </div>
      </div>

      {/* Global goals summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Meta Mensal de Faturamento', value: `R$ ${data.metaFaturamento.toLocaleString('pt-BR')}` },
          { label: 'Meta de Novos Clientes/Mês', value: `${data.metaNovosClientes} clientes` },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{k.value}</p>
            </div>
            <button onClick={() => setGlobalDrawer(true)} className="text-gray-600 hover:text-primary transition-colors"><Edit2 size={16} /></button>
          </div>
        ))}
      </div>

      {/* Metas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.metas.map((meta, i) => {
          const atual = getAtual(meta, data.leads);
          const pct = meta.alvo > 0 ? Math.min((atual / meta.alvo) * 100, 100) : 0;
          const colors = getColor(pct);
          return (
            <div key={meta.id} className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-semibold">{meta.nome}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {meta.source === 'crm_fechados'
                      ? <span className="text-primary/80">🔗 Vinculada ao CRM</span>
                      : `Resp: ${meta.responsavel}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-lg font-bold ${colors.text}`}>{pct.toFixed(0)}%</span>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => openEdit(meta, i)} className="p-1 hover:text-primary text-gray-600 transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(meta.id)} className="p-1 hover:text-red-400 text-gray-600 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-bg rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Atual: <span className="text-white font-medium">{fmt(atual, meta.unidade)}</span></span>
                <span>Meta: <span className="text-gray-300">{fmt(meta.alvo, meta.unidade)}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {data.metas.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="mb-3">Nenhuma meta cadastrada</p>
          <button onClick={openNew} className="text-primary hover:underline text-sm">+ Criar primeira meta</button>
        </div>
      )}

      {/* Drawer: Meta */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editIndex !== null ? 'Editar Meta' : 'Nova Meta'}>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Nome da Meta *</label>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Valor Alvo</label>
            <input type="number" value={form.alvo} onChange={e => setForm(f => ({ ...f, alvo: +e.target.value }))}
              className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Valor Atual</label>
            <input type="number" value={form.atual}
              disabled={form.source === 'crm_fechados'}
              onChange={e => setForm(f => ({ ...f, atual: +e.target.value }))}
              className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed" />
          </div>
        </div>

        {/* CRM link toggle */}
        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-input">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, source: f.source === 'crm_fechados' ? undefined : 'crm_fechados' }))}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.source === 'crm_fechados' ? 'bg-primary' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.source === 'crm_fechados' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <p className="text-xs text-white font-medium">Vincular ao CRM — Fechamentos</p>
              <p className="text-[10px] text-gray-500 mt-0.5">O valor atual é calculado automaticamente pelos leads na etapa Fechamento</p>
            </div>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Unidade (R$, %, pts, clientes...)</label>
          <input value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Responsável</label>
          <input value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        {/* Preview */}
        {form.nome && (
          <div className={`p-3 rounded-input border mb-4 ${getColor(form.alvo > 0 ? (form.atual / form.alvo) * 100 : 0).bg}`}>
            <p className="text-xs text-gray-400 mb-1">Preview</p>
            <div className="h-2 bg-bg/50 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${getColor(form.alvo > 0 ? (form.atual / form.alvo) * 100 : 0).bar}`}
                style={{ width: `${form.alvo > 0 ? Math.min((form.atual / form.alvo) * 100, 100) : 0}%` }} />
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>

      {/* Drawer: Global goals */}
      <Drawer open={globalDrawer} onClose={() => setGlobalDrawer(false)} title="Metas Globais">
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Meta Mensal de Faturamento (R$)</label>
          <input type="number" value={metaFat} onChange={e => setMetaFat(+e.target.value)}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Meta Mensal de Novos Clientes</label>
          <input type="number" value={metaClientes} onChange={e => setMetaClientes(+e.target.value)}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleSaveGlobal} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setGlobalDrawer(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
