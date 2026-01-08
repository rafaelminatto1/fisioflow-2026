
import React, { useState } from 'react';
import { PenToolIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XIcon, ShieldIcon, FileTextIcon } from './Icons';

interface ContractTemplate {
    id: string;
    title: string;
    description: string;
    content: string;
    status: 'active' | 'draft';
    version: string;
}

const MOCK_TEMPLATES: ContractTemplate[] = [
    { 
        id: '1', 
        title: 'Termo de Consentimento - Fisioterapia', 
        description: 'Autorização padrão para procedimentos terapêuticos.',
        content: 'Eu, {paciente_nome}, portador do CPF {paciente_cpf}, autorizo a realização dos procedimentos de fisioterapia...',
        status: 'active',
        version: '1.2'
    },
    { 
        id: '2', 
        title: 'Contrato de Prestação de Serviços', 
        description: 'Cláusulas financeiras e regras de cancelamento.',
        content: 'CONTRATANTE: {paciente_nome}\n\nCLÁUSULA 1: O cancelamento deve ocorrer com 24h de antecedência...',
        status: 'active',
        version: '2.0'
    },
    { 
        id: '3', 
        title: 'Termo de Uso de Imagem (LGPD)', 
        description: 'Para uso em redes sociais e fins acadêmicos.',
        content: 'Autorizo o uso da minha imagem para fins de divulgação científica e marketing...',
        status: 'draft',
        version: '0.9'
    },
];

const ContractsManager = () => {
    const [templates, setTemplates] = useState<ContractTemplate[]>(MOCK_TEMPLATES);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<ContractTemplate>>({});

    const handleSave = () => {
        if (!currentTemplate.title || !currentTemplate.content) return alert("Preencha os campos obrigatórios.");
        
        if (currentTemplate.id) {
            setTemplates(prev => prev.map(t => t.id === currentTemplate.id ? { ...t, ...currentTemplate } as ContractTemplate : t));
        } else {
            setTemplates(prev => [...prev, { ...currentTemplate, id: Date.now().toString(), status: 'draft', version: '1.0' } as ContractTemplate]);
        }
        setIsEditing(false);
        setCurrentTemplate({});
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir modelo de contrato?")) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const insertVariable = (variable: string) => {
        setCurrentTemplate(prev => ({ ...prev, content: (prev.content || '') + variable }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <PenToolIcon className="w-6 h-6 text-primary" />
                        Gestão de Contratos (Jurídico)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie termos legais, LGPD e contratos de serviço.</p>
                </div>
                <button 
                    onClick={() => { setCurrentTemplate({}); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Modelo
                </button>
            </div>

            {isEditing ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">{currentTemplate.id ? 'Editar Contrato' : 'Novo Contrato'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6" /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Título do Documento</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                    placeholder="Ex: Contrato de Pilates 2024"
                                    value={currentTemplate.title || ''}
                                    onChange={e => setCurrentTemplate(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Descrição Interna</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                    placeholder="Ex: Modelo padrão para novos alunos"
                                    value={currentTemplate.description || ''}
                                    onChange={e => setCurrentTemplate(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Conteúdo do Contrato</label>
                                <textarea 
                                    className="w-full h-96 p-4 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none font-mono text-slate-700 leading-relaxed resize-none" 
                                    placeholder="Digite as cláusulas aqui..."
                                    value={currentTemplate.content || ''}
                                    onChange={e => setCurrentTemplate(p => ({ ...p, content: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-sm text-slate-700 mb-3">Configurações</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                                        <select 
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                                            value={currentTemplate.status || 'draft'}
                                            onChange={e => setCurrentTemplate(p => ({ ...p, status: e.target.value as any }))}
                                        >
                                            <option value="draft">Rascunho</option>
                                            <option value="active">Ativo (Em uso)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Versão</label>
                                        <input 
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" 
                                            value={currentTemplate.version || '1.0'}
                                            onChange={e => setCurrentTemplate(p => ({ ...p, version: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-sm text-slate-700 mb-3">Variáveis Dinâmicas</h4>
                                <p className="text-xs text-slate-500 mb-3">Clique para inserir no texto:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['{paciente_nome}', '{paciente_cpf}', '{data_atual}', '{clinica_nome}', '{valor_mensalidade}'].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => insertVariable(v)}
                                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-mono rounded hover:bg-blue-100 border border-blue-100 transition-colors"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" /> Salvar Modelo
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(t => (
                        <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {t.title.includes('LGPD') ? <ShieldIcon className="w-6 h-6" /> : <FileTextIcon className="w-6 h-6" />}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border ${
                                    t.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                    {t.status === 'active' ? 'Ativo' : 'Rascunho'}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-slate-900 mb-1">{t.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{t.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-xs text-slate-400 font-mono">v{t.version}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setCurrentTemplate(t); setIsEditing(true); }}
                                        className="text-slate-400 hover:text-amber-500 p-1.5 rounded hover:bg-amber-50 transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContractsManager;
