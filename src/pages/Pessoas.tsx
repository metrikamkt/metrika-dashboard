import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { Plus, Trash2, X, Camera, Gift, ShieldCheck } from 'lucide-react';
import type { Pessoa } from '../data/mockData';

const BLANK: Omit<Pessoa, 'id'> = {
  nome: '', cargo: '', departamento: '', email: '', telefone: '',
  dataNascimento: '', dataAdmissao: '', foto: '',
  kpis: [], descricao: '', funcoes: [],
};

export default function Pessoas() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const { isAdmin, allowedEmails, addAllowedEmail, removeAllowedEmail } = useAuth();
  const [novoEmail, setNovoEmail] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editPessoa, setEditPessoa] = useState<Pessoa | null>(null);
  const [form, setForm] = useState<Omit<Pessoa, 'id'>>(BLANK);
  const [popup, setPopup] = useState<Pessoa | null>(null);
  const [novaFuncao, setNovaFuncao] = useState('');

  const openNew = () => { setEditPessoa(null); setForm(BLANK); setDrawerOpen(true); };
  const openEdit = (p: Pessoa) => {
    setEditPessoa(p);
    setForm({ nome: p.nome, cargo: p.cargo, departamento: p.departamento, email: p.email, telefone: p.telefone, dataNascimento: p.dataNascimento, dataAdmissao: p.dataAdmissao, foto: p.foto, kpis: p.kpis, descricao: p.descricao, funcoes: p.funcoes });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.nome) { showToast('Informe o nome'); return; }
    if (editPessoa) {
      dispatch({ type: 'UPDATE_PESSOA', payload: { ...form, id: editPessoa.id } });
      showToast('Pessoa atualizada');
    } else {
      dispatch({ type: 'ADD_PESSOA', payload: { ...form, id: `ps${Date.now()}` } });
      showToast('Pessoa cadastrada');
    }
    setDrawerOpen(false);
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, foto: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const isBirthdaySoon = (dataNascimento: string) => {
    if (!dataNascimento) return false;
    const today = new Date();
    const d = new Date(dataNascimento);
    const inDays = (new Date(today.getFullYear(), d.getMonth(), d.getDate()).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return inDays >= 0 && inDays <= 7;
  };

  const getAge = (dataNascimento: string) => {
    if (!dataNascimento) return null;
    const today = new Date();
    const d = new Date(dataNascimento);
    return today.getFullYear() - d.getFullYear();
  };

  const aniversariantes = data.pessoas.filter(p => isBirthdaySoon(p.dataNascimento));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pessoas & RH</h1>
          <p className="text-gray-500 text-sm">{data.pessoas.length} colaboradores</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium">
          <Plus size={14} /> Cadastrar Pessoa
        </button>
      </div>

      {/* Birthday alert */}
      {aniversariantes.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-card flex items-center gap-3">
          <Gift size={18} className="text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-sm">
            <strong>Aniversários nos próximos 7 dias:</strong> {aniversariantes.map(p => p.nome).join(', ')}
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Headcount', value: data.pessoas.length },
          { label: 'Departamentos', value: [...new Set(data.pessoas.map(p => p.departamento).filter(Boolean))].length },
          { label: 'Aniversários (7d)', value: aniversariantes.length },
          { label: 'Cargos únicos', value: [...new Set(data.pessoas.map(p => p.cargo).filter(Boolean))].length },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      {/* People grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.pessoas.map(p => (
          <div key={p.id} onClick={() => setPopup(p)}
            className="bg-surface border border-border rounded-card p-5 cursor-pointer hover:border-primary/40 transition-all group">
            <div className="flex items-center gap-4 mb-3">
              {p.foto ? (
                <img src={p.foto} alt={p.nome} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {p.nome.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-semibold truncate flex items-center gap-1">
                  {p.nome}
                  {isBirthdaySoon(p.dataNascimento) && <span title="Aniversário em breve!">🎂</span>}
                </p>
                <p className="text-gray-400 text-xs truncate">{p.cargo}</p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.departamento}</span>
              </div>
            </div>
            {p.descricao && <p className="text-gray-500 text-xs line-clamp-2 mb-3">{p.descricao}</p>}
            {p.kpis.length > 0 && (
              <div className="space-y-1.5">
                {p.kpis.slice(0, 2).map(k => {
                  const pct = k.meta > 0 ? Math.min((k.valor / k.meta) * 100, 100) : 0;
                  return (
                    <div key={k.nome}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-gray-500">{k.nome}</span>
                        <span className="text-gray-400">{k.valor}/{k.meta}</span>
                      </div>
                      <div className="h-1 bg-bg rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={() => openEdit(p)} className="flex-1 py-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs transition-colors">Editar</button>
              <button onClick={() => { dispatch({ type: 'DELETE_PESSOA', payload: p.id }); showToast('Pessoa excluída'); }}
                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {data.pessoas.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-600">
            <p className="mb-3">Nenhuma pessoa cadastrada</p>
            <button onClick={openNew} className="text-primary hover:underline text-sm">+ Cadastrar</button>
          </div>
        )}
      </div>

      {/* Popup detail */}
      {popup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setPopup(null)}>
          <div className="bg-surface border border-border rounded-card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                {popup.foto ? (
                  <img src={popup.foto} alt={popup.nome} className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-2xl font-bold">
                    {popup.nome.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-white font-bold text-lg">{popup.nome}</h2>
                  <p className="text-gray-400 text-sm">{popup.cargo}</p>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{popup.departamento}</span>
                </div>
              </div>
              <button onClick={() => setPopup(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'E-mail', value: popup.email },
                  { label: 'Telefone', value: popup.telefone },
                  { label: 'Nascimento', value: popup.dataNascimento ? `${new Date(popup.dataNascimento).toLocaleDateString('pt-BR')} (${getAge(popup.dataNascimento)} anos)` : '—' },
                  { label: 'Admissão', value: popup.dataAdmissao ? new Date(popup.dataAdmissao).toLocaleDateString('pt-BR') : '—' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-gray-500">{f.label}</p>
                    <p className="text-white text-sm mt-0.5">{f.value || '—'}</p>
                  </div>
                ))}
              </div>
              {popup.descricao && (
                <div className="bg-bg border border-border rounded-input p-3">
                  <p className="text-xs text-gray-500 mb-1">Descrição</p>
                  <p className="text-gray-300 text-sm">{popup.descricao}</p>
                </div>
              )}
              {popup.funcoes.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Funções</p>
                  <div className="flex flex-wrap gap-2">
                    {popup.funcoes.map(f => (
                      <span key={f} className="text-xs bg-surface border border-border rounded-full px-3 py-1 text-gray-300">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {popup.kpis.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">KPIs</p>
                  <div className="space-y-3">
                    {popup.kpis.map(k => {
                      const pct = k.meta > 0 ? Math.min((k.valor / k.meta) * 100, 100) : 0;
                      return (
                        <div key={k.nome}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">{k.nome}</span>
                            <span className="text-gray-400">{k.valor} / {k.meta}</span>
                          </div>
                          <div className="h-2 bg-bg rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { openEdit(popup); setPopup(null); }}
                  className="flex-1 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-input text-sm transition-colors">
                  Editar
                </button>
                <button onClick={() => { dispatch({ type: 'DELETE_PESSOA', payload: popup.id }); showToast('Excluído'); setPopup(null); }}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-input transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controle de Acesso — visível só para admin */}
      {isAdmin && (
        <div className="mt-8 bg-surface border border-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-primary" />
            <h3 className="text-white font-semibold">Controle de Acesso</h3>
          </div>
          <p className="text-gray-500 text-xs mb-4">Somente os e-mails abaixo podem fazer login no sistema.</p>

          {/* Add email */}
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={novoEmail}
              onChange={e => setNovoEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { addAllowedEmail(novoEmail.trim()); setNovoEmail(''); } }}
              placeholder="email@gmail.com"
              className="flex-1 bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={async () => {
                if (!novoEmail.trim()) return;
                await addAllowedEmail(novoEmail.trim());
                showToast('Acesso concedido');
                setNovoEmail('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium"
            >
              <Plus size={14} /> Convidar
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-bg border border-primary/20 rounded-input">
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-primary" />
                <span className="text-sm text-white">arthur.haag2511@gmail.com</span>
              </div>
              <span className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">Admin</span>
            </div>
            {allowedEmails.map(email => (
              <div key={email} className="flex items-center justify-between px-3 py-2 bg-bg border border-border rounded-input">
                <span className="text-sm text-gray-300">{email}</span>
                <button
                  onClick={async () => { await removeAllowedEmail(email); showToast('Acesso removido'); }}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {allowedEmails.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-3">Nenhum convidado ainda</p>
            )}
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editPessoa ? 'Editar Pessoa' : 'Cadastrar Pessoa'}>
        {/* Photo */}
        <div className="mb-4 flex items-center gap-4">
          {form.foto ? (
            <img src={form.foto} alt="foto" className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg border-2 border-dashed border-border flex items-center justify-center text-gray-600">
              <Camera size={20} />
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Foto</label>
            <input type="file" accept="image/*" onChange={handleFoto} className="text-xs text-gray-400" />
          </div>
        </div>
        <FormField label="Nome *" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} />
        <FormField label="Cargo" value={form.cargo} onChange={v => setForm(f => ({ ...f, cargo: v }))} />
        <FormField label="Departamento" value={form.departamento} onChange={v => setForm(f => ({ ...f, departamento: v }))} />
        <FormField label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <FormField label="Telefone" value={form.telefone} onChange={v => setForm(f => ({ ...f, telefone: v }))} />
        <FormField label="Data de Nascimento" value={form.dataNascimento} type="date" onChange={v => setForm(f => ({ ...f, dataNascimento: v }))} />
        <FormField label="Data de Admissão" value={form.dataAdmissao} type="date" onChange={v => setForm(f => ({ ...f, dataAdmissao: v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Descrição / Bio</label>
          <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" />
        </div>
        {/* Funcoes */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Funções</label>
          <div className="flex gap-2 mb-2">
            <input value={novaFuncao} onChange={e => setNovaFuncao(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && novaFuncao) { setForm(f => ({ ...f, funcoes: [...f.funcoes, novaFuncao] })); setNovaFuncao(''); } }}
              placeholder="Digite e pressione Enter"
              className="flex-1 bg-bg border border-border rounded-input px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary" />
            <button onClick={() => { if (novaFuncao) { setForm(f => ({ ...f, funcoes: [...f.funcoes, novaFuncao] })); setNovaFuncao(''); } }}
              className="px-3 py-1.5 bg-primary rounded-input text-white text-sm">+</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.funcoes.map((fn, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-surface border border-border rounded-full px-2 py-0.5 text-gray-300">
                {fn}
                <button onClick={() => setForm(f => ({ ...f, funcoes: f.funcoes.filter((_, j) => j !== i) }))} className="text-gray-600 hover:text-red-400"><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>
        {/* KPIs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400">KPIs</label>
            <button onClick={() => setForm(f => ({ ...f, kpis: [...f.kpis, { nome: '', valor: 0, meta: 100 }] }))}
              className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={10} /> Adicionar</button>
          </div>
          {form.kpis.map((k, i) => (
            <div key={i} className="bg-bg border border-border rounded-input p-3 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">KPI {i + 1}</span>
                <button onClick={() => setForm(f => ({ ...f, kpis: f.kpis.filter((_, j) => j !== i) }))} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
              <input placeholder="Nome do KPI" value={k.nome} onChange={e => setForm(f => ({ ...f, kpis: f.kpis.map((x, j) => j === i ? { ...x, nome: e.target.value } : x) }))}
                className="w-full bg-bg border border-border rounded px-2 py-1 text-white text-xs focus:outline-none mb-1.5" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Atual" value={k.valor} onChange={e => setForm(f => ({ ...f, kpis: f.kpis.map((x, j) => j === i ? { ...x, valor: +e.target.value } : x) }))}
                  className="bg-bg border border-border rounded px-2 py-1 text-white text-xs focus:outline-none" />
                <input type="number" placeholder="Meta" value={k.meta} onChange={e => setForm(f => ({ ...f, kpis: f.kpis.map((x, j) => j === i ? { ...x, meta: +e.target.value } : x) }))}
                  className="bg-bg border border-border rounded px-2 py-1 text-white text-xs focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
