interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const buscarCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  try {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return null;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data: ViaCEPResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

export const formatarCEP = (cep: string): string => {
  // Remove caracteres não numéricos
  const cepLimpo = cep.replace(/\D/g, '');
  
  // Aplica máscara: 00000-000
  if (cepLimpo.length <= 5) {
    return cepLimpo;
  } else {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
  }
}; 