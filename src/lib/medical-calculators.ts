
// Calculadoras médicas e escores de risco

export interface RiskScore {
  name: string
  score: number | string
  risk: 'baixo' | 'moderado' | 'alto'
  recommendation: string
}

// Cálculo do CRB-65 para pneumonia
export function calculateCRB65(
  confusion: boolean,
  respiratoryRate: number,
  bloodPressure: { systolic: number; diastolic: number },
  age: number
): RiskScore {
  let score = 0
  
  if (confusion) score++
  if (respiratoryRate >= 30) score++
  if (bloodPressure.systolic < 90 || bloodPressure.diastolic <= 60) score++
  if (age >= 65) score++

  let risk: 'baixo' | 'moderado' | 'alto'
  let recommendation: string

  if (score === 0) {
    risk = 'baixo'
    recommendation = 'Tratamento ambulatorial'
  } else if (score <= 2) {
    risk = 'moderado'
    recommendation = 'Considerar internação hospitalar'
  } else {
    risk = 'alto'
    recommendation = 'Internação hospitalar urgente, considerar UTI'
  }

  return { name: 'CRB-65 (Pneumonia)', score, risk, recommendation }
}

// Cálculo do qSOFA para sepse
export function calculateQSOFA(
  respiratoryRate: number,
  systolicBP: number,
  glasgowComaScale?: number
): RiskScore {
  let score = 0
  
  if (respiratoryRate >= 22) score++
  if (systolicBP <= 100) score++
  if (glasgowComaScale && glasgowComaScale < 15) score++

  const risk = score >= 2 ? 'alto' : score === 1 ? 'moderado' : 'baixo'
  const recommendation = score >= 2 
    ? 'Alto risco de sepse - UTI/cuidados intensivos' 
    : score === 1 
    ? 'Risco moderado - monitorização próxima'
    : 'Baixo risco de sepse'

  return { name: 'qSOFA (Sepse)', score, risk, recommendation }
}

// Cálculo do Escore de Centor para faringite
export function calculateCentor(
  tonsillarExudate: boolean,
  tenderAnteriorNodes: boolean,
  fever: boolean,
  age: number,
  cough: boolean
): RiskScore {
  let score = 0
  
  if (tonsillarExudate) score++
  if (tenderAnteriorNodes) score++
  if (fever) score++
  if (age >= 3 && age <= 14) score++
  else if (age >= 15 && age <= 44) score += 0
  else if (age >= 45) score--
  if (!cough) score++

  const risk = score >= 4 ? 'alto' : score >= 2 ? 'moderado' : 'baixo'
  const recommendation = score >= 4 
    ? 'Probabilidade alta de faringite bacteriana - antibiótico'
    : score >= 2 
    ? 'Probabilidade moderada - considerar teste rápido'
    : 'Probabilidade baixa - tratamento sintomático'

  return { name: 'Centor (Faringite)', score, risk, recommendation }
}

// Cálculo de clearance de creatinina (Cockroft-Gault)
export function calculateCreatinineClearance(
  age: number,
  weight: number,
  creatinine: number,
  gender: 'M' | 'F'
): number {
  const factor = gender === 'F' ? 0.85 : 1
  return ((140 - age) * weight * factor) / (72 * creatinine)
}

// Ajuste de dose renal
export function getRenal DoseAdjustment(
  clearance: number,
  medication: string
): string {
  if (clearance >= 60) return 'Dose normal'
  if (clearance >= 30) return 'Reduzir dose em 50%'
  if (clearance >= 15) return 'Reduzir dose em 75%'
  return 'Contraindicado ou dose mínima com monitorização'
}

// Cálculo de IMC e classificação
export function calculateBMI(weight: number, height: number): {
  bmi: number
  classification: string
  recommendations: string[]
} {
  const bmi = weight / ((height / 100) ** 2)
  
  let classification: string
  let recommendations: string[] = []
  
  if (bmi < 18.5) {
    classification = 'Abaixo do peso'
    recommendations = ['Avaliação nutricional', 'Investigar causas de baixo peso']
  } else if (bmi < 25) {
    classification = 'Normal'
    recommendations = ['Manter peso atual', 'Hábitos saudáveis']
  } else if (bmi < 30) {
    classification = 'Sobrepeso'
    recommendations = ['Reeducação alimentar', 'Atividade física regular']
  } else if (bmi < 35) {
    classification = 'Obesidade Grau I'
    recommendations = ['Acompanhamento nutricional', 'Avaliação cardiovascular']
  } else if (bmi < 40) {
    classification = 'Obesidade Grau II'
    recommendations = ['Tratamento multidisciplinar', 'Avaliação de comorbidades']
  } else {
    classification = 'Obesidade Grau III'
    recommendations = ['Avaliação para cirurgia bariátrica', 'Tratamento intensivo']
  }
  
  return { bmi: Number(bmi.toFixed(2)), classification, recommendations }
}

// Verificação de interações medicamentosas básicas
export function checkDrugInteractions(medications: string[]): string[] {
  const interactions: string[] = []
  const drugList = medications.map(med => med.toLowerCase())
  
  // Algumas interações comuns
  if (drugList.some(med => med.includes('varfarina')) && 
      drugList.some(med => med.includes('aspirina'))) {
    interactions.push('⚠️ Varfarina + AAS: Risco aumentado de sangramento')
  }
  
  if (drugList.some(med => med.includes('digoxina')) && 
      drugList.some(med => med.includes('furosemida'))) {
    interactions.push('⚠️ Digoxina + Furosemida: Risco de intoxicação digitálica')
  }
  
  if (drugList.some(med => med.includes('enalapril')) && 
      drugList.some(med => med.includes('espironolactona'))) {
    interactions.push('⚠️ IECA + Espironolactona: Risco de hipercalemia')
  }
  
  return interactions
}
