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
      anos_letivos: {
        Row: {
          ano: number
          escola_id: string
          id: string
          status: string
        }
        Insert: {
          ano: number
          escola_id: string
          id?: string
          status?: string
        }
        Update: {
          ano?: number
          escola_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "anos_letivos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_contribuicoes: {
        Row: {
          area_contribuicao: string
          avaliacao_id: string
          created_at: string
          created_by: string | null
          escola_id: string
          id: string
          implicacoes_participacao: string | null
          observacoes: string
          profissional_id: string
          recomendacoes_escolares: string | null
          updated_at: string
        }
        Insert: {
          area_contribuicao: string
          avaliacao_id: string
          created_at?: string
          created_by?: string | null
          escola_id: string
          id?: string
          implicacoes_participacao?: string | null
          observacoes: string
          profissional_id: string
          recomendacoes_escolares?: string | null
          updated_at?: string
        }
        Update: {
          area_contribuicao?: string
          avaliacao_id?: string
          created_at?: string
          created_by?: string | null
          escola_id?: string
          id?: string
          implicacoes_participacao?: string | null
          observacoes?: string
          profissional_id?: string
          recomendacoes_escolares?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_contribuicoes_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes_ingresso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_contribuicoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_contribuicoes_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_contribuicoes_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_contribuicoes_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          avaliacao_id: string
          campo_alterado: string
          contribuicao_id: string | null
          escola_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          avaliacao_id: string
          campo_alterado: string
          contribuicao_id?: string | null
          escola_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          avaliacao_id?: string
          campo_alterado?: string
          contribuicao_id?: string | null
          escola_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_contribuicoes_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_contribuicoes_auditoria_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes_ingresso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_contribuicoes_auditoria_contribuicao_id_fkey"
            columns: ["contribuicao_id"]
            isOneToOne: false
            referencedRelation: "avaliacao_contribuicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_contribuicoes_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_relatorios: {
        Row: {
          arquivo_path: string
          avaliacao_atualizada_em: string
          avaliacao_id: string
          escola_id: string
          estudante_id: string
          gerado_em: string
          gerado_por: string | null
          id: string
          tipo: string
          versao: number
        }
        Insert: {
          arquivo_path: string
          avaliacao_atualizada_em: string
          avaliacao_id: string
          escola_id: string
          estudante_id: string
          gerado_em?: string
          gerado_por?: string | null
          id?: string
          tipo: string
          versao: number
        }
        Update: {
          arquivo_path?: string
          avaliacao_atualizada_em?: string
          avaliacao_id?: string
          escola_id?: string
          estudante_id?: string
          gerado_em?: string
          gerado_por?: string | null
          id?: string
          tipo?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_relatorios_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes_ingresso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_relatorios_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_relatorios_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_relatorios_gerado_por_fkey"
            columns: ["gerado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_ingresso: {
        Row: {
          areas_apoio: string[] | null
          assinaturas: string | null
          barreiras_identificadas: string | null
          contexto_comunitario: string | null
          contexto_escolar: string | null
          contexto_familiar: string | null
          contexto_sociocultural: string | null
          created_at: string
          created_by: string | null
          data_inicio: string | null
          data_termino: string | null
          dimensao_participacao: string | null
          encaminhamento_recomendado: string | null
          equipe_responsavel_ids: string[] | null
          escola_id: string
          estudante_id: string
          fatores_facilitadores: string | null
          habilidades_conceituais: string | null
          habilidades_praticas: string | null
          habilidades_sociais: string | null
          historico_escolar: string | null
          id: string
          informacoes_familia: string | null
          justificativa_elegibilidade: string | null
          necessidades_especificas: string | null
          nivel_apoio: string | null
          oferta_pretendida_id: string | null
          organizacao_pretendida_id: string | null
          orientacoes_pai: string | null
          parecer_equipe: string | null
          recomendacao_elegibilidade: string | null
          status_avaliacao: string
          updated_at: string
        }
        Insert: {
          areas_apoio?: string[] | null
          assinaturas?: string | null
          barreiras_identificadas?: string | null
          contexto_comunitario?: string | null
          contexto_escolar?: string | null
          contexto_familiar?: string | null
          contexto_sociocultural?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          dimensao_participacao?: string | null
          encaminhamento_recomendado?: string | null
          equipe_responsavel_ids?: string[] | null
          escola_id: string
          estudante_id: string
          fatores_facilitadores?: string | null
          habilidades_conceituais?: string | null
          habilidades_praticas?: string | null
          habilidades_sociais?: string | null
          historico_escolar?: string | null
          id?: string
          informacoes_familia?: string | null
          justificativa_elegibilidade?: string | null
          necessidades_especificas?: string | null
          nivel_apoio?: string | null
          oferta_pretendida_id?: string | null
          organizacao_pretendida_id?: string | null
          orientacoes_pai?: string | null
          parecer_equipe?: string | null
          recomendacao_elegibilidade?: string | null
          status_avaliacao?: string
          updated_at?: string
        }
        Update: {
          areas_apoio?: string[] | null
          assinaturas?: string | null
          barreiras_identificadas?: string | null
          contexto_comunitario?: string | null
          contexto_escolar?: string | null
          contexto_familiar?: string | null
          contexto_sociocultural?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          dimensao_participacao?: string | null
          encaminhamento_recomendado?: string | null
          equipe_responsavel_ids?: string[] | null
          escola_id?: string
          estudante_id?: string
          fatores_facilitadores?: string | null
          habilidades_conceituais?: string | null
          habilidades_praticas?: string | null
          habilidades_sociais?: string | null
          historico_escolar?: string | null
          id?: string
          informacoes_familia?: string | null
          justificativa_elegibilidade?: string | null
          necessidades_especificas?: string | null
          nivel_apoio?: string | null
          oferta_pretendida_id?: string | null
          organizacao_pretendida_id?: string | null
          orientacoes_pai?: string | null
          parecer_equipe?: string | null
          recomendacao_elegibilidade?: string | null
          status_avaliacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_ingresso_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_ingresso_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_ingresso_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: true
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_ingresso_oferta_pretendida_id_fkey"
            columns: ["oferta_pretendida_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_ingresso_organizacao_pretendida_id_fkey"
            columns: ["organizacao_pretendida_id"]
            isOneToOne: false
            referencedRelation: "etapas_ciclos"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_ingresso_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          avaliacao_id: string
          campo_alterado: string
          escola_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          avaliacao_id: string
          campo_alterado: string
          escola_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          avaliacao_id?: string
          campo_alterado?: string
          escola_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_ingresso_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_ingresso_auditoria_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes_ingresso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_ingresso_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      componentes_curriculares: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      condicoes_estudante: {
        Row: {
          cid: string | null
          created_at: string
          created_by: string | null
          documento_id: string | null
          escola_id: string
          estudante_id: string
          id: string
          observacoes: string | null
          tipo_condicao: string
          updated_at: string
        }
        Insert: {
          cid?: string | null
          created_at?: string
          created_by?: string | null
          documento_id?: string | null
          escola_id: string
          estudante_id: string
          id?: string
          observacoes?: string | null
          tipo_condicao: string
          updated_at?: string
        }
        Update: {
          cid?: string | null
          created_at?: string
          created_by?: string | null
          documento_id?: string | null
          escola_id?: string
          estudante_id?: string
          id?: string
          observacoes?: string | null
          tipo_condicao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "condicoes_estudante_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_estudante_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos_estudante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_estudante_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_estudante_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      condicoes_estudante_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          condicao_id: string | null
          escola_id: string
          estudante_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          condicao_id?: string | null
          escola_id: string
          estudante_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          condicao_id?: string | null
          escola_id?: string
          estudante_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condicoes_estudante_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_estudante_auditoria_condicao_id_fkey"
            columns: ["condicao_id"]
            isOneToOne: false
            referencedRelation: "condicoes_estudante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_estudante_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_estudante_auditoria_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_escolares: {
        Row: {
          created_at: string
          created_by: string | null
          data_encerramento: string | null
          data_ingresso: string | null
          escola_id: string
          escola_origem: string | null
          estudante_id: string
          forma_ingresso: string | null
          forma_origem: string | null
          historico_transferencia: string | null
          id: string
          motivo_encerramento: string | null
          observacoes: string | null
          rede_origem: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_encerramento?: string | null
          data_ingresso?: string | null
          escola_id: string
          escola_origem?: string | null
          estudante_id: string
          forma_ingresso?: string | null
          forma_origem?: string | null
          historico_transferencia?: string | null
          id?: string
          motivo_encerramento?: string | null
          observacoes?: string | null
          rede_origem?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_encerramento?: string | null
          data_ingresso?: string | null
          escola_id?: string
          escola_origem?: string | null
          estudante_id?: string
          forma_ingresso?: string | null
          forma_origem?: string | null
          historico_transferencia?: string | null
          id?: string
          motivo_encerramento?: string | null
          observacoes?: string | null
          rede_origem?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_escolares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_escolares_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_escolares_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: true
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_escolares_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          dados_escolares_id: string
          escola_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          dados_escolares_id: string
          escola_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          dados_escolares_id?: string
          escola_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_escolares_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_escolares_auditoria_dados_escolares_id_fkey"
            columns: ["dados_escolares_id"]
            isOneToOne: false
            referencedRelation: "dados_escolares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_escolares_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_estudante: {
        Row: {
          arquivo_nome: string | null
          arquivo_path: string | null
          conferido_por: string | null
          created_at: string
          created_by: string | null
          data_envio: string | null
          escola_id: string
          estudante_id: string
          forma_entrega: string | null
          id: string
          motivo_nao_se_aplica: string | null
          nome_documento: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_path?: string | null
          conferido_por?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string | null
          escola_id: string
          estudante_id: string
          forma_entrega?: string | null
          id?: string
          motivo_nao_se_aplica?: string | null
          nome_documento?: string | null
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_path?: string | null
          conferido_por?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string | null
          escola_id?: string
          estudante_id?: string
          forma_entrega?: string | null
          id?: string
          motivo_nao_se_aplica?: string | null
          nome_documento?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_estudante_conferido_por_fkey"
            columns: ["conferido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_estudante_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          documento_id: string | null
          escola_id: string
          estudante_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          documento_id?: string | null
          escola_id: string
          estudante_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          documento_id?: string | null
          escola_id?: string
          estudante_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_estudante_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_auditoria_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos_estudante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_auditoria_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_estudante_versoes: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          documento_id: string
          enviado_em: string
          enviado_por: string | null
          escola_id: string
          estudante_id: string
          id: string
          versao: number
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          documento_id: string
          enviado_em?: string
          enviado_por?: string | null
          escola_id: string
          estudante_id: string
          id?: string
          versao: number
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          documento_id?: string
          enviado_em?: string
          enviado_por?: string | null
          escola_id?: string
          estudante_id?: string
          id?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_estudante_versoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos_estudante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_versoes_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_versoes_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_estudante_versoes_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas: {
        Row: {
          bairro: string | null
          cep: string | null
          codigo_escola: string | null
          complemento: string | null
          coordenador_email: string | null
          coordenador_fone: string | null
          coordenador_nome: string | null
          created_at: string
          diretor_email: string | null
          diretor_fone: string | null
          diretor_nome: string | null
          email_institucional: string | null
          fone_institucional: string | null
          id: string
          logradouro: string | null
          modalidade: string
          municipio: string | null
          nome_oficial: string
          nome_usual: string | null
          nre_referencia: string | null
          numero: string | null
          status: string
          tipo_escola: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          codigo_escola?: string | null
          complemento?: string | null
          coordenador_email?: string | null
          coordenador_fone?: string | null
          coordenador_nome?: string | null
          created_at?: string
          diretor_email?: string | null
          diretor_fone?: string | null
          diretor_nome?: string | null
          email_institucional?: string | null
          fone_institucional?: string | null
          id?: string
          logradouro?: string | null
          modalidade?: string
          municipio?: string | null
          nome_oficial: string
          nome_usual?: string | null
          nre_referencia?: string | null
          numero?: string | null
          status?: string
          tipo_escola?: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          codigo_escola?: string | null
          complemento?: string | null
          coordenador_email?: string | null
          coordenador_fone?: string | null
          coordenador_nome?: string | null
          created_at?: string
          diretor_email?: string | null
          diretor_fone?: string | null
          diretor_nome?: string | null
          email_institucional?: string | null
          fone_institucional?: string | null
          id?: string
          logradouro?: string | null
          modalidade?: string
          municipio?: string | null
          nome_oficial?: string
          nome_usual?: string | null
          nre_referencia?: string | null
          numero?: string | null
          status?: string
          tipo_escola?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      escolas_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          escola_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          escola_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          escola_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escolas_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escolas_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      estudante_autorizados_retirada: {
        Row: {
          created_at: string
          escola_id: string
          estudante_id: string
          id: string
          nome: string
          telefone: string
          vinculo: string
        }
        Insert: {
          created_at?: string
          escola_id: string
          estudante_id: string
          id?: string
          nome: string
          telefone: string
          vinculo: string
        }
        Update: {
          created_at?: string
          escola_id?: string
          estudante_id?: string
          id?: string
          nome?: string
          telefone?: string
          vinculo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudante_autorizados_retirada_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudante_autorizados_retirada_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes: {
        Row: {
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          cor_raca: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          data_nascimento: string
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_complemento: string | null
          endereco_logradouro: string | null
          endereco_municipio: string | null
          endereco_numero: string | null
          endereco_uf: string | null
          escola_id: string
          filiacao_mae: string | null
          filiacao_pai: string | null
          foto_url: string | null
          id: string
          nacionalidade: string | null
          naturalidade: string | null
          nome_completo: string
          nome_social: string | null
          numero_documento: string | null
          orgao_emissor_uf: string | null
          responsavel_principal_nome: string | null
          responsavel_principal_parentesco: string | null
          responsavel_principal_pode_retirar: boolean
          responsavel_principal_telefone: string | null
          segundo_responsavel_nome: string | null
          segundo_responsavel_parentesco: string | null
          segundo_responsavel_pode_retirar: boolean
          segundo_responsavel_telefone: string | null
          sexo: string | null
          situacao: string
          tipo_documento_identificacao: string | null
          updated_at: string
        }
        Insert: {
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          cor_raca?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento: string
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_municipio?: string | null
          endereco_numero?: string | null
          endereco_uf?: string | null
          escola_id: string
          filiacao_mae?: string | null
          filiacao_pai?: string | null
          foto_url?: string | null
          id?: string
          nacionalidade?: string | null
          naturalidade?: string | null
          nome_completo: string
          nome_social?: string | null
          numero_documento?: string | null
          orgao_emissor_uf?: string | null
          responsavel_principal_nome?: string | null
          responsavel_principal_parentesco?: string | null
          responsavel_principal_pode_retirar?: boolean
          responsavel_principal_telefone?: string | null
          segundo_responsavel_nome?: string | null
          segundo_responsavel_parentesco?: string | null
          segundo_responsavel_pode_retirar?: boolean
          segundo_responsavel_telefone?: string | null
          sexo?: string | null
          situacao?: string
          tipo_documento_identificacao?: string | null
          updated_at?: string
        }
        Update: {
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          cor_raca?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_municipio?: string | null
          endereco_numero?: string | null
          endereco_uf?: string | null
          escola_id?: string
          filiacao_mae?: string | null
          filiacao_pai?: string | null
          foto_url?: string | null
          id?: string
          nacionalidade?: string | null
          naturalidade?: string | null
          nome_completo?: string
          nome_social?: string | null
          numero_documento?: string | null
          orgao_emissor_uf?: string | null
          responsavel_principal_nome?: string | null
          responsavel_principal_parentesco?: string | null
          responsavel_principal_pode_retirar?: boolean
          responsavel_principal_telefone?: string | null
          segundo_responsavel_nome?: string | null
          segundo_responsavel_parentesco?: string | null
          segundo_responsavel_pode_retirar?: boolean
          segundo_responsavel_telefone?: string | null
          sexo?: string | null
          situacao?: string
          tipo_documento_identificacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          escola_id: string
          estudante_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          escola_id: string
          estudante_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          escola_id?: string
          estudante_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_auditoria_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      etapas_ciclos: {
        Row: {
          escola_id: string
          id: string
          nome: string
          oferta_id: string
          ordem: number | null
        }
        Insert: {
          escola_id: string
          id?: string
          nome: string
          oferta_id: string
          ordem?: number | null
        }
        Update: {
          escola_id?: string
          id?: string
          nome?: string
          oferta_id?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "etapas_ciclos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etapas_ciclos_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenedoras: {
        Row: {
          bairro: string
          cep: string
          cnpj: string
          complemento: string | null
          created_at: string
          email_institucional: string
          escola_id: string
          fone_institucional: string
          id: string
          logradouro: string
          municipio: string
          nome_fantasia: string
          numero: string
          presidente_cpf: string
          presidente_email: string
          presidente_fone: string
          presidente_nome: string
          razao_social: string
          site: string | null
          status: string
          uf: string
          updated_at: string
          whatsapp_institucional: string | null
        }
        Insert: {
          bairro: string
          cep: string
          cnpj: string
          complemento?: string | null
          created_at?: string
          email_institucional: string
          escola_id: string
          fone_institucional: string
          id?: string
          logradouro: string
          municipio: string
          nome_fantasia: string
          numero: string
          presidente_cpf: string
          presidente_email: string
          presidente_fone: string
          presidente_nome: string
          razao_social: string
          site?: string | null
          status?: string
          uf: string
          updated_at?: string
          whatsapp_institucional?: string | null
        }
        Update: {
          bairro?: string
          cep?: string
          cnpj?: string
          complemento?: string | null
          created_at?: string
          email_institucional?: string
          escola_id?: string
          fone_institucional?: string
          id?: string
          logradouro?: string
          municipio?: string
          nome_fantasia?: string
          numero?: string
          presidente_cpf?: string
          presidente_email?: string
          presidente_fone?: string
          presidente_nome?: string
          razao_social?: string
          site?: string | null
          status?: string
          uf?: string
          updated_at?: string
          whatsapp_institucional?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mantenedoras_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: true
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenedoras_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          id: string
          mantenedora_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          id?: string
          mantenedora_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          id?: string
          mantenedora_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mantenedoras_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mantenedoras_auditoria_mantenedora_id_fkey"
            columns: ["mantenedora_id"]
            isOneToOne: false
            referencedRelation: "mantenedoras"
            referencedColumns: ["id"]
          },
        ]
      }
      matrizes_curriculares: {
        Row: {
          id: string
          nome: string
          oferta_id: string
        }
        Insert: {
          id?: string
          nome: string
          oferta_id: string
        }
        Update: {
          id?: string
          nome?: string
          oferta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matrizes_curriculares_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas: {
        Row: {
          id: string
          nome: string
          slug: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      perfil_funcional_estudante: {
        Row: {
          alergias_restricoes: string | null
          apoio_alimentacao: boolean | null
          apoio_avd: boolean | null
          apoio_avd_checklist: string[] | null
          apoio_higiene: boolean | null
          apoio_locomocao: boolean | null
          created_at: string
          created_by: string | null
          escola_id: string
          estudante_id: string
          id: string
          medicacao_detalhes: string | null
          meio_comunicacao: string | null
          necessita_medicacao: boolean | null
          o_que_ajuda: string | null
          outras_informacoes: string | null
          recursos_acessibilidade: string[] | null
          recursos_caa: string[] | null
          seguranca_cuidados: string | null
          situacoes_atencao: string | null
          updated_at: string
        }
        Insert: {
          alergias_restricoes?: string | null
          apoio_alimentacao?: boolean | null
          apoio_avd?: boolean | null
          apoio_avd_checklist?: string[] | null
          apoio_higiene?: boolean | null
          apoio_locomocao?: boolean | null
          created_at?: string
          created_by?: string | null
          escola_id: string
          estudante_id: string
          id?: string
          medicacao_detalhes?: string | null
          meio_comunicacao?: string | null
          necessita_medicacao?: boolean | null
          o_que_ajuda?: string | null
          outras_informacoes?: string | null
          recursos_acessibilidade?: string[] | null
          recursos_caa?: string[] | null
          seguranca_cuidados?: string | null
          situacoes_atencao?: string | null
          updated_at?: string
        }
        Update: {
          alergias_restricoes?: string | null
          apoio_alimentacao?: boolean | null
          apoio_avd?: boolean | null
          apoio_avd_checklist?: string[] | null
          apoio_higiene?: boolean | null
          apoio_locomocao?: boolean | null
          created_at?: string
          created_by?: string | null
          escola_id?: string
          estudante_id?: string
          id?: string
          medicacao_detalhes?: string | null
          meio_comunicacao?: string | null
          necessita_medicacao?: boolean | null
          o_que_ajuda?: string | null
          outras_informacoes?: string | null
          recursos_acessibilidade?: string[] | null
          recursos_caa?: string[] | null
          seguranca_cuidados?: string | null
          situacoes_atencao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_funcional_estudante_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_funcional_estudante_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_funcional_estudante_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: true
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_funcional_estudante_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          escola_id: string
          estudante_id: string
          id: string
          perfil_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          escola_id: string
          estudante_id: string
          id?: string
          perfil_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          escola_id?: string
          estudante_id?: string
          id?: string
          perfil_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfil_funcional_estudante_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_funcional_estudante_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_funcional_estudante_auditoria_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_funcional_estudante_auditoria_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfil_funcional_estudante"
            referencedColumns: ["id"]
          },
        ]
      }
      turma_componentes: {
        Row: {
          componente_id: string
          id: string
          turma_id: string
        }
        Insert: {
          componente_id: string
          id?: string
          turma_id: string
        }
        Update: {
          componente_id?: string
          id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_componentes_componente_id_fkey"
            columns: ["componente_id"]
            isOneToOne: false
            referencedRelation: "componentes_curriculares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_componentes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo_id: string
          areas_conhecimento: string[] | null
          campos_experiencias: string[] | null
          capacidade: number | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          direitos_aprendizagem: string[] | null
          eixos_funcionais: string[] | null
          escola_id: string
          etapa_ciclo_id: string
          etapa_do_ciclo: string | null
          id: string
          matriz_curricular_id: string
          nome: string
          objetivo_geral: string | null
          observacoes: string | null
          oferta_id: string
          status: string
          turno_id: string
          unidades_ocupacionais: string[] | null
        }
        Insert: {
          ano_letivo_id: string
          areas_conhecimento?: string[] | null
          campos_experiencias?: string[] | null
          capacidade?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          direitos_aprendizagem?: string[] | null
          eixos_funcionais?: string[] | null
          escola_id: string
          etapa_ciclo_id: string
          etapa_do_ciclo?: string | null
          id?: string
          matriz_curricular_id: string
          nome: string
          objetivo_geral?: string | null
          observacoes?: string | null
          oferta_id: string
          status?: string
          turno_id: string
          unidades_ocupacionais?: string[] | null
        }
        Update: {
          ano_letivo_id?: string
          areas_conhecimento?: string[] | null
          campos_experiencias?: string[] | null
          capacidade?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          direitos_aprendizagem?: string[] | null
          eixos_funcionais?: string[] | null
          escola_id?: string
          etapa_ciclo_id?: string
          etapa_do_ciclo?: string | null
          id?: string
          matriz_curricular_id?: string
          nome?: string
          objetivo_geral?: string | null
          observacoes?: string | null
          oferta_id?: string
          status?: string
          turno_id?: string
          unidades_ocupacionais?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_ano_letivo_id_fkey"
            columns: ["ano_letivo_id"]
            isOneToOne: false
            referencedRelation: "anos_letivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_etapa_ciclo_id_fkey"
            columns: ["etapa_ciclo_id"]
            isOneToOne: false
            referencedRelation: "etapas_ciclos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_matriz_curricular_id_fkey"
            columns: ["matriz_curricular_id"]
            isOneToOne: false
            referencedRelation: "matrizes_curriculares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          escola_id: string
          id: string
          turma_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          escola_id: string
          id?: string
          turma_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          escola_id?: string
          id?: string
          turma_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_auditoria_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          ativo: boolean
          escola_id: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          escola_id: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          escola_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_turma_componentes: {
        Row: {
          componente_id: string
          id: string
          usuario_turma_id: string
        }
        Insert: {
          componente_id: string
          id?: string
          usuario_turma_id: string
        }
        Update: {
          componente_id?: string
          id?: string
          usuario_turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_turma_componentes_componente_id_fkey"
            columns: ["componente_id"]
            isOneToOne: false
            referencedRelation: "componentes_curriculares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_turma_componentes_usuario_turma_id_fkey"
            columns: ["usuario_turma_id"]
            isOneToOne: false
            referencedRelation: "usuario_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_turmas: {
        Row: {
          created_at: string
          created_by: string | null
          escopo_eja: string[] | null
          id: string
          status: string
          turma_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          escopo_eja?: string[] | null
          id?: string
          status?: string
          turma_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          escopo_eja?: string[] | null
          id?: string
          status?: string
          turma_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_turmas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_turmas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_turmas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          area_atuacao: string | null
          area_atuacao_outro: string | null
          created_at: string
          created_by: string | null
          email: string
          escola_id: string
          foto_url: string | null
          funcao: Database["public"]["Enums"]["user_role"]
          id: string
          nome_completo: string
          senha_definida: boolean
          status: Database["public"]["Enums"]["user_status"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          area_atuacao?: string | null
          area_atuacao_outro?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          escola_id: string
          foto_url?: string | null
          funcao: Database["public"]["Enums"]["user_role"]
          id: string
          nome_completo: string
          senha_definida?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          area_atuacao?: string | null
          area_atuacao_outro?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          escola_id?: string
          foto_url?: string | null
          funcao?: Database["public"]["Enums"]["user_role"]
          id?: string
          nome_completo?: string
          senha_definida?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          id: string
          usuario_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          id?: string
          usuario_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          id?: string
          usuario_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      vinculos_escolares_anuais: {
        Row: {
          ano_letivo_id: string
          created_at: string
          created_by: string | null
          data_matricula_efetiva: string | null
          escola_id: string
          estudante_id: string
          etapa_do_ciclo: string | null
          id: string
          matricula_interna: string | null
          oferta_atual_id: string | null
          organizacao_atual_id: string | null
          turma_id: string | null
          turno_id: string | null
          updated_at: string
          utiliza_transporte: boolean | null
        }
        Insert: {
          ano_letivo_id: string
          created_at?: string
          created_by?: string | null
          data_matricula_efetiva?: string | null
          escola_id: string
          estudante_id: string
          etapa_do_ciclo?: string | null
          id?: string
          matricula_interna?: string | null
          oferta_atual_id?: string | null
          organizacao_atual_id?: string | null
          turma_id?: string | null
          turno_id?: string | null
          updated_at?: string
          utiliza_transporte?: boolean | null
        }
        Update: {
          ano_letivo_id?: string
          created_at?: string
          created_by?: string | null
          data_matricula_efetiva?: string | null
          escola_id?: string
          estudante_id?: string
          etapa_do_ciclo?: string | null
          id?: string
          matricula_interna?: string | null
          oferta_atual_id?: string | null
          organizacao_atual_id?: string | null
          turma_id?: string | null
          turno_id?: string | null
          updated_at?: string
          utiliza_transporte?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_escolares_anuais_ano_letivo_id_fkey"
            columns: ["ano_letivo_id"]
            isOneToOne: false
            referencedRelation: "anos_letivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_oferta_atual_id_fkey"
            columns: ["oferta_atual_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_organizacao_atual_id_fkey"
            columns: ["organizacao_atual_id"]
            isOneToOne: false
            referencedRelation: "etapas_ciclos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      vinculos_escolares_anuais_auditoria: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo_alterado: string
          escola_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
          vinculo_id: string
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado: string
          escola_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
          vinculo_id: string
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo_alterado?: string
          escola_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
          vinculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_escolares_anuais_auditoria_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_auditoria_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_escolares_anuais_auditoria_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: false
            referencedRelation: "vinculos_escolares_anuais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_escola_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      pode_ver_estudante_restrito: {
        Args: { p_estudante_id: string }
        Returns: boolean
      }
      professor_pode_ver_estudante: {
        Args: { p_estudante_id: string }
        Returns: boolean
      }
      profissional_complementar_pode_ver_estudante: {
        Args: { p_estudante_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "administrador"
        | "direcao"
        | "secretaria"
        | "coordenacao_pedagogica"
        | "professor_regente"
        | "professor_arte"
        | "professor_educacao_fisica"
        | "profissional_complementar"
      user_status: "ativo" | "inativo"
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
    Enums: {
      user_role: [
        "administrador",
        "direcao",
        "secretaria",
        "coordenacao_pedagogica",
        "professor_regente",
        "professor_arte",
        "professor_educacao_fisica",
        "profissional_complementar",
      ],
      user_status: ["ativo", "inativo"],
    },
  },
} as const
