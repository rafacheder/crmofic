// Domain types aligned with the Portuguese-named tables in Supabase.

export type Oficina = {
  id: string;
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  logo_url?: string | null;
  slug?: string | null;
  created_at?: string | null;
};

export type Usuario = {
  id: string;
  oficina_id: string | null;
  nome: string;
  email: string;
  cargo: string | null;
  ativo: boolean | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

export type KanbanColuna = {
  id: string;
  oficina_id: string | null;
  nome: string;
  ordem: number;
  cor: string | null;
  created_at?: string | null;
};

export type Cliente = {
  id: string;
  oficina_id: string | null;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  endereco?: string | null;
  tags?: string[] | null;
  aniversario?: string | null;
  created_at?: string | null;
};

export type Veiculo = {
  id: string;
  oficina_id: string | null;
  cliente_id: string | null;
  placa: string;
  marca?: string | null;
  modelo?: string | null;
  ano?: number | null;
  cor?: string | null;
  combustivel?: string | null;
  km_atual?: number | null;
  observacoes?: string | null;
  created_at?: string | null;
};

export type OrdemServico = {
  id: string;
  oficina_id: string | null;
  numero: string;
  cliente_id: string | null;
  veiculo_id: string | null;
  coluna_id: string | null;
  tecnico_id?: string | null;
  prioridade: string | null;
  status_orcamento?: string | null;
  reclamacao?: string | null;
  observacoes?: string | null;
  valor_total: number | null;
  km_entrada?: number | null;
  data_agendada?: string | null;
  tags?: string[] | null;
  token_publico?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  // joins
  cliente?: Cliente | null;
  veiculo?: Veiculo | null;
};

export type Agendamento = {
  id: string;
  oficina_id: string | null;
  cliente_id: string | null;
  veiculo_id: string | null;
  data_hora: string;
  status: string | null;
  observacoes?: string | null;
  servicos?: string[] | null;
  cliente?: Cliente | null;
  veiculo?: Veiculo | null;
};

export type Lembrete = {
  id: string;
  oficina_id: string | null;
  cliente_id: string | null;
  veiculo_id?: string | null;
  data_agendada: string | null;
  canal?: string | null;
  tipo?: string | null;
  mensagem?: string | null;
  status: string | null;
  km_alvo?: number | null;
  cliente?: Cliente | null;
};

export type CatalogoServico = {
  id: string;
  oficina_id: string | null;
  nome: string;
  categoria?: string | null;
  preco_base: number | null;
  tempo_estimado?: number | null;
  ativo: boolean | null;
};

export type CatalogoProduto = {
  id: string;
  oficina_id: string | null;
  nome: string;
  sku?: string | null;
  unidade: string | null;
  preco_unitario: number | null;
  estoque_atual: number | null;
  estoque_minimo: number | null;
  ativo: boolean | null;
};

export type OsItem = {
  id: string;
  os_id: string;
  tipo: 'servico' | 'produto';
  nome: string;
  quantidade: number;
  preco_unitario: number;
  desconto: number;
  total: number;
  created_at: string;
};

export type OsHistorico = {
  id: string;
  os_id: string;
  coluna_origem_id: string | null;
  coluna_destino_id: string | null;
  usuario_id: string | null;
  created_at: string;
};
