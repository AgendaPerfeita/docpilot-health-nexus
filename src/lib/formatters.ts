export const formatarCPF = (cpf: string): string => {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Aplica máscara: 000.000.000-00
  if (cpfLimpo.length <= 3) {
    return cpfLimpo;
  } else if (cpfLimpo.length <= 6) {
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
  } else if (cpfLimpo.length <= 9) {
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`;
  } else {
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9, 11)}`;
  }
};

export const formatarTelefone = (telefone: string): string => {
  // Remove caracteres não numéricos
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  // Aplica máscara: (00) 00000-0000 ou (00) 0000-0000
  if (telefoneLimpo.length <= 2) {
    return telefoneLimpo;
  } else if (telefoneLimpo.length <= 6) {
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2)}`;
  } else if (telefoneLimpo.length <= 10) {
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 6)}-${telefoneLimpo.slice(6)}`;
  } else {
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 7)}-${telefoneLimpo.slice(7, 11)}`;
  }
}; 