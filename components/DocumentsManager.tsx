
import React, { useState } from 'react';
import { FileTextIcon, PrinterIcon, PlusIcon, DownloadIcon, TrashIcon, CheckCircleIcon } from './Icons';

interface DocumentTemplate {
    id: string;
    title: string;
    content: string;
}

const DEFAULT_TEMPLATES: DocumentTemplate[] = [
    { id: '1', title: 'Atestado de Comparecimento', content: 'Atesto para os devidos fins que o(a) paciente {paciente_nome} esteve sob meus cuidados profissionais para realização de sessão de fisioterapia no dia {data_hoje}, no período das {hora_inicio} às {hora_fim}.' },
    { id: '2', title: 'Encaminhamento Médico', content: 'Ao Dr(a). Ortopedista,\n\nEncaminho o(a) paciente {paciente_nome} para avaliação médica especializada devido a queixas persistentes de dor na região lombar, com irradiação para MMII e parestesia.\n\nAtenciosamente,\nDr. Lucas Silva - Crefito 123456-F' },
    { id: '3', title: 'Laudo Fisioterapêutico', content: 'PACIENTE: {paciente_nome}\nDATA: {data_hoje}\n\nO paciente encontra-se em tratamento fisioterapêutico para reabilitação de pós-operatório de LCA (Joelho D). Apresenta ganho progressivo de ADM (Flexão 110º) e força muscular grau 4.\n\nSugere-se continuidade do tratamento por mais 10 sessões.' }
];

const DocumentsManager = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
    const [patientName, setPatientName] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [recentDocs, setRecentDocs] = useState([
        { id: 1, name: 'Atestado - Ana Silva', date: 'Hoje', type: 'Atestado' },
        { id: 2, name: 'Encaminhamento - Carlos O.', date: 'Ontem', type: 'Encaminhamento' }
    ]);

    const handleSelectTemplate = (template: DocumentTemplate) => {
        setSelectedTemplate(template);
        // Auto-fill mock logic
        let content = template.content
            .replace('{data_hoje}', new Date().toLocaleDateString('pt-BR'))
            .replace('{hora_inicio}', '14:00')
            .replace('{hora_fim}', '15:00');
        
        if (patientName) {
            content = content.replace('{paciente_nome}', patientName);
        }
        setGeneratedContent(content);
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientName(e.target.value);
        if (selectedTemplate) {
            const content = generatedContent.replace(/{paciente_nome}/g, e.target.value);
            setGeneratedContent(content); 
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Documento</title>
                        <style>
                            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>FisioFlow Clínica</h1>
                            <p>Dr. Lucas Silva - Crefito 123456-F</p>
                        </div>
                        <div style="white-space: pre-wrap;">${generatedContent}</div>
                        <div class="footer">
                            <p>Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}</p>
                            <p>Rua Exemplo, 123 - São Paulo, SP</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-6">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5 text-primary" />
                        Modelos Disponíveis
                    </h3>
                    <div className="space-y-2">
                        {DEFAULT_TEMPLATES.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => handleSelectTemplate(t)}
                                className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors border ${selectedTemplate?.id === t.id ? 'bg-blue-50 border-blue-200 text-primary' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                            >
                                {t.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm">Histórico Recente</h3>
                    <div className="space-y-3">
                        {recentDocs.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded transition-colors group">
                                <div>
                                    <p className="font-medium text-slate-700">{doc.name}</p>
                                    <p className="text-xs text-slate-500">{doc.date} • {doc.type}</p>
                                </div>
                                <button className="text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PrinterIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-600">Paciente:</span>
                        <input 
                            type="text" 
                            placeholder="Digite o nome..." 
                            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                            value={patientName}
                            onChange={handlePatientChange}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrint}
                            disabled={!generatedContent}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Imprimir / PDF
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 p-8 bg-slate-100 overflow-y-auto">
                    <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg p-12 text-slate-800 relative">
                        {/* Letterhead Mock */}
                        <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center">
                            <h1 className="text-2xl font-bold uppercase tracking-wider">FisioFlow Clínica</h1>
                            <p className="text-sm text-slate-500 mt-1">Reabilitação & Performance</p>
                        </div>

                        {generatedContent ? (
                            <textarea 
                                className="w-full h-[600px] resize-none outline-none text-base leading-relaxed font-serif text-slate-900 placeholder:text-slate-300"
                                value={generatedContent}
                                onChange={(e) => setGeneratedContent(e.target.value)}
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-300 italic">
                                Selecione um modelo ao lado para começar...
                            </div>
                        )}

                        {generatedContent && (
                            <div className="mt-20 pt-8 text-center">
                                <div className="w-64 border-t border-slate-400 mx-auto mb-2"></div>
                                <p className="font-bold text-sm">Dr. Lucas Silva</p>
                                <p className="text-xs text-slate-500">Crefito 123456-F</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentsManager;
