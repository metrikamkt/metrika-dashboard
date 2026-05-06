// ─── Lancamento (billing entry) ───────────────────────────────────────────────
export interface Lancamento {
  id: string;
  data: string;       // YYYY-MM-DD
  clienteId: string;
  clienteNome: string;
  produtoId: string;
  produtoNome: string;
  valor: number;
  nfNumero: string;
  descricao: string;
  mes: number;        // 1-12
  ano: number;
}

// ─── Custo (cost entry) ────────────────────────────────────────────────────────
export interface Custo {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'fixo' | 'variavel';
  categoria: string;
  data: string;
  mes: number;
  ano: number;
}

// ─── Cliente ──────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  cpfCnpj: string;
  produtoId: string;
  produtoNome: string;
  status: 'ativo' | 'inativo';
  dataCadastro: string;
  aniversario: string;
  notas: string;
  documentos: string[];
}

// ─── Produto ──────────────────────────────────────────────────────────────────
export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  descricao: string;
  contratoTemplate: string;
}

// ─── Pessoa (employee) ────────────────────────────────────────────────────────
export interface Pessoa {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  dataAdmissao: string;
  foto: string;
  kpis: { nome: string; valor: number; meta: number }[];
  descricao: string;
  funcoes: string[];
}

// ─── Lead (CRM) ───────────────────────────────────────────────────────────────
export type LeadEtapa = 'lead' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  whatsapp: string;
  email: string;
  etapa: LeadEtapa;
  produtoId: string;
  produtoNome: string;
  valor: number;
  dataCriacao: string;
  notas: string;
}

// ─── Demanda ──────────────────────────────────────────────────────────────────
export type DemandaPrioridade = 'urgente' | 'alta' | 'media' | 'baixa';
export type DemandaStatus = 'aberta' | 'em_andamento' | 'concluida';

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: DemandaPrioridade;
  responsavel: string;
  status: DemandaStatus;
  dataCriacao: string;
  dataVencimento: string;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
export interface Meta {
  id: string;
  nome: string;
  alvo: number;
  atual: number;
  responsavel: string;
  unidade: string;
  source?: 'crm_fechados'; // if set, 'atual' is auto-computed from CRM closed leads
}

// ─── Root state ───────────────────────────────────────────────────────────────
export interface MetrikaData {
  lancamentos: Lancamento[];
  custos: Custo[];
  clientes: Cliente[];
  produtos: Produto[];
  pessoas: Pessoa[];
  leads: Lead[];
  demandas: Demanda[];
  metas: Meta[];
  metaFaturamento: number;   // monthly revenue goal
  metaNovosClientes: number; // monthly new clients goal
}

// ─── Default data ─────────────────────────────────────────────────────────────
export const defaultData: MetrikaData = {
  // Lancamentos: Jan–Mai 2026
  lancamentos: [
    { id: 'l1', data: '2026-01-10', clienteId: 'c1', clienteNome: 'Grupo Alfa S.A.', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 85000, nfNumero: 'NF-001', descricao: 'Consultoria Q1', mes: 1, ano: 2026 },
    { id: 'l2', data: '2026-01-20', clienteId: 'c2', clienteNome: 'Beta Logística', produtoId: 'p2', produtoNome: 'Implementação ERP', valor: 120000, nfNumero: 'NF-002', descricao: 'Fase 1 ERP', mes: 1, ano: 2026 },
    { id: 'l3', data: '2026-01-28', clienteId: 'c3', clienteNome: 'Construtora Gama', produtoId: 'p3', produtoNome: 'Suporte Premium', valor: 18000, nfNumero: 'NF-003', descricao: 'Suporte Jan', mes: 1, ano: 2026 },
    { id: 'l4', data: '2026-02-05', clienteId: 'c4', clienteNome: 'Delta Varejo', produtoId: 'p4', produtoNome: 'Treinamento Corporativo', valor: 24000, nfNumero: 'NF-004', descricao: 'Treinamento equipe', mes: 2, ano: 2026 },
    { id: 'l5', data: '2026-02-14', clienteId: 'c1', clienteNome: 'Grupo Alfa S.A.', produtoId: 'p5', produtoNome: 'Licença SaaS', valor: 8900, nfNumero: 'NF-005', descricao: 'Licença Fev', mes: 2, ano: 2026 },
    { id: 'l6', data: '2026-02-22', clienteId: 'c5', clienteNome: 'Epsilon Tech', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 72000, nfNumero: 'NF-006', descricao: 'Diagnóstico estratégico', mes: 2, ano: 2026 },
    { id: 'l7', data: '2026-03-08', clienteId: 'c6', clienteNome: 'Zeta Saúde', produtoId: 'p2', produtoNome: 'Implementação ERP', valor: 95000, nfNumero: 'NF-007', descricao: 'Fase 2 ERP', mes: 3, ano: 2026 },
    { id: 'l8', data: '2026-03-15', clienteId: 'c3', clienteNome: 'Construtora Gama', produtoId: 'p3', produtoNome: 'Suporte Premium', valor: 18000, nfNumero: 'NF-008', descricao: 'Suporte Mar', mes: 3, ano: 2026 },
    { id: 'l9', data: '2026-03-25', clienteId: 'c7', clienteNome: 'Eta Educação', produtoId: 'p4', produtoNome: 'Treinamento Corporativo', valor: 36000, nfNumero: 'NF-009', descricao: 'Workshop liderança', mes: 3, ano: 2026 },
    { id: 'l10', data: '2026-04-04', clienteId: 'c2', clienteNome: 'Beta Logística', produtoId: 'p5', produtoNome: 'Licença SaaS', valor: 8900, nfNumero: 'NF-010', descricao: 'Licença Abr', mes: 4, ano: 2026 },
    { id: 'l11', data: '2026-04-11', clienteId: 'c8', clienteNome: 'Theta Finanças', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 110000, nfNumero: 'NF-011', descricao: 'Reestruturação', mes: 4, ano: 2026 },
    { id: 'l12', data: '2026-04-18', clienteId: 'c5', clienteNome: 'Epsilon Tech', produtoId: 'p3', produtoNome: 'Suporte Premium', valor: 18000, nfNumero: 'NF-012', descricao: 'Suporte Abr', mes: 4, ano: 2026 },
    { id: 'l13', data: '2026-04-28', clienteId: 'c9', clienteNome: 'Iota Indústria', produtoId: 'p2', produtoNome: 'Implementação ERP', valor: 140000, nfNumero: 'NF-013', descricao: 'ERP completo', mes: 4, ano: 2026 },
    { id: 'l14', data: '2026-05-02', clienteId: 'c10', clienteNome: 'Kappa Agro', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 65000, nfNumero: 'NF-014', descricao: 'Consultoria rural', mes: 5, ano: 2026 },
    { id: 'l15', data: '2026-05-03', clienteId: 'c4', clienteNome: 'Delta Varejo', produtoId: 'p5', produtoNome: 'Licença SaaS', valor: 17800, nfNumero: 'NF-015', descricao: 'Renovação anual', mes: 5, ano: 2026 },
  ],

  custos: [
    // Fixed – Jan 2026
    { id: 'cu1', descricao: 'Folha de pagamento', valor: 410000, tipo: 'fixo', categoria: 'RH', data: '2026-01-05', mes: 1, ano: 2026 },
    { id: 'cu2', descricao: 'Aluguel escritório', valor: 35000, tipo: 'fixo', categoria: 'Infra', data: '2026-01-05', mes: 1, ano: 2026 },
    { id: 'cu3', descricao: 'Tecnologia & Cloud', valor: 38000, tipo: 'fixo', categoria: 'TI', data: '2026-01-05', mes: 1, ano: 2026 },
    // Variable – Jan 2026
    { id: 'cu4', descricao: 'Comissões comerciais', valor: 48000, tipo: 'variavel', categoria: 'Comercial', data: '2026-01-31', mes: 1, ano: 2026 },
    { id: 'cu5', descricao: 'Viagens e deslocamento', valor: 12000, tipo: 'variavel', categoria: 'Operações', data: '2026-01-31', mes: 1, ano: 2026 },
    // Fixed – Fev 2026
    { id: 'cu6', descricao: 'Folha de pagamento', valor: 412000, tipo: 'fixo', categoria: 'RH', data: '2026-02-05', mes: 2, ano: 2026 },
    { id: 'cu7', descricao: 'Aluguel escritório', valor: 35000, tipo: 'fixo', categoria: 'Infra', data: '2026-02-05', mes: 2, ano: 2026 },
    { id: 'cu8', descricao: 'Tecnologia & Cloud', valor: 39000, tipo: 'fixo', categoria: 'TI', data: '2026-02-05', mes: 2, ano: 2026 },
    // Variable – Fev 2026
    { id: 'cu9', descricao: 'Comissões comerciais', valor: 52000, tipo: 'variavel', categoria: 'Comercial', data: '2026-02-28', mes: 2, ano: 2026 },
    // Fixed – Mar 2026
    { id: 'cu10', descricao: 'Folha de pagamento', valor: 415000, tipo: 'fixo', categoria: 'RH', data: '2026-03-05', mes: 3, ano: 2026 },
    { id: 'cu11', descricao: 'Aluguel escritório', valor: 35000, tipo: 'fixo', categoria: 'Infra', data: '2026-03-05', mes: 3, ano: 2026 },
    { id: 'cu12', descricao: 'Tecnologia & Cloud', valor: 39000, tipo: 'fixo', categoria: 'TI', data: '2026-03-05', mes: 3, ano: 2026 },
    // Variable – Mar 2026
    { id: 'cu13', descricao: 'Comissões comerciais', valor: 55000, tipo: 'variavel', categoria: 'Comercial', data: '2026-03-31', mes: 3, ano: 2026 },
    { id: 'cu14', descricao: 'Marketing digital', valor: 22000, tipo: 'variavel', categoria: 'Marketing', data: '2026-03-31', mes: 3, ano: 2026 },
    // Fixed – Abr 2026
    { id: 'cu15', descricao: 'Folha de pagamento', valor: 418000, tipo: 'fixo', categoria: 'RH', data: '2026-04-05', mes: 4, ano: 2026 },
    { id: 'cu16', descricao: 'Aluguel escritório', valor: 35000, tipo: 'fixo', categoria: 'Infra', data: '2026-04-05', mes: 4, ano: 2026 },
    { id: 'cu17', descricao: 'Tecnologia & Cloud', valor: 40000, tipo: 'fixo', categoria: 'TI', data: '2026-04-05', mes: 4, ano: 2026 },
    // Variable – Abr 2026
    { id: 'cu18', descricao: 'Comissões comerciais', valor: 58000, tipo: 'variavel', categoria: 'Comercial', data: '2026-04-30', mes: 4, ano: 2026 },
    { id: 'cu19', descricao: 'Viagens e deslocamento', valor: 14000, tipo: 'variavel', categoria: 'Operações', data: '2026-04-30', mes: 4, ano: 2026 },
    // Fixed – Mai 2026
    { id: 'cu20', descricao: 'Folha de pagamento', valor: 420000, tipo: 'fixo', categoria: 'RH', data: '2026-05-05', mes: 5, ano: 2026 },
    { id: 'cu21', descricao: 'Aluguel escritório', valor: 35000, tipo: 'fixo', categoria: 'Infra', data: '2026-05-05', mes: 5, ano: 2026 },
    { id: 'cu22', descricao: 'Tecnologia & Cloud', valor: 40000, tipo: 'fixo', categoria: 'TI', data: '2026-05-05', mes: 5, ano: 2026 },
  ],

  clientes: [
    { id: 'c1', nome: 'Carlos Andrade', empresa: 'Grupo Alfa S.A.', email: 'carlos@grupoalfa.com.br', whatsapp: '5511991234567', cpfCnpj: '12.345.678/0001-90', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', status: 'ativo', dataCadastro: '2025-08-15', aniversario: '1982-03-20', notas: 'Cliente desde 2025. Prefere reuniões às terças.', documentos: [] },
    { id: 'c2', nome: 'Fernanda Lima', empresa: 'Beta Logística', email: 'fernanda@betalog.com.br', whatsapp: '5511987654321', cpfCnpj: '98.765.432/0001-10', produtoId: 'p2', produtoNome: 'Implementação ERP', status: 'ativo', dataCadastro: '2025-09-01', aniversario: '1990-07-14', notas: 'Em fase de implementação ERP.', documentos: [] },
    { id: 'c3', nome: 'Roberto Gomes', empresa: 'Construtora Gama', email: 'roberto@gama.com.br', whatsapp: '5521998877665', cpfCnpj: '45.678.901/0001-23', produtoId: 'p3', produtoNome: 'Suporte Premium', status: 'ativo', dataCadastro: '2025-10-10', aniversario: '1975-11-30', notas: 'Utiliza suporte 24/7.', documentos: [] },
    { id: 'c4', nome: 'Ana Paula Souza', empresa: 'Delta Varejo', email: 'ana@deltavarejo.com.br', whatsapp: '5531996655443', cpfCnpj: '67.890.123/0001-45', produtoId: 'p4', produtoNome: 'Treinamento Corporativo', status: 'ativo', dataCadastro: '2025-11-05', aniversario: '1988-05-22', notas: 'Quer expandir treinamentos para filiais.', documentos: [] },
    { id: 'c5', nome: 'Lucas Ferreira', empresa: 'Epsilon Tech', email: 'lucas@epsilontech.com.br', whatsapp: '5511994433221', cpfCnpj: '23.456.789/0001-56', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', status: 'ativo', dataCadastro: '2025-12-01', aniversario: '1985-09-08', notas: '', documentos: [] },
    { id: 'c6', nome: 'Mariana Costa', empresa: 'Zeta Saúde', email: 'mariana@zetasaude.com.br', whatsapp: '5541993322110', cpfCnpj: '34.567.890/0001-67', produtoId: 'p2', produtoNome: 'Implementação ERP', status: 'ativo', dataCadastro: '2026-01-10', aniversario: '1992-12-03', notas: '', documentos: [] },
    { id: 'c7', nome: 'Paulo Henrique', empresa: 'Eta Educação', email: 'paulo@etaedu.com.br', whatsapp: '5511995544332', cpfCnpj: '56.789.012/0001-78', produtoId: 'p4', produtoNome: 'Treinamento Corporativo', status: 'ativo', dataCadastro: '2026-02-14', aniversario: '1980-02-28', notas: '', documentos: [] },
    { id: 'c8', nome: 'Juliana Rocha', empresa: 'Theta Finanças', email: 'juliana@thetafin.com.br', whatsapp: '5511996655443', cpfCnpj: '78.901.234/0001-89', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', status: 'ativo', dataCadastro: '2026-03-01', aniversario: '1987-06-15', notas: 'Alta prioridade — conta estratégica.', documentos: [] },
    { id: 'c9', nome: 'Diego Santos', empresa: 'Iota Indústria', email: 'diego@iotaind.com.br', whatsapp: '5511997766554', cpfCnpj: '89.012.345/0001-90', produtoId: 'p2', produtoNome: 'Implementação ERP', status: 'ativo', dataCadastro: '2026-03-20', aniversario: '1979-10-10', notas: '', documentos: [] },
    { id: 'c10', nome: 'Camila Nunes', empresa: 'Kappa Agro', email: 'camila@kappaagro.com.br', whatsapp: '5562998877665', cpfCnpj: '90.123.456/0001-01', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', status: 'ativo', dataCadastro: '2026-04-28', aniversario: '1994-01-17', notas: 'Novo cliente — onboarding em andamento.', documentos: [] },
  ],

  produtos: [
    { id: 'p1', nome: 'Consultoria Estratégica', categoria: 'Consultoria', preco: 280, descricao: 'Consultoria sob demanda com especialistas sênior. Valor por hora.', contratoTemplate: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSULTORIA\n\nContratante: {{clienteNome}} ({{clienteEmpresa}})\nCNPJ/CPF: {{cpfCnpj}}\n\nContratada: Metrika Marketing Ltda.\n\nObjeto: Prestação de serviços de Consultoria Estratégica pelo valor de R$ {{valor}}, conforme proposta aprovada.\n\nVigência: {{dataInicio}} a {{dataFim}}\n\nForma de pagamento: Conforme negociado em proposta.\n\nAs partes aceitam os termos e condições deste contrato.' },
    { id: 'p2', nome: 'Implementação ERP', categoria: 'Implementação', preco: 95000, descricao: 'Implementação completa de sistema ERP com suporte e treinamento.', contratoTemplate: 'CONTRATO DE IMPLEMENTAÇÃO DE SISTEMA ERP\n\nContratante: {{clienteNome}} ({{clienteEmpresa}})\nCNPJ/CPF: {{cpfCnpj}}\n\nContratada: Metrika Marketing Ltda.\n\nObjeto: Implementação de sistema ERP pelo valor total de R$ {{valor}}.\n\nPrazo de entrega: 90 dias corridos a partir da assinatura.\n\nVigência: {{dataInicio}} a {{dataFim}}\n\nForma de pagamento: 30% na assinatura, 40% na entrega e 30% após go-live.\n\nAs partes aceitam os termos e condições deste contrato.' },
    { id: 'p3', nome: 'Suporte Premium 24/7', categoria: 'Suporte', preco: 4500, descricao: 'Suporte técnico e operacional 24h/7 dias com SLA garantido.', contratoTemplate: 'CONTRATO DE SUPORTE PREMIUM\n\nContratante: {{clienteNome}} ({{clienteEmpresa}})\nCNPJ/CPF: {{cpfCnpj}}\n\nContratada: Metrika Marketing Ltda.\n\nObjeto: Serviços de Suporte Premium 24/7 pelo valor mensal de R$ {{valor}}.\n\nVigência: {{dataInicio}} a {{dataFim}} (renovação automática)\n\nSLA: Tempo de resposta máximo de 2 horas para incidentes críticos.\n\nAs partes aceitam os termos e condições deste contrato.' },
    { id: 'p4', nome: 'Treinamento Corporativo', categoria: 'Treinamento', preco: 12000, descricao: 'Treinamentos customizados por turma para equipes corporativas.', contratoTemplate: 'CONTRATO DE TREINAMENTO CORPORATIVO\n\nContratante: {{clienteNome}} ({{clienteEmpresa}})\nCNPJ/CPF: {{cpfCnpj}}\n\nContratada: Metrika Marketing Ltda.\n\nObjeto: Realização de treinamento corporativo pelo valor de R$ {{valor}} por turma.\n\nVigência: {{dataInicio}} a {{dataFim}}\n\nCarga horária: 16h por turma (2 dias)\n\nAs partes aceitam os termos e condições deste contrato.' },
    { id: 'p5', nome: 'Licença SaaS', categoria: 'Licenças', preco: 890, descricao: 'Acesso à plataforma Metrika com todos os módulos ativos.', contratoTemplate: 'CONTRATO DE LICENÇA DE SOFTWARE (SaaS)\n\nContratante: {{clienteNome}} ({{clienteEmpresa}})\nCNPJ/CPF: {{cpfCnpj}}\n\nContratada: Metrika Marketing Ltda.\n\nObjeto: Licença de uso da plataforma Metrika pelo valor de R$ {{valor}}/mês.\n\nVigência: {{dataInicio}} a {{dataFim}} (renovação automática)\n\nAcesso: Até 10 usuários simultâneos. Dados hospedados em nuvem com backup diário.\n\nAs partes aceitam os termos e condições deste contrato.' },
  ],

  pessoas: [
    { id: 'ps1', nome: 'Ricardo Mendes', cargo: 'Diretor Comercial', departamento: 'Comercial', email: 'ricardo@metrika.com.br', telefone: '11991234000', dataNascimento: '1980-04-15', dataAdmissao: '2020-03-01', foto: '', kpis: [{ nome: 'Receita gerada', valor: 480000, meta: 500000 }, { nome: 'Novos clientes', valor: 5, meta: 6 }], descricao: 'Responsável pela estratégia e equipe comercial.', funcoes: ['Gestão de equipe', 'Prospecção enterprise', 'Negociação de contratos'] },
    { id: 'ps2', nome: 'Beatriz Alves', cargo: 'Gerente de CS', departamento: 'Customer Success', email: 'beatriz@metrika.com.br', telefone: '11992345001', dataNascimento: '1990-09-22', dataAdmissao: '2021-06-01', foto: '', kpis: [{ nome: 'NPS', valor: 72, meta: 80 }, { nome: 'Churn contido', valor: 3, meta: 5 }], descricao: 'Lidera o time de sucesso do cliente e retenção.', funcoes: ['Onboarding', 'QBR com clientes', 'Gestão de churn'] },
    { id: 'ps3', nome: 'Thiago Carvalho', cargo: 'Tech Lead', departamento: 'Tecnologia', email: 'thiago@metrika.com.br', telefone: '11993456002', dataNascimento: '1985-12-08', dataAdmissao: '2022-01-15', foto: '', kpis: [{ nome: 'Uptime (%)', valor: 99.7, meta: 99.9 }, { nome: 'Bugs fechados', valor: 28, meta: 30 }], descricao: 'Responsável pela plataforma e integrações.', funcoes: ['Arquitetura de sistemas', 'Code review', 'Deploy e infra'] },
  ],

  leads: [
    { id: 'ld1', nome: 'Felipe Martins', empresa: 'Nova Indústrias', whatsapp: '5511998001122', email: 'felipe@novaind.com.br', etapa: 'lead', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 60000, dataCriacao: '2026-04-25', notas: 'Veio via LinkedIn' },
    { id: 'ld2', nome: 'Renata Silva', empresa: 'RS Construtora', whatsapp: '5521997002233', email: 'renata@rsconstrutora.com.br', etapa: 'qualificado', produtoId: 'p2', produtoNome: 'Implementação ERP', valor: 95000, dataCriacao: '2026-04-20', notas: 'Fez demo — interesse confirmado' },
    { id: 'ld3', nome: 'Bruno Castro', empresa: 'BC Tecnologia', whatsapp: '5511996003344', email: 'bruno@bctech.com.br', etapa: 'proposta', produtoId: 'p3', produtoNome: 'Suporte Premium', valor: 54000, dataCriacao: '2026-04-15', notas: 'Proposta enviada em 28/04' },
    { id: 'ld4', nome: 'Tatiana Freitas', empresa: 'TF Saúde', whatsapp: '5531995004455', email: 'tatiana@tfsaude.com.br', etapa: 'negociacao', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 120000, dataCriacao: '2026-04-10', notas: 'Aguardando aprovação da diretoria' },
    { id: 'ld5', nome: 'Eduardo Pires', empresa: 'EP Agro', whatsapp: '5562994005566', email: 'eduardo@epagro.com.br', etapa: 'fechado', produtoId: 'p5', produtoNome: 'Licença SaaS', valor: 10680, dataCriacao: '2026-04-05', notas: 'Fechado em 30/04' },
    { id: 'ld6', nome: 'Vanessa Melo', empresa: 'VM Varejo', whatsapp: '5511993006677', email: 'vanessa@vmvarejo.com.br', etapa: 'lead', produtoId: 'p4', produtoNome: 'Treinamento Corporativo', valor: 24000, dataCriacao: '2026-05-01', notas: 'Cold outreach' },
    { id: 'ld7', nome: 'Gustavo Lima', empresa: 'GL Fintech', whatsapp: '5511992007788', email: 'gustavo@glfintech.com.br', etapa: 'qualificado', produtoId: 'p1', produtoNome: 'Consultoria Estratégica', valor: 85000, dataCriacao: '2026-05-02', notas: 'Indicação do cliente Theta' },
    { id: 'ld8', nome: 'Natália Borges', empresa: 'NB Educação', whatsapp: '5521991008899', email: 'natalia@nbedu.com.br', etapa: 'perdido', produtoId: 'p2', produtoNome: 'Implementação ERP', valor: 95000, dataCriacao: '2026-03-15', notas: 'Escolheu concorrente por preço' },
  ],

  demandas: [
    { id: 'd1', titulo: 'Renovar contrato Grupo Alfa', descricao: 'Contrato vence em 15/06. Iniciar negociação de renovação com upgrade de plano.', prioridade: 'urgente', responsavel: 'Ricardo Mendes', status: 'aberta', dataCriacao: '2026-05-01', dataVencimento: '2026-05-10' },
    { id: 'd2', titulo: 'Apresentação Q2 para diretoria', descricao: 'Preparar deck com resultados do trimestre e projeções Q3.', prioridade: 'urgente', responsavel: 'Admin', status: 'em_andamento', dataCriacao: '2026-05-02', dataVencimento: '2026-05-08' },
    { id: 'd3', titulo: 'Onboarding Kappa Agro', descricao: 'Agendar kickoff e configurar acesso à plataforma para o novo cliente.', prioridade: 'alta', responsavel: 'Beatriz Alves', status: 'aberta', dataCriacao: '2026-05-02', dataVencimento: '2026-05-12' },
    { id: 'd4', titulo: 'Follow-up proposta BC Tecnologia', descricao: 'Proposta de suporte enviada. Ligar para Bruno Castro e verificar decisão.', prioridade: 'alta', responsavel: 'Ricardo Mendes', status: 'aberta', dataCriacao: '2026-05-01', dataVencimento: '2026-05-07' },
    { id: 'd5', titulo: 'Revisar SLA Zeta Saúde', descricao: 'Cliente reportou 3 incidentes acima do SLA. Revisar processo de atendimento.', prioridade: 'media', responsavel: 'Beatriz Alves', status: 'em_andamento', dataCriacao: '2026-04-28', dataVencimento: '2026-05-15' },
    { id: 'd6', titulo: 'Atualizar documentação técnica', descricao: 'Documentar novas integrações do módulo ERP.', prioridade: 'baixa', responsavel: 'Thiago Carvalho', status: 'aberta', dataCriacao: '2026-04-20', dataVencimento: '2026-05-30' },
  ],

  metas: [
    { id: 'm1', nome: 'Receita Mensal', alvo: 1300000, atual: 82800, responsavel: 'Diretoria', unidade: 'R$' },
    { id: 'm2', nome: 'Novos Clientes', alvo: 15, atual: 2, responsavel: 'Comercial', unidade: 'clientes' },
    { id: 'm3', nome: 'NPS Score', alvo: 80, atual: 72, responsavel: 'CS', unidade: 'pts' },
    { id: 'm4', nome: 'Churn Rate', alvo: 1.5, atual: 2.1, responsavel: 'CS', unidade: '%' },
    { id: 'm5', nome: 'Margem Bruta', alvo: 45, atual: 41.2, responsavel: 'Financeiro', unidade: '%' },
    { id: 'm6', nome: 'Leads no Funil', alvo: 50, atual: 7, responsavel: 'Comercial', unidade: 'leads' },
  ],

  metaFaturamento: 1300000,
  metaNovosClientes: 15,
};
