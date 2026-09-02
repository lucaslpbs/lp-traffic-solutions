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
      admin_users: {
        Row: {
          created_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atendentes_log: {
        Row: {
          criado_em: string
          id: number
          nome: string
          status_novo: boolean
        }
        Insert: {
          criado_em?: string
          id?: never
          nome: string
          status_novo: boolean
        }
        Update: {
          criado_em?: string
          id?: never
          nome?: string
          status_novo?: boolean
        }
        Relationships: []
      }
      atendentes_status: {
        Row: {
          ativo: boolean
          atualizado_em: string
          bot_id_kommo: string | null
          id: number
          nome: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          bot_id_kommo?: string | null
          id?: never
          nome: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          bot_id_kommo?: string | null
          id?: never
          nome?: string
        }
        Relationships: []
      }
      clientes_removidos: {
        Row: {
          id: string
          nome_cliente: string | null
          removido_em: string | null
          removido_por: string | null
          user_id: string
        }
        Insert: {
          id?: string
          nome_cliente?: string | null
          removido_em?: string | null
          removido_por?: string | null
          user_id: string
        }
        Update: {
          id?: string
          nome_cliente?: string | null
          removido_em?: string | null
          removido_por?: string | null
          user_id?: string
        }
        Relationships: []
      }
      colaborador_clientes: {
        Row: {
          client_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_clientes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_clientes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["user_id"]
          },
        ]
      }
      colaborador_sessoes: {
        Row: {
          created_at: string
          sessao: string
          user_id: string
        }
        Insert: {
          created_at?: string
          sessao: string
          user_id: string
        }
        Update: {
          created_at?: string
          sessao?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_sessoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["user_id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string
          email: string
          nome: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email: string
          nome: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      form_leads: {
        Row: {
          company: string
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          revenue: string | null
          service: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          revenue?: string | null
          service?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          revenue?: string | null
          service?: string | null
        }
        Relationships: []
      }
      gestao_clientes: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          dia_vencimento: number
          endereco: string | null
          fluxo_alerta_saldo_ativo: boolean
          fluxo_alerta_saldo_id: string | null
          fluxo_relatorio_diario_ativo: boolean
          fluxo_relatorio_diario_id: string | null
          fluxo_resumos_ativo: boolean
          fluxo_resumos_id: string | null
          fluxos_criados: boolean | null
          id: string
          instagram: string | null
          limite_minimo_saldo: number | null
          link_page_ativo: boolean
          link_page_bio: string | null
          link_page_cor_fundo: string | null
          link_page_cor_primaria: string | null
          link_page_cor_secundaria: string | null
          link_page_links: Json
          link_page_slug: string | null
          link_page_titulo: string | null
          login_email: string | null
          logo_url: string | null
          nome_cliente: string
          numero_conta_anuncio: string
          numero_grupo_whatsapp: string
          numero_whatsapp_cliente: string
          observacoes: string | null
          parcelas_detalhes: Json | null
          plano_personalizado: boolean | null
          responsavel_interno: string | null
          segmento: string | null
          status: string
          status_cobranca: string | null
          tipo_contrato: string
          ultimo_contato_cobranca: string | null
          ultimo_relatorio_enviado: string | null
          updated_at: string | null
          valor_mensalidade: number
          webhook_cadastro_disparado: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento: number
          endereco?: string | null
          fluxo_alerta_saldo_ativo?: boolean
          fluxo_alerta_saldo_id?: string | null
          fluxo_relatorio_diario_ativo?: boolean
          fluxo_relatorio_diario_id?: string | null
          fluxo_resumos_ativo?: boolean
          fluxo_resumos_id?: string | null
          fluxos_criados?: boolean | null
          id?: string
          instagram?: string | null
          limite_minimo_saldo?: number | null
          link_page_ativo?: boolean
          link_page_bio?: string | null
          link_page_cor_fundo?: string | null
          link_page_cor_primaria?: string | null
          link_page_cor_secundaria?: string | null
          link_page_links?: Json
          link_page_slug?: string | null
          link_page_titulo?: string | null
          login_email?: string | null
          logo_url?: string | null
          nome_cliente: string
          numero_conta_anuncio: string
          numero_grupo_whatsapp: string
          numero_whatsapp_cliente: string
          observacoes?: string | null
          parcelas_detalhes?: Json | null
          plano_personalizado?: boolean | null
          responsavel_interno?: string | null
          segmento?: string | null
          status?: string
          status_cobranca?: string | null
          tipo_contrato?: string
          ultimo_contato_cobranca?: string | null
          ultimo_relatorio_enviado?: string | null
          updated_at?: string | null
          valor_mensalidade: number
          webhook_cadastro_disparado?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento?: number
          endereco?: string | null
          fluxo_alerta_saldo_ativo?: boolean
          fluxo_alerta_saldo_id?: string | null
          fluxo_relatorio_diario_ativo?: boolean
          fluxo_relatorio_diario_id?: string | null
          fluxo_resumos_ativo?: boolean
          fluxo_resumos_id?: string | null
          fluxos_criados?: boolean | null
          id?: string
          instagram?: string | null
          limite_minimo_saldo?: number | null
          link_page_ativo?: boolean
          link_page_bio?: string | null
          link_page_cor_fundo?: string | null
          link_page_cor_primaria?: string | null
          link_page_cor_secundaria?: string | null
          link_page_links?: Json
          link_page_slug?: string | null
          link_page_titulo?: string | null
          login_email?: string | null
          logo_url?: string | null
          nome_cliente?: string
          numero_conta_anuncio?: string
          numero_grupo_whatsapp?: string
          numero_whatsapp_cliente?: string
          observacoes?: string | null
          parcelas_detalhes?: Json | null
          plano_personalizado?: boolean | null
          responsavel_interno?: string | null
          segmento?: string | null
          status?: string
          status_cobranca?: string | null
          tipo_contrato?: string
          ultimo_contato_cobranca?: string | null
          ultimo_relatorio_enviado?: string | null
          updated_at?: string | null
          valor_mensalidade?: number
          webhook_cadastro_disparado?: boolean | null
        }
        Relationships: []
      }
      influenciador_agendamentos: {
        Row: {
          client_id: string
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          influenciador_id: string
          instagram_contato: string | null
          nome_contato: string
          observacoes: string | null
          origem: string
          servico: string
          status: string
          telefone_contato: string
          webhook_confirmado_disparado: boolean
          webhook_criado_disparado: boolean
        }
        Insert: {
          client_id: string
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          influenciador_id: string
          instagram_contato?: string | null
          nome_contato: string
          observacoes?: string | null
          origem: string
          servico: string
          status?: string
          telefone_contato: string
          webhook_confirmado_disparado?: boolean
          webhook_criado_disparado?: boolean
        }
        Update: {
          client_id?: string
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          influenciador_id?: string
          instagram_contato?: string | null
          nome_contato?: string
          observacoes?: string | null
          origem?: string
          servico?: string
          status?: string
          telefone_contato?: string
          webhook_confirmado_disparado?: boolean
          webhook_criado_disparado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "influenciador_agendamentos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influenciador_agendamentos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influenciador_agendamentos_influenciador_id_fkey"
            columns: ["influenciador_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
      influenciador_clientes: {
        Row: {
          client_id: string
          created_at: string
          influenciador_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          influenciador_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          influenciador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influenciador_clientes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influenciador_clientes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influenciador_clientes_influenciador_id_fkey"
            columns: ["influenciador_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
      influenciador_horarios: {
        Row: {
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          influenciador_id: string
          servico: string | null
        }
        Insert: {
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          influenciador_id: string
          servico?: string | null
        }
        Update: {
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          influenciador_id?: string
          servico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influenciador_horarios_influenciador_id_fkey"
            columns: ["influenciador_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
      influenciadores: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string
          user_id: string
          valor_feed: number | null
          valor_online: number | null
          valor_presencial: number | null
          valor_stories: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          telefone: string
          user_id: string
          valor_feed?: number | null
          valor_online?: number | null
          valor_presencial?: number | null
          valor_stories?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string
          user_id?: string
          valor_feed?: number | null
          valor_online?: number | null
          valor_presencial?: number | null
          valor_stories?: number | null
        }
        Relationships: []
      }
      instance_disconnections: {
        Row: {
          created_at: string
          disconnect_reason: string | null
          disconnected_at: string
          id: number
          instance_name: string
          instance_owner: string | null
          reminder_sent: boolean
          reminder_sent_at: string | null
        }
        Insert: {
          created_at?: string
          disconnect_reason?: string | null
          disconnected_at: string
          id?: never
          instance_name: string
          instance_owner?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
        }
        Update: {
          created_at?: string
          disconnect_reason?: string | null
          disconnected_at?: string
          id?: never
          instance_name?: string
          instance_owner?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
        }
        Relationships: []
      }
      kommo_bots_config: {
        Row: {
          bot_id: string
          chave: string
          descricao: string | null
        }
        Insert: {
          bot_id: string
          chave: string
          descricao?: string | null
        }
        Update: {
          bot_id?: string
          chave?: string
          descricao?: string | null
        }
        Relationships: []
      }
      kommo_leads_oftalmologia: {
        Row: {
          arquivo: string | null
          atualizado_em_supabase: string
          contato_cargo: string | null
          contato_celular: string | null
          contato_email_comercial: string | null
          contato_email_outro: string | null
          contato_email_pessoal: string | null
          contato_fax: string | null
          contato_principal: string | null
          contato_telefone_comercial: string | null
          contato_telefone_direto: string | null
          contato_telefone_outro: string | null
          contato_telefone_residencial: string | null
          contato_termos_usuario: string | null
          criado_em_supabase: string
          criado_por: string | null
          data_contrato: string | null
          data_criada: string | null
          data_horario_consulta: string | null
          desconto: string | null
          empresa_contato: string | null
          empresa_lead: string | null
          endereco_clinica: string | null
          especialidade: string | null
          especialista: string | null
          etapa_lead: string | null
          fbclid: string | null
          fechada_em: string | null
          funil_vendas: string | null
          gclid: string | null
          gclientid: string | null
          kommo_lead_id: string
          lead_tags: string | null
          lead_titulo: string | null
          modificado_por: string | null
          motivo_perda: string | null
          motivos_contato: string | null
          numero_contrato: string | null
          numero_convenio: string | null
          pagamento: string | null
          proxima_tarefa: string | null
          proximo_agendamento: string | null
          raw_kommo: Json | null
          referrer: string | null
          ttad_id: string | null
          ttad_name: string | null
          ultima_modificacao: string | null
          usuario_responsavel: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_referrer: string | null
          utm_source: string | null
          utm_term: string | null
          valor_venda: number | null
        }
        Insert: {
          arquivo?: string | null
          atualizado_em_supabase?: string
          contato_cargo?: string | null
          contato_celular?: string | null
          contato_email_comercial?: string | null
          contato_email_outro?: string | null
          contato_email_pessoal?: string | null
          contato_fax?: string | null
          contato_principal?: string | null
          contato_telefone_comercial?: string | null
          contato_telefone_direto?: string | null
          contato_telefone_outro?: string | null
          contato_telefone_residencial?: string | null
          contato_termos_usuario?: string | null
          criado_em_supabase?: string
          criado_por?: string | null
          data_contrato?: string | null
          data_criada?: string | null
          data_horario_consulta?: string | null
          desconto?: string | null
          empresa_contato?: string | null
          empresa_lead?: string | null
          endereco_clinica?: string | null
          especialidade?: string | null
          especialista?: string | null
          etapa_lead?: string | null
          fbclid?: string | null
          fechada_em?: string | null
          funil_vendas?: string | null
          gclid?: string | null
          gclientid?: string | null
          kommo_lead_id: string
          lead_tags?: string | null
          lead_titulo?: string | null
          modificado_por?: string | null
          motivo_perda?: string | null
          motivos_contato?: string | null
          numero_contrato?: string | null
          numero_convenio?: string | null
          pagamento?: string | null
          proxima_tarefa?: string | null
          proximo_agendamento?: string | null
          raw_kommo?: Json | null
          referrer?: string | null
          ttad_id?: string | null
          ttad_name?: string | null
          ultima_modificacao?: string | null
          usuario_responsavel?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_referrer?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_venda?: number | null
        }
        Update: {
          arquivo?: string | null
          atualizado_em_supabase?: string
          contato_cargo?: string | null
          contato_celular?: string | null
          contato_email_comercial?: string | null
          contato_email_outro?: string | null
          contato_email_pessoal?: string | null
          contato_fax?: string | null
          contato_principal?: string | null
          contato_telefone_comercial?: string | null
          contato_telefone_direto?: string | null
          contato_telefone_outro?: string | null
          contato_telefone_residencial?: string | null
          contato_termos_usuario?: string | null
          criado_em_supabase?: string
          criado_por?: string | null
          data_contrato?: string | null
          data_criada?: string | null
          data_horario_consulta?: string | null
          desconto?: string | null
          empresa_contato?: string | null
          empresa_lead?: string | null
          endereco_clinica?: string | null
          especialidade?: string | null
          especialista?: string | null
          etapa_lead?: string | null
          fbclid?: string | null
          fechada_em?: string | null
          funil_vendas?: string | null
          gclid?: string | null
          gclientid?: string | null
          kommo_lead_id?: string
          lead_tags?: string | null
          lead_titulo?: string | null
          modificado_por?: string | null
          motivo_perda?: string | null
          motivos_contato?: string | null
          numero_contrato?: string | null
          numero_convenio?: string | null
          pagamento?: string | null
          proxima_tarefa?: string | null
          proximo_agendamento?: string | null
          raw_kommo?: Json | null
          referrer?: string | null
          ttad_id?: string | null
          ttad_name?: string | null
          ultima_modificacao?: string | null
          usuario_responsavel?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_referrer?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_venda?: number | null
        }
        Relationships: []
      }
      koru_funil_interno_snapshot: {
        Row: {
          canal_origem: string | null
          cargo_contato: string | null
          celular_contato: string | null
          contato_principal: string | null
          created_at_db: string
          criado_por: string | null
          data_criada: string | null
          email_comercial_contato: string | null
          email_pessoal_contato: string | null
          empresa_contato: string | null
          empresa_lead: string | null
          etapa_lead: string | null
          fax_contato: string | null
          fbclid: string | null
          fechada_em: string | null
          funil_vendas: string | null
          gclid: string | null
          gclientid: string | null
          id: number
          kommo_lead_id: number
          lead_tags: string | null
          lead_titulo: string | null
          lead_usuario_responsavel: string | null
          modificado_por: string | null
          nota_1: string | null
          nota_2: string | null
          nota_3: string | null
          nota_4: string | null
          nota_5: string | null
          outro_email_contato: string | null
          outro_telefone_contato: string | null
          produto: string | null
          proxima_tarefa: string | null
          proximo_agendamento: string | null
          qualificacao: string | null
          referrer: string | null
          tel_direto_com_contato: string | null
          telefone_comercial_contato: string | null
          telefone_residencial_contato: string | null
          termos_usuario_contato: string | null
          ultima_modificacao: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_referrer: string | null
          utm_source: string | null
          utm_term: string | null
          venda: number | null
        }
        Insert: {
          canal_origem?: string | null
          cargo_contato?: string | null
          celular_contato?: string | null
          contato_principal?: string | null
          created_at_db?: string
          criado_por?: string | null
          data_criada?: string | null
          email_comercial_contato?: string | null
          email_pessoal_contato?: string | null
          empresa_contato?: string | null
          empresa_lead?: string | null
          etapa_lead?: string | null
          fax_contato?: string | null
          fbclid?: string | null
          fechada_em?: string | null
          funil_vendas?: string | null
          gclid?: string | null
          gclientid?: string | null
          id?: number
          kommo_lead_id: number
          lead_tags?: string | null
          lead_titulo?: string | null
          lead_usuario_responsavel?: string | null
          modificado_por?: string | null
          nota_1?: string | null
          nota_2?: string | null
          nota_3?: string | null
          nota_4?: string | null
          nota_5?: string | null
          outro_email_contato?: string | null
          outro_telefone_contato?: string | null
          produto?: string | null
          proxima_tarefa?: string | null
          proximo_agendamento?: string | null
          qualificacao?: string | null
          referrer?: string | null
          tel_direto_com_contato?: string | null
          telefone_comercial_contato?: string | null
          telefone_residencial_contato?: string | null
          termos_usuario_contato?: string | null
          ultima_modificacao?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_referrer?: string | null
          utm_source?: string | null
          utm_term?: string | null
          venda?: number | null
        }
        Update: {
          canal_origem?: string | null
          cargo_contato?: string | null
          celular_contato?: string | null
          contato_principal?: string | null
          created_at_db?: string
          criado_por?: string | null
          data_criada?: string | null
          email_comercial_contato?: string | null
          email_pessoal_contato?: string | null
          empresa_contato?: string | null
          empresa_lead?: string | null
          etapa_lead?: string | null
          fax_contato?: string | null
          fbclid?: string | null
          fechada_em?: string | null
          funil_vendas?: string | null
          gclid?: string | null
          gclientid?: string | null
          id?: number
          kommo_lead_id?: number
          lead_tags?: string | null
          lead_titulo?: string | null
          lead_usuario_responsavel?: string | null
          modificado_por?: string | null
          nota_1?: string | null
          nota_2?: string | null
          nota_3?: string | null
          nota_4?: string | null
          nota_5?: string | null
          outro_email_contato?: string | null
          outro_telefone_contato?: string | null
          produto?: string | null
          proxima_tarefa?: string | null
          proximo_agendamento?: string | null
          qualificacao?: string | null
          referrer?: string | null
          tel_direto_com_contato?: string | null
          telefone_comercial_contato?: string | null
          telefone_residencial_contato?: string | null
          termos_usuario_contato?: string | null
          ultima_modificacao?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_referrer?: string | null
          utm_source?: string | null
          utm_term?: string | null
          venda?: number | null
        }
        Relationships: []
      }
      lead_status_history: {
        Row: {
          account_subdomain: string | null
          created_at_db: string | null
          data_evento: string
          etapa_anterior_id: number | null
          etapa_anterior_nome: string | null
          etapa_id: number
          etapa_nome: string | null
          event_id: string
          id: number
          lead_id: number
          lead_nome: string | null
          origem: string | null
          pipeline_id: number
          pipeline_nome: string | null
        }
        Insert: {
          account_subdomain?: string | null
          created_at_db?: string | null
          data_evento: string
          etapa_anterior_id?: number | null
          etapa_anterior_nome?: string | null
          etapa_id: number
          etapa_nome?: string | null
          event_id: string
          id?: never
          lead_id: number
          lead_nome?: string | null
          origem?: string | null
          pipeline_id: number
          pipeline_nome?: string | null
        }
        Update: {
          account_subdomain?: string | null
          created_at_db?: string | null
          data_evento?: string
          etapa_anterior_id?: number | null
          etapa_anterior_nome?: string | null
          etapa_id?: number
          etapa_nome?: string | null
          event_id?: string
          id?: never
          lead_id?: number
          lead_nome?: string | null
          origem?: string | null
          pipeline_id?: number
          pipeline_nome?: string | null
        }
        Relationships: []
      }
      leads_koru: {
        Row: {
          account_id: number | null
          account_subdomain: string | null
          contato_id: number | null
          contato_nome: string | null
          created_at_db: string
          data_hora_atualizacao: string | null
          data_hora_criacao_lead: string | null
          data_hora_etapa: string | null
          email: string | null
          empresa: string | null
          etapa_anterior_id: number | null
          etapa_id: number | null
          etapa_nome: string | null
          id: number
          lead_criado_em: string | null
          lead_id: number | null
          lead_nome: string | null
          old_etapa_id: number | null
          old_pipeline_id: number | null
          payload_bruto: string | null
          pipeline_id: number | null
          pipeline_nome: string | null
          produto: string | null
          responsavel: string | null
          responsavel_id: number | null
          status: string | null
          tags: string | null
          telefone: string | null
          tipo_evento: string | null
          valor: number | null
        }
        Insert: {
          account_id?: number | null
          account_subdomain?: string | null
          contato_id?: number | null
          contato_nome?: string | null
          created_at_db?: string
          data_hora_atualizacao?: string | null
          data_hora_criacao_lead?: string | null
          data_hora_etapa?: string | null
          email?: string | null
          empresa?: string | null
          etapa_anterior_id?: number | null
          etapa_id?: number | null
          etapa_nome?: string | null
          id?: number
          lead_criado_em?: string | null
          lead_id?: number | null
          lead_nome?: string | null
          old_etapa_id?: number | null
          old_pipeline_id?: number | null
          payload_bruto?: string | null
          pipeline_id?: number | null
          pipeline_nome?: string | null
          produto?: string | null
          responsavel?: string | null
          responsavel_id?: number | null
          status?: string | null
          tags?: string | null
          telefone?: string | null
          tipo_evento?: string | null
          valor?: number | null
        }
        Update: {
          account_id?: number | null
          account_subdomain?: string | null
          contato_id?: number | null
          contato_nome?: string | null
          created_at_db?: string
          data_hora_atualizacao?: string | null
          data_hora_criacao_lead?: string | null
          data_hora_etapa?: string | null
          email?: string | null
          empresa?: string | null
          etapa_anterior_id?: number | null
          etapa_id?: number | null
          etapa_nome?: string | null
          id?: number
          lead_criado_em?: string | null
          lead_id?: number | null
          lead_nome?: string | null
          old_etapa_id?: number | null
          old_pipeline_id?: number | null
          payload_bruto?: string | null
          pipeline_id?: number | null
          pipeline_nome?: string | null
          produto?: string | null
          responsavel?: string | null
          responsavel_id?: number | null
          status?: string | null
          tags?: string | null
          telefone?: string | null
          tipo_evento?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      ranking_clientes_finais: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      ranking_comissoes_indicacao: {
        Row: {
          cliente_fechado_id: string
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          indicador_client_id: string
          observacao: string | null
          resgate_id: string | null
          status: string
          ticket_valor: number
        }
        Insert: {
          cliente_fechado_id: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          indicador_client_id: string
          observacao?: string | null
          resgate_id?: string | null
          status?: string
          ticket_valor: number
        }
        Update: {
          cliente_fechado_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          indicador_client_id?: string
          observacao?: string | null
          resgate_id?: string | null
          status?: string
          ticket_valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_comissoes_indicacao_cliente_fechado_id_fkey"
            columns: ["cliente_fechado_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_comissoes_indicacao_cliente_fechado_id_fkey"
            columns: ["cliente_fechado_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_comissoes_indicacao_resgate_id_fkey"
            columns: ["resgate_id"]
            isOneToOne: false
            referencedRelation: "ranking_resgates_comissao"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_config_acoes: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string
          id: string
          pontos: number
          tipo_acao: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao: string
          id?: string
          pontos: number
          tipo_acao: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string
          id?: string
          pontos?: number
          tipo_acao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ranking_config_geral: {
        Row: {
          chave: string
          descricao: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          chave: string
          descricao?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          chave?: string
          descricao?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      ranking_config_niveis: {
        Row: {
          created_at: string | null
          estrela: number
          id: string
          nivel: string
          ordem: number
          tipo_meta: string
          updated_at: string | null
          valor_minimo: number
        }
        Insert: {
          created_at?: string | null
          estrela: number
          id?: string
          nivel: string
          ordem: number
          tipo_meta: string
          updated_at?: string | null
          valor_minimo: number
        }
        Update: {
          created_at?: string | null
          estrela?: number
          id?: string
          nivel?: string
          ordem?: number
          tipo_meta?: string
          updated_at?: string | null
          valor_minimo?: number
        }
        Relationships: []
      }
      ranking_config_pacotes_comissao: {
        Row: {
          created_at: string | null
          id: string
          quantidade_fechamentos: number
          updated_at: string | null
          valor_reais: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantidade_fechamentos: number
          updated_at?: string | null
          valor_reais: number
        }
        Update: {
          created_at?: string | null
          id?: string
          quantidade_fechamentos?: number
          updated_at?: string | null
          valor_reais?: number
        }
        Relationships: []
      }
      ranking_config_placas: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string | null
          valor_acumulado_minimo: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          ordem: number
          updated_at?: string | null
          valor_acumulado_minimo: number
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string | null
          valor_acumulado_minimo?: number
        }
        Relationships: []
      }
      ranking_config_premios: {
        Row: {
          ativo: boolean
          created_at: string | null
          custo_real: number
          id: string
          nome: string
          pontos_custo: number
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          custo_real: number
          id?: string
          nome: string
          pontos_custo: number
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          custo_real?: number
          id?: string
          nome?: string
          pontos_custo?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ranking_perfis: {
        Row: {
          apelido: string | null
          client_id: string
          foto_url: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          apelido?: string | null
          client_id: string
          foto_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          apelido?: string | null
          client_id?: string
          foto_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ranking_placas_clientes: {
        Row: {
          atingido_em: string
          client_id: string
          entregue: boolean
          entregue_em: string | null
          id: string
          observacao: string | null
          placa_id: string
        }
        Insert: {
          atingido_em?: string
          client_id: string
          entregue?: boolean
          entregue_em?: string | null
          id?: string
          observacao?: string | null
          placa_id: string
        }
        Update: {
          atingido_em?: string
          client_id?: string
          entregue?: boolean
          entregue_em?: string | null
          id?: string
          observacao?: string | null
          placa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_placas_clientes_placa_id_fkey"
            columns: ["placa_id"]
            isOneToOne: false
            referencedRelation: "ranking_config_placas"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_pontos_acoes: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          client_id: string
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          motivo_recusa: string | null
          observacao: string | null
          pontos: number
          status: string
          tipo_acao: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          motivo_recusa?: string | null
          observacao?: string | null
          pontos: number
          status?: string
          tipo_acao: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          motivo_recusa?: string | null
          observacao?: string | null
          pontos?: number
          status?: string
          tipo_acao?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_pontos_acoes_tipo_acao_fkey"
            columns: ["tipo_acao"]
            isOneToOne: false
            referencedRelation: "ranking_config_acoes"
            referencedColumns: ["tipo_acao"]
          },
        ]
      }
      ranking_resgates: {
        Row: {
          client_id: string
          created_by: string | null
          data: string
          entregue_em: string | null
          id: string
          observacao: string | null
          pontos_gastos: number
          premio_id: string
          premio_nome: string
          status: string
        }
        Insert: {
          client_id: string
          created_by?: string | null
          data?: string
          entregue_em?: string | null
          id?: string
          observacao?: string | null
          pontos_gastos: number
          premio_id: string
          premio_nome: string
          status?: string
        }
        Update: {
          client_id?: string
          created_by?: string | null
          data?: string
          entregue_em?: string | null
          id?: string
          observacao?: string | null
          pontos_gastos?: number
          premio_id?: string
          premio_nome?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_resgates_premio_id_fkey"
            columns: ["premio_id"]
            isOneToOne: false
            referencedRelation: "ranking_config_premios"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_resgates_comissao: {
        Row: {
          created_by: string | null
          data: string
          id: string
          indicador_client_id: string
          observacao: string | null
          pacote_id: string
          pago_em: string | null
          quantidade_fechamentos: number
          status: string
          valor_reais: number
        }
        Insert: {
          created_by?: string | null
          data?: string
          id?: string
          indicador_client_id: string
          observacao?: string | null
          pacote_id: string
          pago_em?: string | null
          quantidade_fechamentos: number
          status?: string
          valor_reais: number
        }
        Update: {
          created_by?: string | null
          data?: string
          id?: string
          indicador_client_id?: string
          observacao?: string | null
          pacote_id?: string
          pago_em?: string | null
          quantidade_fechamentos?: number
          status?: string
          valor_reais?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_resgates_comissao_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "ranking_config_pacotes_comissao"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_vendas: {
        Row: {
          aprovada_em: string | null
          aprovada_por: string | null
          client_id: string
          cliente_final_id: string | null
          created_at: string | null
          created_by: string | null
          data: string
          descricao: string | null
          foto_url: string | null
          id: string
          motivo_recusa: string | null
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          aprovada_em?: string | null
          aprovada_por?: string | null
          client_id: string
          cliente_final_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          motivo_recusa?: string | null
          status?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          aprovada_em?: string | null
          aprovada_por?: string | null
          client_id?: string
          cliente_final_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          motivo_recusa?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_vendas_cliente_final_id_fkey"
            columns: ["cliente_final_id"]
            isOneToOne: false
            referencedRelation: "ranking_clientes_finais"
            referencedColumns: ["id"]
          },
        ]
      }
      sistema_chamados: {
        Row: {
          client_id: string
          concluido_at: string | null
          created_at: string | null
          created_by: string
          id: string
          mensagem: string
          respondido_at: string | null
          respondido_por: string | null
          resposta_admin: string | null
          status: string
        }
        Insert: {
          client_id: string
          concluido_at?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          mensagem: string
          respondido_at?: string | null
          respondido_por?: string | null
          resposta_admin?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          concluido_at?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          mensagem?: string
          respondido_at?: string | null
          respondido_por?: string | null
          resposta_admin?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sistema_chamados_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sistema_chamados_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      sistema_demandas: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          prazo: string | null
          prioridade: string | null
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          prazo?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          prazo?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sistema_demandas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sistema_demandas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      sistema_fluxos: {
        Row: {
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          nome: string
          responsavel_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome: string
          responsavel_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          responsavel_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sistema_metas: {
        Row: {
          ano: number
          concluida: boolean | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          mes: number
          titulo: string
          updated_at: string | null
          valor_atual: number | null
          valor_meta: number | null
        }
        Insert: {
          ano: number
          concluida?: boolean | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          mes: number
          titulo: string
          updated_at?: string | null
          valor_atual?: number | null
          valor_meta?: number | null
        }
        Update: {
          ano?: number
          concluida?: boolean | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          mes?: number
          titulo?: string
          updated_at?: string | null
          valor_atual?: number | null
          valor_meta?: number | null
        }
        Relationships: []
      }
      sistema_otimizacoes: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          observacoes: string | null
          otimizado: boolean
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          data: string
          id?: string
          observacoes?: string | null
          otimizado?: boolean
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          observacoes?: string | null
          otimizado?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sistema_otimizacoes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sistema_otimizacoes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      users_clients: {
        Row: {
          client_id: string
          created_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "gestao_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "linktree_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      war_room_metrics: {
        Row: {
          client_key: string
          created_at: string | null
          id: string
          metrics: Json
          updated_at: string | null
        }
        Insert: {
          client_key: string
          created_at?: string | null
          id?: string
          metrics?: Json
          updated_at?: string | null
        }
        Update: {
          client_key?: string
          created_at?: string | null
          id?: string
          metrics?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      linktree_publico: {
        Row: {
          bio: string | null
          cor_fundo: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          id: string | null
          links: Json | null
          logo_url: string | null
          nome_cliente: string | null
          slug: string | null
          titulo: string | null
        }
        Insert: {
          bio?: string | null
          cor_fundo?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          id?: string | null
          links?: Json | null
          logo_url?: string | null
          nome_cliente?: string | null
          slug?: string | null
          titulo?: string | null
        }
        Update: {
          bio?: string | null
          cor_fundo?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          id?: string | null
          links?: Json | null
          logo_url?: string | null
          nome_cliente?: string | null
          slug?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cliente_tem_acesso_client_id: {
        Args: { p_client_id: string; p_user_id: string }
        Returns: boolean
      }
      cliente_tem_influenciador_vinculado: {
        Args: { p_influenciador_id: string; p_user_id: string }
        Returns: boolean
      }
      colaborador_tem_acesso_cliente: {
        Args: { p_client_id: string; p_user_id: string }
        Returns: boolean
      }
      colaborador_tem_sessao: {
        Args: { p_sessao: string; p_user_id: string }
        Returns: boolean
      }
      eh_dono_influenciador: {
        Args: { p_influenciador_id: string; p_user_id: string }
        Returns: boolean
      }
      influenciador_tem_cliente: {
        Args: { p_client_id: string; p_influenciador_id: string }
        Returns: boolean
      }
      list_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          user_id: string
        }[]
      }
      ranking_faturamento_cliente: {
        Args: { p_client_id: string }
        Returns: {
          faturamento_acumulado: number
          faturamento_mes_atual: number
          maior_faturamento_mensal: number
          meses_com_faturamento: number
          meses_contrato_ativo: number
        }[]
      }
      ranking_geral: {
        Args: { p_fim?: string; p_inicio?: string }
        Returns: {
          apelido: string
          client_id: string
          foto_url: string
          maior_venda: number
          nome_cliente: string
          posicao: number
          qtd_vendas: number
          total_vendido: number
          ultima_venda: string
        }[]
      }
      ranking_nivel_cliente: {
        Args: { p_client_id: string }
        Returns: {
          estrela_atual: number
          faturamento_acumulado: number
          faturamento_mes_atual: number
          maior_faturamento_mensal: number
          meses_com_faturamento: number
          meses_contrato_ativo: number
          nivel_atual: string
          ordem_atual: number
          proximo_estrela: number
          proximo_nivel: string
          proximo_tipo_meta: string
          proximo_valor_minimo: number
        }[]
      }
      ranking_saldo_fechamentos_indicacao: {
        Args: { p_client_id: string }
        Returns: number
      }
      ranking_saldo_pontos: { Args: { p_client_id: string }; Returns: number }
      ranking_saldo_pontos_disponivel: {
        Args: { p_client_id: string }
        Returns: number
      }
      update_linktree_page: {
        Args: {
          p_ativo: boolean
          p_bio: string
          p_cor_fundo: string
          p_cor_primaria: string
          p_cor_secundaria: string
          p_links: Json
          p_titulo: string
        }
        Returns: undefined
      }
      user_has_client_access:
        | { Args: { client_id: string; user_id: string }; Returns: boolean }
        | { Args: { client_id: string; user_id: string }; Returns: boolean }
      user_is_admin: { Args: { user_id: string }; Returns: boolean }
      user_is_colaborador: { Args: { user_id: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
