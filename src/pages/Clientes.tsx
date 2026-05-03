import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, MessageCircle, X, Building2 } from 'lucide-react';
import type { Cliente } from '../data/mockData';

const BLANK: Omit<Cliente, 'id'> = {
  nome: '', empresa: '', email: '', whatsapp: '', cpfCnpj: '',
  produtoId: '', produtoNome: '', status: 'ativo',
  dataCadastro: new Date().toISOString().slice(0, 10),
  aniversario: '', notas: '', documentos: [],
};

function fmt(n: number) {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$${n}`;
}

export default function Clientes() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Omit<Cliente, 'id'>>(BLANK);
  const [popup, setPopup] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');

  const openNew = () => { setEditCliente(null); setForm(BLANK); setDrawerOpen(true); };
  const openEdit = (c: Cliente) => {
    setEditCliente(c);
    setForm({ nome: c.nome, empresa: c.empresa, email: c.email, whatsapp: c.whatsapp, cpfCnpj: c.cpfCnpj, produtoId: c.produtoId, produtoNome: c.produtoNome, status: c.status, dataCadastro: c.dataCadastro, aniversario: c.aniversario, notas: c.notas, documentos: c.documentos });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.nome) { showToast('Informe o nome do cliente'); return; }
    if (editCliente) {
      dispatch({ type: 'UPDATE_CLIENTE', payload: { ...form, id: editCliente.id } });
      showToast('Cliente atualizado');
    } else {
      dispatch({ type: 'ADD_CLIENTE', payload: { ...form, id: `c${Date.now()}` } });
      showToast('Cliente cadastrado');
    }
    setDrawerOpen(false);
  };

  const ativos = data.clientes.filter(c => c.status === 'ativo').length;
  const filtered = data.clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.empresa.toLowerCase().includes(search.toLowerCase())
  );

  const getSales = (id: string) => data.lancamentos.filter(l => l.clienteId === id).sort((a, b) => b.data.localeCompare(a.data));
  const totalLtv = (id: string) => getSales(id).reduce((s, l) => s + l.valor, 0);

  const isBirthday = (aniversario: string) => {
    if (!aniversario) return false;
    const today = new Date();
    const d = new Date(aniversario);
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  const evolucao = ['Nov','Dez','Jan','Fev','Mar','Mai'].map((mes, i) => ({ mes, total: 121 + i * 4 + (i === 5 ? 3 : 0) }));

  const churnRate = data.clientes.length > 0
    ? ((data.clientes.filter(c => c.status === 'inativo').length / data.clientes.length) * 100).toFixed(1)
    : '0.0';

  const ltvMedio = data.clientes.length > 0
    ? data.lancamentos.reduce((s, l) => s + l.valor, 0) / data.clientes.length
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-500 text-sm">{ativos} clientes ativos</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium">
          <Plus size={14} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Clientes Ativos', value: ativos },
          { label: 'Total', value: data.clientes.length },
          { label: 'Churn Rate', value: `${churnRate}%` },
          { label: 'LTV Médio', value: fmt(ltvMedio) },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-card p-5 mb-6">
        <h3 className="text-white font-semibold mb-4">Evolução da Base</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={evolucao}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0087f0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0087f0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="mes" stroke="#444" tick={{ fill: '#777', fontSize: 11 }} />
            <YAxis stroke="#444" tick={{ fill: '#777', fontSize: 11 }} domain={['auto','auto']} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
            <Area type="monotone" dataKey="total" stroke="#0087f0" strokeWidth={2} fill="url(#ag)" dot={{ fill: '#0087f0', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente ou empresa..."
          className="w-full bg-surface border border-border rounded-input px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} onClick={() => setPopup(c)}
            className="bg-surface border border-border rounded-card p-4 cursor-pointer hover:border-primary/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {c.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm flex items-center gap-1">
                    <span className="truncate">{c.nome}</span>
                    {isBirthday(c.aniversario) && <span title="Aniversário hoje!">🎂</span>}
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 truncate"><Building2 size={10} /> {c.empresa}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${c.status === 'ativo' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-gray-400 bg-gray-500/10 border-gray-500/30'}`}>
                {c.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate">{c.produtoNome || 'Sem produto vinculado'}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-gray-600">LTV: <span className="text-primary font-medium">{fmt(totalLtv(c.id))}</span></span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                    <MessageCircle size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-600">Nenhum cliente encontrado</div>
        )}
      </div>

      {/* Popup */}
      {popup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setPopup(null)}>
          <div className="bg-surface border border-border rounded-card w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-xl font-bold">
                  {popup.nome.charAt(0)}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{popup.nome}</h2>
                  <p className="text-gray-400 text-sm">{popup.empresa}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${popup.status === 'ativo' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-gray-400 bg-gray-500/10 border-gray-500/30'}`}>
                    {popup.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setPopup(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'E-mail', value: popup.email },
                  { label: 'WhatsApp', value: popup.whatsapp },
                  { label: 'CPF/CNPJ', value: popup.cpfCnpj },
                  { label: 'Produto', value: popup.produtoNome },
                  { label: 'Cadastro', value: popup.dataCadastro ? new Date(popup.dataCadastro).toLocaleDateString('pt-BR') : '—' },
                  { label: 'Aniversário', value: popup.aniversario ? new Date(popup.aniversario).toLocaleDateString('pt-BR') : '—' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-gray-500">{f.label}</p>
                    <p className="text-white text-sm mt-0.5">{f.value || '—'}</p>
                  </div>
                ))}
              </div>
              {popup.notas && (
                <div className="bg-bg border border-border rounded-input p-3">
                  <p className="text-xs text-gray-500 mb-1">Notas</p>
                  <p className="text-gray-300 text-sm">{popup.notas}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Histórico de Vendas</p>
                {getSales(popup.id).length === 0 ? (
                  <p className="text-gray-600 text-sm">Nenhuma venda registrada</p>
                ) : (
                  <div className="space-y-1.5">
                    {getSales(popup.id).map(l => (
                      <div key={l.id} className="flex justify-between items-center bg-bg border border-border rounded-input px-3 py-2">
                        <span className="text-gray-400 text-xs">{new Date(l.data).toLocaleDateString('pt-BR')} · {l.produtoNome}</span>
                        <span className="text-primary font-semibold text-sm">{fmt(l.valor)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-3 pt-1">
                      <span className="text-gray-400 text-xs font-medium">LTV Total</span>
                      <span className="text-white font-bold">{fmt(totalLtv(popup.id))}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                {popup.whatsapp && (
                  <a href={`https://wa.me/${popup.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-input text-sm font-medium transition-colors">
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                <button onClick={() => { openEdit(popup); setPopup(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-input text-sm font-medium transition-colors">
                  Editar
                </button>
                <button onClick={() => { dispatch({ type: 'DELETE_CLIENTE', payload: popup.id }); showToast('Cliente excluído'); setPopup(null); }}
                  className="flex items-center justify-center px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-input transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editCliente ? 'Editar Cliente' : 'Novo Cliente'}>
        <FormField label="Nome *" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} />
        <FormField label="Empresa" value={form.empresa} onChange={v => setForm(f => ({ ...f, empresa: v }))} />
        <FormField label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <FormField label="WhatsApp (ex: 5511999887766)" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
        <FormField label="CPF / CNPJ" value={form.cpfCnpj} onChange={v => setForm(f => ({ ...f, cpfCnpj: v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Produto Contratado</label>
          <select value={form.produtoId}
            onChange={e => { const p = data.produtos.find(x => x.id === e.target.value); setForm(f => ({ ...f, produtoId: e.target.value, produtoNome: p?.nome || '' })); }}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">Selecione</option>
            {data.produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Status</label>
          <div className="flex gap-2">
            {(['ativo','inativo'] as const).map(s => (
              <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2 rounded-input text-sm border ${form.status === s ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-400 border-border'}`}>
                {s === 'ativo' ? 'Ativo' : 'Inativo'}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Data de Cadastro" value={form.dataCadastro} type="date" onChange={v => setForm(f => ({ ...f, dataCadastro: v }))} />
        <FormField label="Aniversário" value={form.aniversario} type="date" onChange={v => setForm(f => ({ ...f, aniversario: v }))} />
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
