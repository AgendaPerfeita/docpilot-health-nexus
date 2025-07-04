// Configuração da API do Gemini
export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
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