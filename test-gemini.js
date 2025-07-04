// Teste da API do Gemini
const GEMINI_API_KEY = 'AIzaSyB9tz21KLttdBrccSFzVIJeV0O1zXWOXbM';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function testGeminiAPI() {
  try {
    console.log('Testando API do Gemini...');
    
    const response = await fetch(GEMINI_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Olá! Você pode me ajudar com uma análise médica?'
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API funcionando! Resposta:', data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testGeminiAPI(); 