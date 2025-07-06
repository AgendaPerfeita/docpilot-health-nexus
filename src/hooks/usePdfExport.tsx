import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Prontuario } from './useProntuarios';
import { Paciente } from './usePacientes';

export const usePdfExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportToPdf = async (elementId: string, filename: string = 'documento.pdf') => {
    try {
      setExporting(true);
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  const generateProntuarioPdf = (prontuario: Prontuario, paciente: Paciente) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PRONTUÁRIO MÉDICO', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date(prontuario.data_atendimento).toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Patient info
    doc.setFontSize(14);
    doc.text('DADOS DO PACIENTE', 20, 50);
    doc.setFontSize(10);
    doc.text(`Nome: ${paciente.nome}`, 20, 60);
    if (paciente.data_nascimento) {
      const idade = new Date().getFullYear() - new Date(paciente.data_nascimento).getFullYear();
      doc.text(`Idade: ${idade} anos`, 20, 70);
    }
    if (paciente.convenio) {
      doc.text(`Convênio: ${paciente.convenio}`, 20, 80);
    }

    let yPosition = 95;

    // Medical content
    if (prontuario.queixa_principal) {
      doc.setFontSize(12);
      doc.text('QUEIXA PRINCIPAL', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(prontuario.queixa_principal, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    }

    if (prontuario.historia_doenca_atual) {
      doc.setFontSize(12);
      doc.text('HISTÓRIA DA DOENÇA ATUAL', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(prontuario.historia_doenca_atual, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    }

    if (prontuario.exame_fisico) {
      doc.setFontSize(12);
      doc.text('EXAME FÍSICO', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(prontuario.exame_fisico, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    }

    if (prontuario.hipotese_diagnostica) {
      doc.setFontSize(12);
      doc.text('HIPÓTESE DIAGNÓSTICA', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(prontuario.hipotese_diagnostica, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    }

    if (prontuario.conduta) {
      doc.setFontSize(12);
      doc.text('CONDUTA', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(prontuario.conduta, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    }

    // Prescriptions
    if (prontuario.prescricoes && prontuario.prescricoes.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text('PRESCRIÇÕES', 20, yPosition);
      yPosition += 10;
      
      prontuario.prescricoes.forEach((prescricao, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${prescricao.medicamento}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Dosagem: ${prescricao.dosagem}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Frequência: ${prescricao.frequencia}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Duração: ${prescricao.duracao}`, 25, yPosition);
        yPosition += 10;
      });
    }

    const filename = `prontuario_${paciente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const printElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Impressão</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return {
    exportToPdf,
    generateProntuarioPdf,
    printElement,
    exporting
  };
};