export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      anexos_medicos: {
        Row: {
          categoria: string
          created_at: string
          data_upload: string
          descricao: string | null
          id: string
          medico_id: string
          nome_arquivo: string
          paciente_id: string
          prontuario_id: string | null
          subcategoria: string | null
          tamanho_bytes: number | null
          tipo_arquivo: string
          url_storage: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_upload?: string
          descricao?: string | null
          id?: string
          medico_id: string
          nome_arquivo: string
          paciente_id: string
          prontuario_id?: string | null
          subcategoria?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo: string
          url_storage: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_upload?: string
          descricao?: string | null
          id?: string
          medico_id?: string
          nome_arquivo?: string
          paciente_id?: string
          prontuario_id?: string | null
          subcategoria?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo?: string
          url_storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_medicos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_medicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_medicos_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_exames: {
        Row: {
          ativo: boolean
          categoria: string
          codigo_amb: string | null
          codigo_tuss: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          subcategoria: string | null
          updated_at: string
          valor_referencia: number | null
        }
        Insert: {
          ativo?: boolean
          categoria: string
          codigo_amb?: string | null
          codigo_tuss?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          subcategoria?: string | null
          updated_at?: string
          valor_referencia?: number | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          codigo_amb?: string | null
          codigo_tuss?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          subcategoria?: string | null
          updated_at?: string
          valor_referencia?: number | null
        }
        Relationships: []
      }
      clinica_medicos: {
        Row: {
          ativo: boolean
          clinica_id: string
          created_at: string
          id: string
          medico_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          created_at?: string
          id?: string
          medico_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          created_at?: string
          id?: string
          medico_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinica_medicos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinica_medicos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          clinica_id: string | null
          created_at: string
          data_consulta: string
          duracao_minutos: number
          id: string
          medico_id: string
          observacoes: string | null
          paciente_id: string
          status: string
          tipo_consulta: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          clinica_id?: string | null
          created_at?: string
          data_consulta: string
          duracao_minutos?: number
          id?: string
          medico_id: string
          observacoes?: string | null
          paciente_id: string
          status?: string
          tipo_consulta?: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          clinica_id?: string | null
          created_at?: string
          data_consulta?: string
          duracao_minutos?: number
          id?: string
          medico_id?: string
          observacoes?: string | null
          paciente_id?: string
          status?: string
          tipo_consulta?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      convites_medicos: {
        Row: {
          clinica_id: string
          created_at: string
          crm: string | null
          email: string
          especialidade: string | null
          expires_at: string
          id: string
          nome: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          clinica_id: string
          created_at?: string
          crm?: string | null
          email: string
          especialidade?: string | null
          expires_at?: string
          id?: string
          nome: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          clinica_id?: string
          created_at?: string
          crm?: string | null
          email?: string
          especialidade?: string | null
          expires_at?: string
          id?: string
          nome?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_medicos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_medicos: {
        Row: {
          assinado: boolean | null
          conteudo: string
          created_at: string
          hash_assinatura: string | null
          id: string
          medico_id: string
          numero_documento: string | null
          paciente_id: string
          prontuario_id: string | null
          status: string | null
          template_usado: string | null
          tipo: string
          titulo: string
          updated_at: string
          validade_ate: string | null
        }
        Insert: {
          assinado?: boolean | null
          conteudo: string
          created_at?: string
          hash_assinatura?: string | null
          id?: string
          medico_id: string
          numero_documento?: string | null
          paciente_id: string
          prontuario_id?: string | null
          status?: string | null
          template_usado?: string | null
          tipo: string
          titulo: string
          updated_at?: string
          validade_ate?: string | null
        }
        Update: {
          assinado?: boolean | null
          conteudo?: string
          created_at?: string
          hash_assinatura?: string | null
          id?: string
          medico_id?: string
          numero_documento?: string | null
          paciente_id?: string
          prontuario_id?: string | null
          status?: string | null
          template_usado?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          validade_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_medicos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_medicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_medicos_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      medicamentos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string
          dosagens_comuns: string[] | null
          frequencias_comuns: string[] | null
          id: string
          interacoes: string[] | null
          nome: string
          observacoes: string | null
          principio_ativo: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          dosagens_comuns?: string[] | null
          frequencias_comuns?: string[] | null
          id?: string
          interacoes?: string[] | null
          nome: string
          observacoes?: string | null
          principio_ativo?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          dosagens_comuns?: string[] | null
          frequencias_comuns?: string[] | null
          id?: string
          interacoes?: string[] | null
          nome?: string
          observacoes?: string | null
          principio_ativo?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          antecedentes_alergias: string | null
          antecedentes_cirurgicos: string | null
          antecedentes_clinicos: string | null
          antecedentes_familiares: string | null
          antecedentes_habitos: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          convenio: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          medicamentos_em_uso: Json | null
          nome: string
          numero_convenio: string | null
          origem: string | null
          responsavel_id: string
          telefone: string | null
          ticket_medio: number | null
          total_consultas: number | null
          total_gasto: number | null
          updated_at: string
        }
        Insert: {
          antecedentes_alergias?: string | null
          antecedentes_cirurgicos?: string | null
          antecedentes_clinicos?: string | null
          antecedentes_familiares?: string | null
          antecedentes_habitos?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          medicamentos_em_uso?: Json | null
          nome: string
          numero_convenio?: string | null
          origem?: string | null
          responsavel_id: string
          telefone?: string | null
          ticket_medio?: number | null
          total_consultas?: number | null
          total_gasto?: number | null
          updated_at?: string
        }
        Update: {
          antecedentes_alergias?: string | null
          antecedentes_cirurgicos?: string | null
          antecedentes_clinicos?: string | null
          antecedentes_familiares?: string | null
          antecedentes_habitos?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          medicamentos_em_uso?: Json | null
          nome?: string
          numero_convenio?: string | null
          origem?: string | null
          responsavel_id?: string
          telefone?: string | null
          ticket_medio?: number | null
          total_consultas?: number | null
          total_gasto?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescricoes: {
        Row: {
          created_at: string
          dosagem: string
          duracao: string
          frequencia: string
          id: string
          medicamento: string
          observacoes: string | null
          prontuario_id: string
        }
        Insert: {
          created_at?: string
          dosagem: string
          duracao: string
          frequencia: string
          id?: string
          medicamento: string
          observacoes?: string | null
          prontuario_id: string
        }
        Update: {
          created_at?: string
          dosagem?: string
          duracao?: string
          frequencia?: string
          id?: string
          medicamento?: string
          observacoes?: string | null
          prontuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          crm: string | null
          documento: string
          email: string
          endereco: string | null
          especialidade: string | null
          estado: string | null
          id: string
          nome: string
          permite_atendimento_individual: boolean | null
          permite_ia: boolean | null
          permite_relatorios_avancados: boolean | null
          plano_medico: string | null
          telefone: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          crm?: string | null
          documento: string
          email: string
          endereco?: string | null
          especialidade?: string | null
          estado?: string | null
          id?: string
          nome: string
          permite_atendimento_individual?: boolean | null
          permite_ia?: boolean | null
          permite_relatorios_avancados?: boolean | null
          plano_medico?: string | null
          telefone?: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          crm?: string | null
          documento?: string
          email?: string
          endereco?: string | null
          especialidade?: string | null
          estado?: string | null
          id?: string
          nome?: string
          permite_atendimento_individual?: boolean | null
          permite_ia?: boolean | null
          permite_relatorios_avancados?: boolean | null
          plano_medico?: string | null
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          conduta: string | null
          consulta_id: string | null
          created_at: string
          data_atendimento: string
          exame_fisico: string | null
          hipotese_diagnostica: string | null
          historia_doenca_atual: string | null
          id: string
          medico_id: string
          observacoes: string | null
          paciente_id: string
          prescricao: string | null
          queixa_principal: string | null
          updated_at: string
        }
        Insert: {
          conduta?: string | null
          consulta_id?: string | null
          created_at?: string
          data_atendimento?: string
          exame_fisico?: string | null
          hipotese_diagnostica?: string | null
          historia_doenca_atual?: string | null
          id?: string
          medico_id: string
          observacoes?: string | null
          paciente_id: string
          prescricao?: string | null
          queixa_principal?: string | null
          updated_at?: string
        }
        Update: {
          conduta?: string | null
          consulta_id?: string | null
          created_at?: string
          data_atendimento?: string
          exame_fisico?: string | null
          hipotese_diagnostica?: string | null
          historia_doenca_atual?: string | null
          id?: string
          medico_id?: string
          observacoes?: string | null
          paciente_id?: string
          prescricao?: string | null
          queixa_principal?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_exames: {
        Row: {
          convenio: string | null
          created_at: string
          data_resultado: string | null
          data_solicitacao: string
          exames: Json
          id: string
          indicacao_clinica: string | null
          medico_id: string
          observacoes: string | null
          paciente_id: string
          prontuario_id: string | null
          status: string | null
          updated_at: string
          urgente: boolean | null
        }
        Insert: {
          convenio?: string | null
          created_at?: string
          data_resultado?: string | null
          data_solicitacao?: string
          exames: Json
          id?: string
          indicacao_clinica?: string | null
          medico_id: string
          observacoes?: string | null
          paciente_id: string
          prontuario_id?: string | null
          status?: string | null
          updated_at?: string
          urgente?: boolean | null
        }
        Update: {
          convenio?: string | null
          created_at?: string
          data_resultado?: string | null
          data_solicitacao?: string
          exames?: Json
          id?: string
          indicacao_clinica?: string | null
          medico_id?: string
          observacoes?: string | null
          paciente_id?: string
          prontuario_id?: string | null
          status?: string | null
          updated_at?: string
          urgente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_exames_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_exames_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_exames_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_documentos: {
        Row: {
          ativo: boolean | null
          conteudo_template: string
          created_at: string
          especialidade: string | null
          id: string
          nome: string
          tipo: string
          variaveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo_template: string
          created_at?: string
          especialidade?: string | null
          id?: string
          nome: string
          tipo: string
          variaveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          conteudo_template?: string
          created_at?: string
          especialidade?: string | null
          id?: string
          nome?: string
          tipo?: string
          variaveis?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      medico_tem_permissao: {
        Args: { medico_id: string; permissao: string }
        Returns: boolean
      }
    }
    Enums: {
      user_type: "medico" | "paciente" | "clinica" | "hospital"
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
      user_type: ["medico", "paciente", "clinica", "hospital"],
    },
  },
} as const
