import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageLayout } from '../components/layout/PageLayout';
import { Drawer } from '../components/layout/Drawer';
import { FormField } from '../components/ui/FormField';
import { SaveCancelButtons } from '../components/ui/SaveCancelButtons';
import { Badge } from '../components/ui/Badge';
import { Plus, Trash2 } from 'lucide-react';
import type { ItemEstoque } from '../data/mockData';

function getStatus(item: ItemEstoque): 'ok' | 'atencao' | 'critico' {
  if (item.quantidade < item.minimo) return 'critico';
  if (item.quantidade <= item.minimo * 1.3) return 'atencao';
  return 'ok';
}

export default function Estoque() {
  const { data, dispatch } = useData();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(data.estoque);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_ESTOQUE', payload: form });
    showToast('Dados salvos com sucesso');
    setOpen(false);
  };

  const addItem = () => {
    const novo: ItemEstoque = { id: Date.now().toString(), nome: 'Novo Item', quantidade: 0, minimo: 5 };
    setForm(f => ({ itens: [...f.itens, novo] }));
  };

  const removeItem = (id: string) => setForm(f => ({ itens: f.itens.filter(i => i.id !== id) }));
  const updateItem = (id: string, field: keyof ItemEstoque, value: string | number) =>
    setForm(f => ({ itens: f.itens.map(i => i.id === id ? { ...i, [field]: value } : i) }));

  const criticos = data.estoque.itens.filter(i => getStatus(i) === 'critico').length;
  const atencao = data.estoque.itens.filter(i => getStatus(i) === 'atencao').length;
  const ok = data.estoque.itens.filter(i => getStatus(i) === 'ok').length;

  return (
    <PageLayout title="Estoque" onEdit={() => { setForm(data.estoque); setOpen(true); }}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Itens Críticos', value: criticos, color: 'text-red-400' },
          { label: 'Itens em Atenção', value: atencao, color: 'text-yellow-400' },
          { label: 'Itens OK', value: ok, color: 'text-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-card p-5">
            <p className="text-gray-400 text-sm">{k.label}</p>
            <p className={`text-3xl font-bold mt-2 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-gray-500 uppercase px-5 py-3">Item</th>
              <th className="text-right text-xs text-gray-500 uppercase px-5 py-3">Qtd. Atual</th>
              <th className="text-right text-xs text-gray-500 uppercase px-5 py-3">Qtd. Mínima</th>
              <th className="text-right text-xs text-gray-500 uppercase px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.estoque.itens.map(item => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-white text-sm">{item.nome}</td>
                  <td className="px-5 py-3 text-right text-white font-medium">{item.quantidade}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{item.minimo}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge variant={status} label={status === 'ok' ? 'OK' : status === 'atencao' ? 'Atenção' : 'Crítico'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Editar Estoque">
        <div className="flex flex-col gap-3">
          {form.itens.map(item => (
            <div key={item.id} className="bg-bg border border-border rounded-card p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white text-sm font-medium truncate">{item.nome || 'Item'}</p>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 ml-2">
                  <Trash2 size={14} />
                </button>
              </div>
              <FormField label="Nome" value={item.nome} onChange={v => updateItem(item.id, 'nome', v)} />
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Qtd. Atual" value={item.quantidade} type="number" onChange={v => updateItem(item.id, 'quantidade', +v)} />
                <FormField label="Qtd. Mínima" value={item.minimo} type="number" onChange={v => updateItem(item.id, 'minimo', +v)} />
              </div>
            </div>
          ))}
          <button onClick={addItem} className="flex items-center justify-center gap-2 w-full border border-dashed border-primary/40 text-primary rounded-card py-3 text-sm hover:bg-primary/5 transition-colors">
            <Plus size={16} /> Adicionar Item
          </button>
        </div>
        <SaveCancelButtons onSave={handleSave} onCancel={() => setOpen(false)} />
      </Drawer>
    </PageLayout>
  );
}
