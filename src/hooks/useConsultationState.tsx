import { useState, useEffect, useRef } from 'react';

interface ConsultationState {
  pacienteId: string;
  isActive: boolean;
  startTime: string;
  elapsedSeconds: number;
  antecedentes: {
    clinicos: string;
    cirurgicos: string;
    familiares: string;
    habitos: string;
    alergias: string;
    medicamentos: string;
  };
  medicamentos: Array<{
    nome: string;
    dosagem: string;
    quantidade: string;
    frequencia: string;
    tempoUso: string;
  }>;
  prontuarioData: {
    queixa_principal: string;
    historia_doenca_atual: string;
    exame_fisico: string;
    hipotese_diagnostica: string;
    conduta: string;
    observacoes: string;
  };
}

const STORAGE_KEY = 'smartdoc_consultation_state';

export const useConsultationState = (pacienteId?: string) => {
  const [hasActiveConsultation, setHasActiveConsultation] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar se existe uma consulta ativa para este paciente
  useEffect(() => {
    if (!pacienteId) return;

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: ConsultationState = JSON.parse(savedState);
        if (state.pacienteId === pacienteId && state.isActive) {
          setHasActiveConsultation(true);
          
          // Calcular tempo decorrido
          const startTime = new Date(state.startTime);
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          setElapsedTime(elapsed);
          
          // Iniciar timer
          startTimer();
        }
      } catch (error) {
        console.error('Erro ao carregar estado da consulta:', error);
        clearConsultationState();
      }
    }
  }, [pacienteId]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const saveConsultationState = (state: Partial<ConsultationState>) => {
    if (!pacienteId) return;

    const currentState: ConsultationState = {
      pacienteId,
      isActive: true,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
      antecedentes: {
        clinicos: '',
        cirurgicos: '',
        familiares: '',
        habitos: '',
        alergias: '',
        medicamentos: ''
      },
      medicamentos: [],
      prontuarioData: {
        queixa_principal: '',
        historia_doenca_atual: '',
        exame_fisico: '',
        hipotese_diagnostica: '',
        conduta: '',
        observacoes: ''
      },
      ...state
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    setHasActiveConsultation(true);
    startTimer();
  };

  const updateConsultationState = (updates: Partial<ConsultationState>) => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const currentState: ConsultationState = JSON.parse(savedState);
        const updatedState = { 
          ...currentState, 
          ...updates,
          elapsedSeconds: elapsedTime // Sempre atualizar o tempo decorrido
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      } catch (error) {
        console.error('Erro ao atualizar estado da consulta:', error);
      }
    }
  };

  const clearConsultationState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasActiveConsultation(false);
    stopTimer();
    setElapsedTime(0);
  };

  const getConsultationState = (): ConsultationState | null => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (error) {
        console.error('Erro ao obter estado da consulta:', error);
        return null;
      }
    }
    return null;
  };

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Limpar timer quando componente for desmontado
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return {
    hasActiveConsultation,
    elapsedTime,
    formattedElapsedTime: formatElapsedTime(elapsedTime),
    saveConsultationState,
    updateConsultationState,
    clearConsultationState,
    getConsultationState,
    startTimer,
    stopTimer
  };
}; 