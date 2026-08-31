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
      etapas_ciclos: {
        Row: {
          escola_id: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          escola_id: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          escola_id?: string
          id?: string
          nome?: string
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
      turmas: {
        Row: {
          ano_letivo: number | null
          created_at: string
          escola_id: string
          etapa_ciclo_id: string
          id: string
          nome: string
          status: string
          turno_id: string
        }
        Insert: {
          ano_letivo?: number | null
          created_at?: string
          escola_id: string
          etapa_ciclo_id: string
          id?: string
          nome: string
          status?: string
          turno_id: string
        }
        Update: {
          ano_letivo?: number | null
          created_at?: string
          escola_id?: string
          etapa_ciclo_id?: string
          id?: string
          nome?: string
          status?: string
          turno_id?: string
        }
        Relationships: [
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
            foreignKeyName: "turmas_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          escola_id: string
          id: string
          nome: string
        }
        Insert: {
          escola_id: string
          id?: string
          nome: string
        }
        Update: {
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
          id: string
          turma_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          turma_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
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
    Enums: {
      user_role: [
        "administrador",
        "direcao",
        "secretaria",
        "coordenacao_pedagogica",
        "professor_regente",
        "professor_arte",
        "professor_educacao_fisica",
      ],
      user_status: ["ativo", "inativo"],
    },
  },
} as const
