// Configuração da API do Gemini
export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
}

// Tipo para medicamentos
export interface Medicamento {
  nome: string;
  principioAtivo: string;
  apresentacao: string;
  fabricante: string;
  tipo: string;
  preco?: number;
  tarja?: string;
  posologias?: string[];
  observacoes?: string;
}

// Função para fazer chamadas à API do Gemini
export async function callGeminiAPI(prompt: string) {
  if (!GEMINI_CONFIG.apiKey) {
    throw new Error('VITE_GEMINI_API_KEY não está configurada no arquivo .env')
  }

  try {
    const response = await fetch(GEMINI_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_CONFIG.apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Erro ao chamar API do Gemini:', error)
    throw error
  }
}

// Função específica para análise médica avançada
export async function analyzeMedicalDataAdvanced(patientData: any, symptoms: string, vitalSigns: any, physicalExam: any) {
  const prompt = `
    Como assistente médico especializado com conhecimento em medicina baseada em evidências, analise os dados completos do paciente:
    
    DADOS DEMOGRÁFICOS:
    - Nome: ${patientData.name}
    - Idade: ${patientData.age || 'N/A'}
    - Sexo: ${patientData.gender || 'N/A'}
    - Peso: ${vitalSigns.peso}kg
    - Altura: ${vitalSigns.altura}cm
    - IMC: ${vitalSigns.imc}
    
    ANTECEDENTES:
    - Condições Crônicas: ${patientData.chronicConditions || 'Nenhuma'}
    - Medicamentos de Uso Contínuo: ${patientData.continuousMedications || 'Nenhum'}
    - Alergias: ${patientData.allergies || 'Nenhuma'}
    - Cirurgias Prévias: ${patientData.surgeries || 'Nenhuma'}
    - Antecedentes Familiares: ${patientData.familyHistory || 'Não informado'}
    
    SINAIS VITAIS:
    - PA: ${vitalSigns.pa_sistolica}/${vitalSigns.pa_diastolica} mmHg
    - FC: ${vitalSigns.fc} bpm
    - Temperatura: ${vitalSigns.temp}°C
    - FR: ${vitalSigns.fr} irpm
    - Saturação O2: ${vitalSigns.sat_o2}%
    
    EXAME FÍSICO:
    - Estado Geral: ${physicalExam.geral}
    - Cardiovascular: ${physicalExam.cardiovascular}
    - Respiratório: ${physicalExam.respiratorio}
    - Abdominal: ${physicalExam.abdominal}
    - Neurológico: ${physicalExam.neurologico}
    - Pele e Mucosas: ${physicalExam.pele}
    
    SINTOMAS: ${symptoms}
    
    Forneça análise médica estruturada considerando:
    1. Escores de risco automáticos (qSOFA, CRB-65, etc.)
    2. Critérios de gravidade e internação
    3. Ajustes de dose por peso/idade/função renal
    4. Interações medicamentosas
    5. Protocolos clínicos atualizados
    
    Responda em português brasileiro de forma clara, profissional e baseada em evidências.
  `

  return callGeminiAPI(prompt)
}

// Função para buscar medicamentos com informações de dose
export async function buscarMedicamentosComDose(termo: string, peso?: number, idade?: number, sexo?: string): Promise<Medicamento[]> {
  const prompt = `
    Busque medicamentos que correspondam ao termo: "${termo}"
    ${peso ? `Peso do paciente: ${peso}kg` : ''}
    ${idade ? `Idade: ${idade} anos` : ''}
    ${sexo ? `Sexo: ${sexo}` : ''}
    
    Retorne uma lista de até 5 medicamentos em formato JSON com as seguintes propriedades:
    - nome: string
    - principioAtivo: string
    - apresentacao: string
    - fabricante: string
    - tipo: string (Genérico, Similar, Referência)
    - preco: number (opcional)
    - tarja: string (Livre, Vermelha, Preta)
    - posologias: string[] (array de posologias ajustadas para peso/idade se fornecido)
    - observacoes: string (incluir alertas de dose, contraindicações, interações)
    
    Se peso/idade fornecidos, inclua posologias ajustadas e alertas específicos.
    
    Responda APENAS com o JSON válido, sem texto adicional.
  `

  try {
    const response = await callGeminiAPI(prompt)
    return JSON.parse(response)
  } catch (error) {
    console.error('Erro ao buscar medicamentos:', error)
    return []
  }
}

// Função para verificar ajustes de dose
export async function verificarAjusteDose(medicamento: string, peso: number, idade: number, funcaoRenal?: string): Promise<string> {
  const prompt = `
    Para o medicamento "${medicamento}", analise se há necessidade de ajuste de dose considerando:
    - Peso: ${peso}kg
    - Idade: ${idade} anos
    - Função renal: ${funcaoRenal || 'não informada'}
    
    Responda com alertas específicos sobre:
    1. Ajuste por peso (se necessário)
    2. Ajuste por idade (pediátrico/geriátrico)
    3. Ajuste por função renal
    4. Contraindicações específicas
    5. Monitorização necessária
    
    Seja específico e baseado em evidências médicas.
  `

  try {
    const response = await callGeminiAPI(prompt)
    return response
  } catch (error) {
    console.error('Erro ao verificar ajuste de dose:', error)
    return 'Erro ao verificar ajustes de dose. Consulte literatura médica.'
  }
}

// Função para calcular escores de risco automaticamente
export async function calcularEscoresRisco(dadosPaciente: any, sinaisVitais: any, sintomas: string): Promise<string> {
  const prompt = `
    Com base nos dados do paciente, calcule automaticamente os escores de risco relevantes:
    
    DADOS:
    - Idade: ${dadosPaciente.idade}
    - Sinais vitais: PA ${sinaisVitais.pa_sistolica}/${sinaisVitais.pa_diastolica}, FC ${sinaisVitais.fc}, Temp ${sinaisVitais.temp}°C, FR ${sinaisVitais.fr}
    - Sintomas: ${sintomas}
    
    CALCULE OS ESCORES APLICÁVEIS:
    - qSOFA (se suspeita de sepse)
    - CRB-65 (se sintomas respiratórios)
    - Centor (se sintomas de faringite)
    - Wells (se suspeita de TVP)
    - GRACE (se síndrome coronariana)
    
    Para cada escore aplicável, forneça:
    1. Valor calculado
    2. Interpretação do risco
    3. Recomendação clínica
    
    Responda em formato estruturado e claro.
  `

  try {
    const response = await callGeminiAPI(prompt)
    return response
  } catch (error) {
    console.error('Erro ao calcular escores:', error)
    return 'Erro ao calcular escores de risco.'
  }
}

// Função específica para análise médica
export async function analyzeMedicalData(patientData: any, symptoms: string) {
  const prompt = `
    Analise os dados do paciente e os sintomas descritos:
    
    Dados do Paciente:
    - Nome: ${patientData.name}
    - Idade: ${patientData.age || 'N/A'}
    - Condições Crônicas: ${patientData.chronicConditions || 'Nenhuma'}
    - Medicamentos de Uso Contínuo: ${patientData.continuousMedications || 'Nenhum'}
    - Alergias: ${patientData.allergies || 'Nenhuma'}
    
    Sintomas: ${symptoms}
    
    Forneça uma análise médica preliminar e sugestões de exames ou especialistas que podem ser consultados.
    Responda em português brasileiro de forma clara e acessível.
  `

  return callGeminiAPI(prompt)
}

// Função para buscar medicamentos
export async function buscarMedicamentos(termo: string): Promise<Medicamento[]> {
  const prompt = `
    Busque medicamentos que correspondam ao termo: "${termo}"
    
    Retorne uma lista de até 5 medicamentos em formato JSON com as seguintes propriedades:
    - nome: string
    - principioAtivo: string
    - apresentacao: string
    - fabricante: string
    - tipo: string (Genérico, Similar, Referência)
    - preco: number (opcional)
    - tarja: string (Livre, Vermelha, Preta)
    - posologias: string[] (array de posologias comuns)
    - observacoes: string (opcional)
    
    Responda APENAS com o JSON válido, sem texto adicional.
  `

  try {
    const response = await callGeminiAPI(prompt)
    return JSON.parse(response)
  } catch (error) {
    console.error('Erro ao buscar medicamentos:', error)
    return []
  }
}

// Função para autocomplete de medicamentos
export async function autocompleteMedicamentos(termo: string): Promise<string[]> {
  const prompt = `
    Forneça uma lista de 8 nomes de medicamentos que começam ou contêm o termo: "${termo}"
    
    Retorne apenas os nomes dos medicamentos em formato JSON como um array de strings.
    Exemplo: ["Amoxicilina 500mg", "Dipirona 500mg", ...]
    
    Responda APENAS com o JSON válido, sem texto adicional.
  `

  try {
    const response = await callGeminiAPI(prompt)
    return JSON.parse(response)
  } catch (error) {
    console.error('Erro no autocomplete de medicamentos:', error)
    return []
  }
}

// Função para obter posologias sugeridas
export async function obterPosologiasSugeridas(medicamento: string): Promise<string[]> {
  const prompt = `
    Para o medicamento "${medicamento}", forneça 3-5 posologias comuns e seguras.
    
    Retorne em formato JSON como um array de strings com posologias completas.
    Exemplo: ["1 comprimido, via oral, a cada 8 horas", "1 comprimido, via oral, duas vezes ao dia"]
    
    Responda APENAS com o JSON válido, sem texto adicional.
  `

  try {
    const response = await callGeminiAPI(prompt)
    return JSON.parse(response)
  } catch (error) {
    console.error('Erro ao obter posologias:', error)
    return []
  }
}

// Função específica para análise médica do plantonista
export async function analyzePlantonistaData(patientData: any, symptoms: string, vitalSigns: any, physicalExam: any, additionalData: any) {
  const prompt = `
    Como assistente médico especializado em emergência e plantão, analise os dados completos do paciente e forneça uma avaliação clínica direta e prática:

    DADOS DEMOGRÁFICOS:
    - Nome: ${patientData.name}
    - Idade: ${patientData.age || 'N/A'}
    - Sexo: ${patientData.gender || 'N/A'}
    - Peso: ${vitalSigns.peso}kg
    - Altura: ${vitalSigns.altura}cm

    ANTECEDENTES:
    - Medicamentos em Uso: ${additionalData.medicamentos_uso || 'Nenhum'}
    - Alergias: ${additionalData.alergias || 'Nenhuma'}
    - Hábitos: ${additionalData.habitos || 'Não informado'}
    - Antecedentes Familiares: ${additionalData.antecedentes_familiares || 'Não informado'}

    SINAIS VITAIS:
    - PA: ${vitalSigns.pa_sistolica}/${vitalSigns.pa_diastolica} mmHg
    - FC: ${vitalSigns.fc} bpm
    - Temperatura: ${vitalSigns.temp}°C
    - FR: ${vitalSigns.fr} irpm
    - Saturação O2: ${vitalSigns.sat_o2}%

    CARACTERIZAÇÃO DA DOR:
    ${additionalData.caracterizacao_dor || 'Não informado'}

    SINTOMAS ASSOCIADOS:
    - Tosse: ${additionalData.sintomas_associados?.tosse ? 'SIM' : 'NÃO'}
    - Dispneia: ${additionalData.sintomas_associados?.dispneia ? 'SIM' : 'NÃO'}
    - Sudorese: ${additionalData.sintomas_associados?.sudorese ? 'SIM' : 'NÃO'}
    - Náuseas: ${additionalData.sintomas_associados?.nauseas ? 'SIM' : 'NÃO'}
    - Outros: ${additionalData.sintomas_associados?.outros || 'Nenhum'}

    EXAME FÍSICO ESTRUTURADO:
    ${additionalData.exame_fisico_estruturado || 'Não informado'}

    QUEIXA PRINCIPAL: ${symptoms}
    ANAMNESE: ${additionalData.anamnese || 'Não informado'}

    Forneça análise estruturada EXATAMENTE neste formato:

    **DIAGNÓSTICOS DIFERENCIAIS:**
    - [Liste 3-4 diagnósticos principais em ordem de probabilidade]

    **EXAMES NECESSÁRIOS:**
    - [Liste exames prioritários ou "Não necessário"]

    **MEDICAÇÕES IMEDIATAS (hospital):**
    - [Medicamentos para dar no hospital com doses ajustadas]

    **MEDICAÇÕES PARA CASA:**
    - [Medicamentos para prescrever ou "Não aplicável" se internação]

    **JUSTIFICATIVA:**
    - [Explicação da decisão baseada nos dados]

    **DECISÃO:**
    - [Internar ou Liberar]

    **CID-10 SUGERIDO:**
    - [Códigos CID-10 apropriados]

    IMPORTANTE: 
    - Seja direto e prático
    - Calcule doses automaticamente quando possível
    - Se faltam dados para calcular dose (ex: função renal), forneça a fórmula
    - Decisão deve ser baseada na gravidade dos sintomas
    - Use sempre hífens (-) para listagens
    - Responda em português brasileiro
  `

  return callGeminiAPI(prompt)
}
