export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_hora: string
          id: string
          observacoes: string | null
          oficina_id: string | null
          servicos: string[] | null
          status: string | null
          veiculo_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_hora: string
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          servicos?: string[] | null
          status?: string | null
          veiculo_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_hora?: string
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          servicos?: string[] | null
          status?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      assinaturas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          oficina_id: string
          plano_id: string
          status: string
          valor_cobrado: number | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          oficina_id: string
          plano_id: string
          status?: string
          valor_cobrado?: number | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          oficina_id?: string
          plano_id?: string
          status?: string
          valor_cobrado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinaturas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      automacoes_kanban: {
        Row: {
          acao: string | null
          coluna_id: string | null
          created_at: string | null
          id: string
          template_id: string | null
          tempo_minutos: number | null
          trigger_tipo: string | null
          webhook_url: string | null
        }
        Insert: {
          acao?: string | null
          coluna_id?: string | null
          created_at?: string | null
          id?: string
          template_id?: string | null
          tempo_minutos?: number | null
          trigger_tipo?: string | null
          webhook_url?: string | null
        }
        Update: {
          acao?: string | null
          coluna_id?: string | null
          created_at?: string | null
          id?: string
          template_id?: string | null
          tempo_minutos?: number | null
          trigger_tipo?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automacoes_kanban_coluna_id_fkey"
            columns: ["coluna_id"]
            isOneToOne: false
            referencedRelation: "kanban_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automacoes_kanban_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_mensagem"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_produtos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          estoque_atual: number | null
          estoque_minimo: number | null
          id: string
          nome: string
          oficina_id: string | null
          preco_unitario: number | null
          sku: string | null
          unidade: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          id?: string
          nome: string
          oficina_id?: string | null
          preco_unitario?: number | null
          sku?: string | null
          unidade?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          id?: string
          nome?: string
          oficina_id?: string | null
          preco_unitario?: number | null
          sku?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_produtos_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_servicos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          id: string
          nome: string
          oficina_id: string | null
          preco_base: number | null
          tempo_estimado: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome: string
          oficina_id?: string | null
          preco_base?: number | null
          tempo_estimado?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          oficina_id?: string | null
          preco_base?: number | null
          tempo_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_servicos_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          aniversario: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          oficina_id: string | null
          tags: string[] | null
          telefone: string | null
        }
        Insert: {
          aniversario?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          oficina_id?: string | null
          tags?: string[] | null
          telefone?: string | null
        }
        Update: {
          aniversario?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          oficina_id?: string | null
          tags?: string[] | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_oficina: {
        Row: {
          created_at: string | null
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance_name: string | null
          horarios: Json | null
          id: string
          oficina_id: string | null
          typebot_name: string | null
          typebot_url: string | null
          whaticket_modo: string | null
          whaticket_token: string | null
          whaticket_url: string | null
        }
        Insert: {
          created_at?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          horarios?: Json | null
          id?: string
          oficina_id?: string | null
          typebot_name?: string | null
          typebot_url?: string | null
          whaticket_modo?: string | null
          whaticket_token?: string | null
          whaticket_url?: string | null
        }
        Update: {
          created_at?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          horarios?: Json | null
          id?: string
          oficina_id?: string | null
          typebot_name?: string | null
          typebot_url?: string | null
          whaticket_modo?: string | null
          whaticket_token?: string | null
          whaticket_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_oficina_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: true
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_colunas: {
        Row: {
          cor: string | null
          created_at: string | null
          id: string
          nome: string
          oficina_id: string | null
          ordem: number
        }
        Insert: {
          cor?: string | null
          created_at?: string | null
          id?: string
          nome: string
          oficina_id?: string | null
          ordem: number
        }
        Update: {
          cor?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          oficina_id?: string | null
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanban_colunas_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          canal: string | null
          cliente_id: string | null
          created_at: string | null
          data_agendada: string | null
          id: string
          km_alvo: number | null
          mensagem: string | null
          oficina_id: string | null
          status: string | null
          tipo: string | null
          veiculo_id: string | null
        }
        Insert: {
          canal?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_agendada?: string | null
          id?: string
          km_alvo?: number | null
          mensagem?: string | null
          oficina_id?: string | null
          status?: string | null
          tipo?: string | null
          veiculo_id?: string | null
        }
        Update: {
          canal?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_agendada?: string | null
          id?: string
          km_alvo?: number | null
          mensagem?: string | null
          oficina_id?: string | null
          status?: string | null
          tipo?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      oficinas: {
        Row: {
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          plano_id: string | null
          slug: string | null
          status: string | null
          telefone: string | null
          trial_ate: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          plano_id?: string | null
          slug?: string | null
          status?: string | null
          telefone?: string | null
          trial_ate?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          plano_id?: string | null
          slug?: string | null
          status?: string | null
          telefone?: string | null
          trial_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oficinas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string | null
          coluna_id: string | null
          created_at: string | null
          data_agendada: string | null
          id: string
          km_entrada: number | null
          numero: string
          observacoes: string | null
          oficina_id: string | null
          prioridade: string | null
          reclamacao: string | null
          status_orcamento: string | null
          tags: string[] | null
          tecnico_id: string | null
          token_publico: string | null
          updated_at: string | null
          valor_total: number | null
          veiculo_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          coluna_id?: string | null
          created_at?: string | null
          data_agendada?: string | null
          id?: string
          km_entrada?: number | null
          numero: string
          observacoes?: string | null
          oficina_id?: string | null
          prioridade?: string | null
          reclamacao?: string | null
          status_orcamento?: string | null
          tags?: string[] | null
          tecnico_id?: string | null
          token_publico?: string | null
          updated_at?: string | null
          valor_total?: number | null
          veiculo_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          coluna_id?: string | null
          created_at?: string | null
          data_agendada?: string | null
          id?: string
          km_entrada?: number | null
          numero?: string
          observacoes?: string | null
          oficina_id?: string | null
          prioridade?: string | null
          reclamacao?: string | null
          status_orcamento?: string | null
          tags?: string[] | null
          tecnico_id?: string | null
          token_publico?: string | null
          updated_at?: string | null
          valor_total?: number | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_coluna_id_fkey"
            columns: ["coluna_id"]
            isOneToOne: false
            referencedRelation: "kanban_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      os_fotos: {
        Row: {
          created_at: string | null
          id: string
          os_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          os_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          os_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_fotos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      os_historico: {
        Row: {
          coluna_destino_id: string | null
          coluna_origem_id: string | null
          created_at: string | null
          id: string
          os_id: string | null
          usuario_id: string | null
        }
        Insert: {
          coluna_destino_id?: string | null
          coluna_origem_id?: string | null
          created_at?: string | null
          id?: string
          os_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          coluna_destino_id?: string | null
          coluna_origem_id?: string | null
          created_at?: string | null
          id?: string
          os_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_historico_coluna_destino_id_fkey"
            columns: ["coluna_destino_id"]
            isOneToOne: false
            referencedRelation: "kanban_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_coluna_origem_id_fkey"
            columns: ["coluna_origem_id"]
            isOneToOne: false
            referencedRelation: "kanban_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      os_itens: {
        Row: {
          created_at: string | null
          desconto: number | null
          id: string
          nome: string
          os_id: string | null
          preco_unitario: number | null
          quantidade: number | null
          tipo: string
          total: number | null
        }
        Insert: {
          created_at?: string | null
          desconto?: number | null
          id?: string
          nome: string
          os_id?: string | null
          preco_unitario?: number | null
          quantidade?: number | null
          tipo: string
          total?: number | null
        }
        Update: {
          created_at?: string | null
          desconto?: number | null
          id?: string
          nome?: string
          os_id?: string | null
          preco_unitario?: number | null
          quantidade?: number | null
          tipo?: string
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          funcionalidades: Json | null
          id: string
          limite_ordens_mes: number | null
          limite_usuarios: number | null
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          funcionalidades?: Json | null
          id?: string
          limite_ordens_mes?: number | null
          limite_usuarios?: number | null
          nome: string
          preco?: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          funcionalidades?: Json | null
          id?: string
          limite_ordens_mes?: number | null
          limite_usuarios?: number | null
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      super_admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      templates_mensagem: {
        Row: {
          canal: string | null
          conteudo: string | null
          created_at: string | null
          id: string
          nome: string
          oficina_id: string | null
          tipo: string | null
        }
        Insert: {
          canal?: string | null
          conteudo?: string | null
          created_at?: string | null
          id?: string
          nome: string
          oficina_id?: string | null
          tipo?: string | null
        }
        Update: {
          canal?: string | null
          conteudo?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          oficina_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_mensagem_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          cargo: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          oficina_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          oficina_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          oficina_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          cliente_id: string | null
          combustivel: string | null
          cor: string | null
          created_at: string | null
          id: string
          km_atual: number | null
          marca: string | null
          modelo: string | null
          observacoes: string | null
          oficina_id: string | null
          placa: string
        }
        Insert: {
          ano?: number | null
          cliente_id?: string | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          oficina_id?: string | null
          placa: string
        }
        Update: {
          ano?: number | null
          cliente_id?: string | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          oficina_id?: string | null
          placa?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_atualizar_oficina: {
        Args: {
          p_oficina_id: string
          p_plano_id?: string
          p_status?: string
          p_trial_ate?: string
        }
        Returns: undefined
      }
      admin_criar_oficina: {
        Args: {
          p_cnpj?: string
          p_dono_email?: string
          p_dono_nome?: string
          p_dono_senha?: string
          p_email?: string
          p_endereco?: string
          p_nome: string
          p_plano_id?: string
          p_status?: string
          p_telefone?: string
        }
        Returns: string
      }
      admin_editar_oficina: {
        Args: {
          p_cnpj?: string
          p_dono_email?: string
          p_dono_nome?: string
          p_dono_senha?: string
          p_dono_user_id?: string
          p_email?: string
          p_endereco?: string
          p_nome?: string
          p_oficina_id: string
          p_plano_id?: string
          p_status?: string
          p_telefone?: string
          p_trial_ate?: string
        }
        Returns: undefined
      }
      admin_excluir_oficina: {
        Args: { p_oficina_id: string }
        Returns: undefined
      }
      admin_listar_oficinas: {
        Args: never
        Returns: {
          cnpj: string
          created_at: string
          dono_email: string
          dono_id: string
          dono_nome: string
          email: string
          endereco: string
          id: string
          nome: string
          plano_id: string
          plano_nome: string
          plano_preco: number
          status: string
          telefone: string
          total_ordens: number
          total_usuarios: number
          trial_ate: string
          ultima_atividade: string
        }[]
      }
      criar_oficina_e_usuario: {
        Args: {
          nome_oficina: string
          nome_usuario: string
          p_email: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_oficina_id: { Args: never; Returns: string }
      get_public_order: { Args: { p_token: string }; Returns: Json }
      is_super_admin: { Args: never; Returns: boolean }
      update_public_order_status: {
        Args: { p_status: string; p_token: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
