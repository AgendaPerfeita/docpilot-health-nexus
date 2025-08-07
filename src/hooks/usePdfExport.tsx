import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Prontuario } from './useProntuarios';
import { Paciente } from './usePacientes';

interface PrescriptionData {
  paciente: any;
  medicamentos: any[];
  instrucoes: string;
  observacoes: string;
  medico: any;
  numeroDocumento: string;
  dataEmissao: string;
  codigoVerificacao?: string;
  urlValidacao?: string;
}

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

  const generatePrescriptionPdf = async (data: PrescriptionData) => {
    const doc = new jsPDF();
    
    // Header principal
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEITA MÉDICA', 105, 15, { align: 'center' });
    
    doc.setDrawColor(0, 123, 191);
    doc.setLineWidth(2);
    doc.line(20, 25, 190, 25);
    
    // Dados do médico
    let yPos = 45;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO MÉDICO', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dr. ${data.medico.nome}`, 20, yPos);
    
    yPos += 5;
    doc.text(`CRM: ${data.medico.crm} - ${data.medico.especialidade || 'Medicina Geral'}`, 20, yPos);
    
    if (data.medico.endereco) {
      yPos += 5;
      doc.text(`Endereço: ${data.medico.endereco}`, 20, yPos);
    }
    
    if (data.medico.telefone) {
      yPos += 5;
      doc.text(`Telefone: ${data.medico.telefone}`, 20, yPos);
    }
    
    // Linha separadora
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    
    // Dados do paciente
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO PACIENTE', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${data.paciente.nome}`, 20, yPos);
    
    if (data.paciente.data_nascimento) {
      const idade = new Date().getFullYear() - new Date(data.paciente.data_nascimento).getFullYear();
      yPos += 5;
      doc.text(`Idade: ${idade} anos - Data Nascimento: ${new Date(data.paciente.data_nascimento).toLocaleDateString('pt-BR')}`, 20, yPos);
    }
    
    if (data.paciente.cpf) {
      yPos += 5;
      doc.text(`CPF: ${data.paciente.cpf}`, 20, yPos);
    }
    
    // Linha separadora
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    
    // Prescrição
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIÇÃO MÉDICA', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    data.medicamentos.forEach((med, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${med.name}`, 25, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      if (med.dosage) {
        doc.text(`   Posologia: ${med.dosage}`, 25, yPos);
        yPos += 5;
      }
      
      if (med.duration) {
        doc.text(`   Duração: ${med.duration}`, 25, yPos);
        yPos += 5;
      }
      
      yPos += 3;
    });
    
    // Instruções
    if (data.instrucoes) {
      yPos += 10;
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INSTRUÇÕES GERAIS:', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const instrucaoLines = doc.splitTextToSize(data.instrucoes, 170);
      doc.text(instrucaoLines, 20, yPos);
      yPos += instrucaoLines.length * 5;
    }
    
    // Observações
    if (data.observacoes) {
      yPos += 10;
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(data.observacoes, 170);
      doc.text(obsLines, 20, yPos);
      yPos += obsLines.length * 5;
    }

    // QR Code de validação (se disponível)
    if (data.codigoVerificacao && data.urlValidacao) {
      try {
        // Gerar QR code como data URL
        const qrDataUrl = await QRCode.toDataURL(data.urlValidacao, {
          width: 100,
          margin: 2
        });

        // Posição do QR code no canto inferior direito
        if (yPos > 220) {
          doc.addPage();
          yPos = 50;
        }

        const qrX = 150;
        const qrY = Math.max(yPos + 20, 200);
        
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, 30, 30);
        
        // Informações de validação
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Validação Digital:', qrX, qrY + 35);
        doc.text(`Código: ${data.codigoVerificacao}`, qrX, qrY + 40);
        doc.text('Escaneie o QR para validar', qrX, qrY + 45);
      } catch (error) {
        console.error('Erro ao gerar QR code:', error);
      }
    }
    
    // Assinatura
    if (yPos > 220) {
      doc.addPage();
      yPos = 100;
    } else {
      yPos = Math.max(yPos + 30, 220);
    }
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(120, yPos, 190, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${data.medico.nome}`, 155, yPos, { align: 'center' });
    
    yPos += 5;
    doc.text(`CRM: ${data.medico.crm}`, 155, yPos, { align: 'center' });
    
    // Rodapé
    yPos += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Data: ${data.dataEmissao}`, 20, yPos);
    doc.text(`Documento: ${data.numeroDocumento}`, 105, yPos, { align: 'center' });
    
    if (data.codigoVerificacao) {
      doc.text('Assinado digitalmente', 190, yPos, { align: 'right' });
    }
    
    return doc;
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
    generatePrescriptionPdf,
    generateProntuarioPdf,
    printElement,
    exporting
  };
};