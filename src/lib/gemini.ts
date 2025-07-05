
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
