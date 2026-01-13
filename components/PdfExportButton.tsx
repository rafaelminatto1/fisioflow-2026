'use client';

import React, { useState } from 'react';
import { DownloadIcon, LoaderIcon, FileTextIcon, XIcon } from './Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PdfExportButtonProps {
  patient: {
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    condition?: string;
  };
  sessions?: Array<{
    id: string;
    date: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    evaScore?: number;
  }>;
  type?: 'evolution' | 'report' | 'discharge';
  title?: string;
  className?: string;
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  patient,
  sessions = [],
  type = 'evolution',
  title = 'Relatório de Evolução',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  };

  const generatePdf = async () => {
    try {
      setLoading(true);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper to check if we need a new page
      const checkNewPage = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper to draw a section header
      const drawSectionHeader = (text: string) => {
        checkNewPage(15);
        pdf.setFillColor(59, 130, 246); // primary color
        pdf.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text, margin + 3, yPosition + 5.5);
        yPosition += 12;
      };

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 35, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FisioFlow', margin, 15);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(title, margin, 23);

      pdf.setFontSize(9);
      pdf.text(`Gerado em: ${formatDate(new Date().toISOString())}`, pageWidth - margin, 23, { align: 'right' });

      yPosition = 42;

      // Patient Info Section
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dados do Paciente', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      pdf.text(`Nome: ${patient.name}`, margin + 5, yPosition);
      yPosition += 6;

      if (patient.birthDate) {
        pdf.text(`Idade: ${calculateAge(patient.birthDate)} anos`, margin + 5, yPosition);
        yPosition += 6;
      }

      if (patient.cpf) {
        pdf.text(`CPF: ${patient.cpf}`, margin + 5, yPosition);
        yPosition += 6;
      }

      if (patient.phone) {
        pdf.text(`Telefone: ${patient.phone}`, margin + 5, yPosition);
        yPosition += 6;
      }

      if (patient.condition) {
        pdf.text(`Condição: ${patient.condition}`, margin + 5, yPosition);
        yPosition += 6;
      }

      yPosition += 5;

      // Sessions Section
      if (sessions.length > 0) {
        drawSectionHeader('Histórico de Evoluções');

        sessions.forEach((session, index) => {
          const sectionHeight = 60;
          checkNewPage(sectionHeight);

          // Session date
          pdf.setTextColor(59, 130, 246);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Sessão ${index + 1} - ${formatDate(session.date)}`, margin, yPosition);
          yPosition += 7;

          // EVA Score if available
          if (session.evaScore !== undefined) {
            pdf.setTextColor(100, 116, 139);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`EVA: ${session.evaScore}/10`, margin, yPosition);
            yPosition += 7;
          }

          pdf.setTextColor(30, 41, 59);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');

          // SOAP sections
          const maxCharsPerLine = 90;
          const wrapText = (text: string | undefined, prefix: string) => {
            if (!text) return;
            const lines = pdf.splitTextToSize(text, pageWidth - margin * 2 - 10);
            pdf.setTextColor(30, 41, 59);
            pdf.setFontSize(8);
            lines.forEach((line: string) => {
              checkNewPage(5);
              pdf.text(line, margin + 5, yPosition);
              yPosition += 4;
            });
            yPosition += 2;
          };

          if (session.subjective) {
            pdf.setTextColor(59, 130, 246);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('S:', margin + 2, yPosition);
            yPosition += 4;
            wrapText(session.subjective, 'S');
          }

          if (session.objective) {
            pdf.setTextColor(16, 185, 129);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('O:', margin + 2, yPosition);
            yPosition += 4;
            wrapText(session.objective, 'O');
          }

          if (session.assessment) {
            pdf.setTextColor(245, 158, 11);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('A:', margin + 2, yPosition);
            yPosition += 4;
            wrapText(session.assessment, 'A');
          }

          if (session.plan) {
            pdf.setTextColor(139, 92, 246);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('P:', margin + 2, yPosition);
            yPosition += 4;
            wrapText(session.plan, 'P');
          }

          yPosition += 5;
        });
      }

      // Footer on all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Página ${i} de ${pageCount} - FisioFlow © ${new Date().getFullYear()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `${patient.name.replace(/\s+/g, '_')}_${type}_${formatDate(new Date().toISOString())}.pdf`;
      pdf.save(fileName);

      setShowPreview(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors ${className}`}
        disabled={loading}
      >
        {loading ? (
          <LoaderIcon className="w-4 h-4 animate-spin" />
        ) : (
          <DownloadIcon className="w-4 h-4" />
        )}
        Exportar PDF
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-in fade-in zoom-in duration-200 border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileTextIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exportar PDF</h3>
                <p className="text-sm text-slate-500">Selecione o conteúdo do PDF</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="ml-auto text-slate-400 hover:text-white hover:bg-red-500 transition-all p-2 rounded-lg"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Paciente:</strong> {patient.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Sessões:</strong> {sessions.length} evolução{sessions.length !== 1 ? 's' : ''}
                </p>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Incluir dados do paciente</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Incluir histórico de evoluções</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Incluir pontuação EVA</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={generatePdf}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4" />
                    Baixar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PdfExportButton;
