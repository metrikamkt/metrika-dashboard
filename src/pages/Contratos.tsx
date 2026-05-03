import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { FileText, Download, Eye, X } from 'lucide-react';

function generateContract(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), template);
}

export default function Contratos() {
  const { data } = useData();
  const { showToast } = useToast();
  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState('');
  const [valorPersonalizado, setValorPersonalizado] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const cliente = data.clientes.find(c => c.id === clienteId);
  const produto = data.produtos.find(p => p.id === produtoId);

  const handleGenerate = () => {
    if (!cliente || !produto) { showToast('Selecione cliente e produto'); return; }
    if (!produto.contratoTemplate) { showToast('Este produto não tem template de contrato'); return; }
    const vars = {
      clienteNome: cliente.nome,
      clienteEmpresa: cliente.empresa,
      cpfCnpj: cliente.cpfCnpj,
      valor: valorPersonalizado || produto.preco.toLocaleString('pt-BR'),
      dataInicio: new Date(dataInicio).toLocaleDateString('pt-BR'),
      dataFim: dataFim ? new Date(dataFim).toLocaleDateString('pt-BR') : '___/___/______',
    };
    setPreview(generateContract(produto.contratoTemplate, vars));
  };

  const handleDownload = () => {
    if (!preview) return;
    const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrato_${cliente?.nome.replace(/\s+/g,'_')}_${produto?.nome.replace(/\s+/g,'_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Contrato baixado');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Gerador de Contratos</h1>
        <p className="text-gray-500 text-sm">Gere contratos automaticamente a partir dos templates dos produtos</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-1">
          <div className="bg-surface border border-border rounded-card p-5 space-y-4">
            <h3 className="text-white font-semibold">Dados do Contrato</h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Cliente *</label>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
                <option value="">Selecione</option>
                {data.clientes.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.empresa}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Produto / Serviço *</label>
              <select value={produtoId} onChange={e => setProdutoId(e.target.value)}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
                <option value="">Selecione</option>
                {data.produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            {produto && (
              <div className="p-3 bg-bg border border-primary/20 rounded-input">
                <p className="text-xs text-gray-500">Preço base do produto</p>
                <p className="text-primary font-bold">R$ {produto.preco.toLocaleString('pt-BR')}</p>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Valor do Contrato (R$) — opcional</label>
              <input type="text" value={valorPersonalizado} onChange={e => setValorPersonalizado(e.target.value)}
                placeholder={produto ? produto.preco.toLocaleString('pt-BR') : '0,00'}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Data de Início</label>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Data de Término</label>
              <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
            </div>

            <button onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-input text-sm font-medium transition-colors">
              <Eye size={15} /> Gerar Pré-visualização
            </button>
          </div>

          {/* Quick client info */}
          {cliente && (
            <div className="bg-surface border border-border rounded-card p-4 mt-4">
              <p className="text-xs text-gray-500 mb-2">Cliente selecionado</p>
              <p className="text-white font-semibold">{cliente.nome}</p>
              <p className="text-gray-400 text-sm">{cliente.empresa}</p>
              <p className="text-gray-500 text-xs mt-1">{cliente.cpfCnpj}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="col-span-2">
          {preview ? (
            <div className="bg-surface border border-border rounded-card h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-white font-semibold flex items-center gap-2"><FileText size={16} /> Pré-visualização do Contrato</h3>
                <div className="flex gap-2">
                  <button onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-input text-xs transition-colors">
                    <Download size={13} /> Baixar .txt
                  </button>
                  <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{preview}</pre>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-dashed border-border rounded-card h-full flex flex-col items-center justify-center text-gray-600">
              <FileText size={48} className="mb-4 text-gray-700" />
              <p className="text-lg font-medium text-gray-500">Pré-visualização do Contrato</p>
              <p className="text-sm mt-2">Selecione cliente e produto, depois clique em "Gerar"</p>
            </div>
          )}
        </div>
      </div>

      {/* Products with templates */}
      <div className="mt-6">
        <h3 className="text-white font-semibold mb-4">Templates Disponíveis</h3>
        <div className="grid grid-cols-3 gap-3">
          {data.produtos.filter(p => p.contratoTemplate).map(p => (
            <div key={p.id} className="bg-surface border border-border rounded-card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => { setProdutoId(p.id); }}>
              <FileText size={20} className="text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{p.nome}</p>
                <p className="text-gray-500 text-xs">{p.categoria}</p>
              </div>
            </div>
          ))}
          {data.produtos.filter(p => !p.contratoTemplate).map(p => (
            <div key={p.id} className="bg-surface border border-border/40 rounded-card p-4 flex items-center gap-3 opacity-40">
              <FileText size={20} className="text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-500 text-sm truncate">{p.nome}</p>
                <p className="text-gray-600 text-xs">Sem template</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
