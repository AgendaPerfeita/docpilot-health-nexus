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
          clinica_id: string | null
          created_at: string
          data_upload: string
          descricao: string | null
          enviado_no_chat: boolean
          id: string
          medico_id: string
          nome_arquivo: string
          paciente_id: string
          paciente_upload_id: string | null
          prontuario_id: string | null
          staff_id: string | null
          subcategoria: string | null
          tamanho_bytes: number | null
          tipo_arquivo: string
          url_storage: string
        }
        Insert: {
          categoria: string
          clinica_id?: string | null
          created_at?: string
          data_upload?: string
          descricao?: string | null
          enviado_no_chat?: boolean
          id?: string
          medico_id: string
          nome_arquivo: string
          paciente_id: string
          paciente_upload_id?: string | null
          prontuario_id?: string | null
          staff_id?: string | null
          subcategoria?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo: string
          url_storage: string
        }
        Update: {
          categoria?: string
          clinica_id?: string | null
          created_at?: string
          data_upload?: string
          descricao?: string | null
          enviado_no_chat?: boolean
          id?: string
          medico_id?: string
          nome_arquivo?: string
          paciente_id?: string
          paciente_upload_id?: string | null
          prontuario_id?: string | null
          staff_id?: string | null
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
      chat_mensagens: {
        Row: {
          author_id: string
          author_type: string
          clinica_id: string | null
          content: string | null
          created_at: string
          deleted: boolean
          id: string
          media_type: string | null
          media_url: string | null
          patient_id: string
          read: boolean
          read_at: string | null
        }
        Insert: {
          author_id: string
          author_type: string
          clinica_id?: string | null
          content?: string | null
          created_at?: string
          deleted?: boolean
          id?: string
          media_type?: string | null
          media_url?: string | null
          patient_id: string
          read?: boolean
          read_at?: string | null
        }
        Update: {
          author_id?: string
          author_type?: string
          clinica_id?: string | null
          content?: string | null
          created_at?: string
          deleted?: boolean
          id?: string
          media_type?: string | null
          media_url?: string | null
          patient_id?: string
          read?: boolean
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensagens_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensagens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
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
      documentos_compartilhados: {
        Row: {
          clinica_id: string | null
          compartilhado_em: string
          exame_id: string
          id: string
          medico_id: string | null
        }
        Insert: {
          clinica_id?: string | null
          compartilhado_em?: string
          exame_id: string
          id?: string
          medico_id?: string | null
        }
        Update: {
          clinica_id?: string | null
          compartilhado_em?: string
          exame_id?: string
          id?: string
          medico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_compartilhados_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_compartilhados_exame_id_fkey"
            columns: ["exame_id"]
            isOneToOne: false
            referencedRelation: "exames_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_compartilhados_medico_id_fkey"
            columns: ["medico_id"]
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
      documentos_visualizacoes: {
        Row: {
          exame_id: string
          id: string
          visualizado_em: string
          visualizador_id: string
        }
        Insert: {
          exame_id: string
          id?: string
          visualizado_em?: string
          visualizador_id: string
        }
        Update: {
          exame_id?: string
          id?: string
          visualizado_em?: string
          visualizador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_visualizacoes_exame_id_fkey"
            columns: ["exame_id"]
            isOneToOne: false
            referencedRelation: "exames_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_visualizacoes_visualizador_id_fkey"
            columns: ["visualizador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exames_uploads: {
        Row: {
          created_at: string
          descricao: string | null
          file_type: string | null
          file_url: string
          id: string
          nome: string | null
          paciente_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          nome?: string | null
          paciente_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          nome?: string | null
          paciente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exames_uploads_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
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
      notificacoes: {
        Row: {
          contexto: Json | null
          criada_em: string
          deleted: boolean
          id: string
          lida: boolean
          lida_em: string | null
          mensagem: string | null
          prioridade: string | null
          tipo: string
          titulo: string | null
          user_id: string
        }
        Insert: {
          contexto?: Json | null
          criada_em?: string
          deleted?: boolean
          id?: string
          lida?: boolean
          lida_em?: string | null
          mensagem?: string | null
          prioridade?: string | null
          tipo: string
          titulo?: string | null
          user_id: string
        }
        Update: {
          contexto?: Json | null
          criada_em?: string
          deleted?: boolean
          id?: string
          lida?: boolean
          lida_em?: string | null
          mensagem?: string | null
          prioridade?: string | null
          tipo?: string
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      paciente_clinica: {
        Row: {
          clinica_id: string
          data_vinculo: string | null
          id: string
          paciente_id: string
          status: string | null
        }
        Insert: {
          clinica_id: string
          data_vinculo?: string | null
          id?: string
          paciente_id: string
          status?: string | null
        }
        Update: {
          clinica_id?: string
          data_vinculo?: string | null
          id?: string
          paciente_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paciente_clinica_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_clinica_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente_medico: {
        Row: {
          clinica_id: string
          data_vinculo: string | null
          id: string
          medico_id: string
          paciente_id: string
          status: string | null
        }
        Insert: {
          clinica_id: string
          data_vinculo?: string | null
          id?: string
          medico_id: string
          paciente_id: string
          status?: string | null
        }
        Update: {
          clinica_id?: string
          data_vinculo?: string | null
          id?: string
          medico_id?: string
          paciente_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paciente_medico_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_medico_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_medico_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
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
          telefone?: string | null
          ticket_medio?: number | null
          total_consultas?: number | null
          total_gasto?: number | null
          updated_at?: string
        }
        Relationships: []
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
          clinica_id: string | null
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
          clinica_id?: string | null
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
          clinica_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      can_insert_paciente: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      criar_vinculo_paciente_clinica: {
        Args: { paciente_id_param: string; clinica_id_param: string }
        Returns: undefined
      }
      criar_vinculo_paciente_medico: {
        Args: {
          paciente_id_param: string
          medico_id_param: string
          clinica_id_param: string
        }
        Returns: undefined
      }
      debug_auth_context: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_id: string
          profile_exists: boolean
          profile_tipo: string
          profile_ativo: boolean
          profile_id: string
          profile_nome: string
        }[]
      }
      debug_insert_policy: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_uid: string
          profile_exists: boolean
          profile_tipo: string
          profile_ativo: boolean
          tipo_allowed: boolean
          insert_allowed: boolean
          policy_condition_result: boolean
        }[]
      }
      debug_paciente_access: {
        Args: { paciente_id_param: string }
        Returns: {
          can_access: boolean
          reason: string
          via_medico: boolean
          via_clinica: boolean
          via_clinica_medico: boolean
        }[]
      }
      debug_pacientes_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_name: string
          policy_cmd: string
          policy_roles: string[]
          policy_qual: string
          policy_with_check: string
        }[]
      }
      get_paciente_ids_clinica: {
        Args: { clinica_id_param: string }
        Returns: string[]
      }
      get_paciente_ids_medico: {
        Args: { medico_id_param: string }
        Returns: string[]
      }
      get_pacientes_clinica: {
        Args: { clinica_id_param: string }
        Returns: {
          id: string
          nome: string
          email: string
          telefone: string
          cpf: string
          data_nascimento: string
          endereco: string
          bairro: string
          cidade: string
          estado: string
          cep: string
          convenio: string
          numero_convenio: string
          origem: string
          created_at: string
          updated_at: string
          antecedentes_clinicos: string
          antecedentes_cirurgicos: string
          antecedentes_familiares: string
          antecedentes_habitos: string
          antecedentes_alergias: string
          medicamentos_em_uso: Json
          ticket_medio: number
          total_consultas: number
          total_gasto: number
        }[]
      }
      get_pacientes_medico: {
        Args: { medico_id_param: string }
        Returns: {
          id: string
          nome: string
          email: string
          telefone: string
          cpf: string
          data_nascimento: string
          endereco: string
          bairro: string
          cidade: string
          estado: string
          cep: string
          convenio: string
          numero_convenio: string
          origem: string
          created_at: string
          updated_at: string
          antecedentes_clinicos: string
          antecedentes_cirurgicos: string
          antecedentes_familiares: string
          antecedentes_habitos: string
          antecedentes_alergias: string
          medicamentos_em_uso: Json
          ticket_medio: number
          total_consultas: number
          total_gasto: number
        }[]
      }
      insert_paciente: {
        Args: {
          nome_param: string
          email_param?: string
          telefone_param?: string
          cpf_param?: string
          data_nascimento_param?: string
          endereco_param?: string
          bairro_param?: string
          cidade_param?: string
          estado_param?: string
          cep_param?: string
          convenio_param?: string
          numero_convenio_param?: string
          origem_param?: string
        }
        Returns: {
          id: string
          nome: string
          email: string
          telefone: string
          cpf: string
          data_nascimento: string
          endereco: string
          bairro: string
          cidade: string
          estado: string
          cep: string
          convenio: string
          numero_convenio: string
          origem: string
          created_at: string
          updated_at: string
        }[]
      }
      medico_tem_permissao: {
        Args: { medico_id: string; permissao: string }
        Returns: boolean
      }
      reenable_pacientes_rls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_type: "medico" | "paciente" | "clinica" | "hospital" | "staff"
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
      user_type: ["medico", "paciente", "clinica", "hospital", "staff"],
    },
  },
} as const
