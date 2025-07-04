export const mockPatients = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    birthDate: "1985-03-15",
    lastVisit: "2024-01-15",
    status: "Ativo",
    plan: "Particular",
    notes: "Diabetes tipo 2",
    evolucoes: [
      {
        id: 101,
        data: "2024-06-01",
        queixa: "Dor abdominal",
        historia: "Dor há 3 dias, piora após alimentação.",
        exameFisico: "Abdome doloroso em FID",
        hipoteseDiagnostica: "Apendicite aguda",
        conduta: "Solicitado USG, prescrito analgésico.",
        medicamentos: [
          { nome: "Dipirona", dose: "500mg", posologia: "1cp 8/8h", duracao: "5 dias" }
        ]
      },
      {
        id: 102,
        data: "2024-05-10",
        queixa: "Cefaleia",
        historia: "Dor de cabeça há 1 semana, sem aura.",
        exameFisico: "Exame neurológico normal",
        hipoteseDiagnostica: "Cefaleia tensional",
        conduta: "Orientado repouso, prescrito analgésico leve.",
        medicamentos: [
          { nome: "Paracetamol", dose: "750mg", posologia: "1cp 8/8h se dor", duracao: "3 dias" }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 88888-8888",
    birthDate: "1978-07-22",
    lastVisit: "2024-01-10",
    status: "Ativo",
    plan: "Convênio",
    notes: "Hipertensão",
    evolucoes: [
      {
        id: 201,
        data: "2024-06-02",
        queixa: "Tontura",
        historia: "Tontura ao levantar, sem desmaios.",
        exameFisico: "PA 140/90, demais normal",
        hipoteseDiagnostica: "Hipotensão postural",
        conduta: "Ajuste de medicação anti-hipertensiva.",
        medicamentos: [
          { nome: "Losartana", dose: "50mg", posologia: "1cp ao dia", duracao: "uso contínuo" }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 77777-7777",
    birthDate: "1992-11-08",
    lastVisit: "2023-12-20",
    status: "Inativo",
    plan: "Particular",
    notes: "Alergia a penicilina",
    evolucoes: []
  }
] 