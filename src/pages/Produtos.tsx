import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { Plus, Trash2, Users } from 'lucide-react';
import type { Produto } from '../data/mockData';

const BLANK: Omit<Produto, 'id'> = {
  nome: '', categoria: '', preco: 0, descricao: '', contratoTemplate: '',
};

function fmt(n: number) {
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

export default function Produtos() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduto, setEditProduto] = useState<Produto | null>(null);
  const [form, setForm] = useState<Omit<Produto, 'id'>>(BLANK);

  const openNew = () => { setEditProduto(null); setForm(BLANK); setDrawerOpen(true); };
  const openEdit = (p: Produto) => {
    setEditProduto(p);
    setForm({ nome: p.nome, categoria: p.categoria, preco: p.preco, descricao: p.descricao, contratoTemplate: p.contratoTemplate });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.nome) { showToast('Informe o nome do produto'); return; }
    if (editProduto) {
      dispatch({ type: 'UPDATE_PRODUTO', payload: { ...form, id: editProduto.id } });
      showToast('Produto atualizado');
    } else {
      dispatch({ type: 'ADD_PRODUTO', payload: { ...form, id: `p${Date.now()}` } });
      showToast('Produto cadastrado');
    }
    setDrawerOpen(false);
  };

  const getActiveClients = (produtoId: string) =>
    data.clientes.filter(c => c.produtoId === produtoId && c.status === 'ativo').length;

  const getRevenue = (produtoId: string) =>
    data.lancamentos.filter(l => l.produtoId === produtoId).reduce((s, l) => s + l.valor, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos & Serviços</h1>
          <p className="text-gray-500 text-sm">{data.produtos.length} produtos cadastrados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium">
          <Plus size={14} /> Novo Produto
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        {[
          { label: 'Produtos Ativos', value: data.produtos.length },
          { label: 'Clientes Vinculados', value: data.clientes.filter(c => c.produtoId !== '').length },
          { label: 'Receita Total Gerada', value: fmt(data.lancamentos.reduce((s, l) => s + l.valor, 0)) },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-3 md:p-5">
            <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide leading-tight">{k.label}</p>
            <p className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.produtos.map(p => {
          const activeClients = getActiveClients(p.id);
          const revenue = getRevenue(p.id);
          return (
            <div key={p.id} className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{p.categoria}</span>
                  </div>
                  <h3 className="text-white font-semibold">{p.nome}</h3>
                  <p className="text-gray-500 text-sm mt-1">{p.descricao}</p>
                </div>
                <div className="flex gap-1 ml-3 flex-shrink-0">
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs">
                    Editar
                  </button>
                  <button onClick={() => { dispatch({ type: 'DELETE_PRODUTO', payload: p.id }); showToast('Produto excluído'); }}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500">Preço base</p>
                  <p className="text-primary font-bold text-base md:text-lg">{fmt(p.preco)}</p>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1"><Users size={10} /> Clientes ativos</p>
                  <p className="text-white font-semibold text-base md:text-lg">{activeClients}</p>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500">Receita gerada</p>
                  <p className="text-cyan font-semibold text-sm md:text-base">{fmt(revenue)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.produtos.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="mb-3">Nenhum produto cadastrado</p>
          <button onClick={openNew} className="text-primary hover:underline text-sm">+ Cadastrar produto</button>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editProduto ? 'Editar Produto' : 'Novo Produto'}>
        <FormField label="Nome do Produto *" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} />
        <FormField label="Categoria" value={form.categoria} onChange={v => setForm(f => ({ ...f, categoria: v }))} />
        <FormField label="Preço Base (R$)" value={form.preco} type="number" onChange={v => setForm(f => ({ ...f, preco: +v }))} />
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Descrição</label>
          <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3}
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Template de Contrato</label>
          <textarea value={form.contratoTemplate} onChange={e => setForm(f => ({ ...f, contratoTemplate: e.target.value }))} rows={6}
            placeholder="Use {{clienteNome}}, {{clienteEmpresa}}, {{cpfCnpj}}, {{valor}}, {{dataInicio}}, {{dataFim}}"
            className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none font-mono text-xs" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-input py-2 text-sm font-medium">Salvar</button>
          <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-bg text-gray-400 border border-border rounded-input py-2 text-sm">Cancelar</button>
        </div>
      </Drawer>
    </div>
  );
}
