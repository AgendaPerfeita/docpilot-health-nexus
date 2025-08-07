import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Medication {
  id: number;
  name: string;
  concentration: string;
  form: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ValidationResult {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  field?: string;
}

interface PrescriptionValidationProps {
  medications: Medication[];
  instructions: string;
  observations: string;
  validity: number;
  onValidationChange?: (isValid: boolean, errors: ValidationResult[]) => void;
}

export const PrescriptionValidation: React.FC<PrescriptionValidationProps> = ({
  medications,
  instructions,
  observations,
  validity,
  onValidationChange
}) => {
  const [validationResults, setValidationResults] = React.useState<ValidationResult[]>([]);

  React.useEffect(() => {
    const results = validatePrescription();
    setValidationResults(results);
    
    const hasErrors = results.some(r => r.type === 'error');
    onValidationChange?.((!hasErrors && medications.length > 0), results);
  }, [medications, instructions, observations, validity, onValidationChange]);

  const validatePrescription = (): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Validação básica - medicamentos
    if (medications.length === 0) {
      results.push({
        type: 'error',
        message: 'É necessário adicionar pelo menos um medicamento à prescrição.',
        field: 'medications'
      });
    }

    // Validar medicamentos individuais
    medications.forEach((med, index) => {
      if (!med.name.trim()) {
        results.push({
          type: 'error',
          message: `Medicamento ${index + 1}: Nome é obrigatório.`,
          field: `medication_${med.id}_name`
        });
      }

      if (!med.dosage.trim()) {
        results.push({
          type: 'error',
          message: `${med.name || `Medicamento ${index + 1}`}: Posologia é obrigatória.`,
          field: `medication_${med.id}_dosage`
        });
      }

      if (!med.frequency.trim()) {
        results.push({
          type: 'error',
          message: `${med.name || `Medicamento ${index + 1}`}: Frequência é obrigatória.`,
          field: `medication_${med.id}_frequency`
        });
      }

      if (!med.duration.trim()) {
        results.push({
          type: 'error',
          message: `${med.name || `Medicamento ${index + 1}`}: Duração do tratamento é obrigatória.`,
          field: `medication_${med.id}_duration`
        });
      }
    });

    // Verificar medicamentos duplicados
    const medicationNames = medications.map(m => m.name.toLowerCase().trim()).filter(Boolean);
    const duplicates = medicationNames.filter((name, index) => 
      medicationNames.indexOf(name) !== index
    );

    if (duplicates.length > 0) {
      results.push({
        type: 'warning',
        message: `Medicamentos duplicados detectados: ${[...new Set(duplicates)].join(', ')}`,
        field: 'medications'
      });
    }

    // Validar validade
    if (validity <= 0) {
      results.push({
        type: 'error',
        message: 'Validade da receita deve ser maior que 0 dias.',
        field: 'validity'
      });
    }

    if (validity > 365) {
      results.push({
        type: 'warning',
        message: 'Validade muito longa. Considere reduzir para menos de 1 ano.',
        field: 'validity'
      });
    }

    // Verificações de segurança básicas
    const controlledSubstances = [
      'tramadol', 'codeína', 'morfina', 'fentanil', 'clonazepam', 
      'diazepam', 'alprazolam', 'bromazepam', 'lorazepam', 'zolpidem',
      'ritalina', 'metilfenidato', 'anfetamina', 'sibutramina'
    ];

    medications.forEach(med => {
      const medName = med.name.toLowerCase();
      const hasControlled = controlledSubstances.some(substance => 
        medName.includes(substance)
      );

      if (hasControlled) {
        results.push({
          type: 'warning',
          message: `${med.name}: Substância controlada detectada. Verifique regulamentações específicas.`,
          field: `medication_${med.id}_controlled`
        });
      }

      // Verificar dosagens altas (exemplos básicos)
      if (medName.includes('paracetamol') && med.dosage.includes('1000mg') && 
          (med.frequency.includes('6/6') || med.frequency.includes('4/4'))) {
        results.push({
          type: 'warning',
          message: `${med.name}: Dosagem alta de paracetamol. Verificar dose diária total.`,
          field: `medication_${med.id}_dosage`
        });
      }
    });

    // Informações úteis
    if (medications.length > 0 && !instructions.trim()) {
      results.push({
        type: 'info',
        message: 'Considere adicionar instruções gerais para melhor orientação do paciente.',
        field: 'instructions'
      });
    }

    if (medications.length >= 5) {
      results.push({
        type: 'info',
        message: 'Prescrição com muitos medicamentos. Considere revisar possíveis interações.',
        field: 'medications'
      });
    }

    return results;
  };

  const getIcon = (type: ValidationResult['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: ValidationResult['type']) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      default: return 'default';
    }
  };

  if (validationResults.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Prescrição válida e pronta para ser finalizada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {validationResults.map((result, index) => (
        <Alert 
          key={index} 
          variant={getVariant(result.type)}
          className={
            result.type === 'warning' 
              ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950' 
              : result.type === 'info'
              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
              : ''
          }
        >
          <div className={
            result.type === 'warning' 
              ? 'text-amber-600' 
              : result.type === 'info'
              ? 'text-blue-600'
              : ''
          }>
            {getIcon(result.type)}
          </div>
          <AlertDescription className={
            result.type === 'warning' 
              ? 'text-amber-800 dark:text-amber-200' 
              : result.type === 'info'
              ? 'text-blue-800 dark:text-blue-200'
              : ''
          }>
            {result.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};