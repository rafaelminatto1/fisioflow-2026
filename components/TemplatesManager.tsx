
import React, { useState } from 'react';
import { FileTextIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XIcon, CopyIcon } from './Icons';

interface Macro {
    id: string;
    title: string;
    shortcut: string;
    content: string;
    category: string;
}

const MOCK_MACROS: Macro[] = [
    { id: '1', title: 'Avaliação Joelho Padrão', shortcut: '/av-joelho', category: 'Avaliação', content: 'Paciente refere dor anterior em joelho D. Edema ++/4+. ADM passiva limitada em flexão (90º). Teste de Lachman negativo.' },
    { id: '2', title: 'Evolução Pós-Op Imediato', shortcut: '/po-imediato', category: 'Evolução', content: 'Realizada crioterapia (20min), mobilização patelar e exercícios isométricos de quadríceps. Paciente tolerou bem.' },
    { id: '3', title: 'Alta Fisioterapêutica', shortcut: '/alta', category: 'Conclusão', content: 'Paciente recebe alta fisioterapêutica por atingir objetivos traçados: ausência de dor, ADM completa e retorno ao esporte.' },
];

const TemplatesManager = () => {
    const [macros, setMacros] = useState<Macro[]>(MOCK_MACROS);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMacro, setCurrentMacro] = useState<Partial<Macro>>({});

    const handleSave = () => {
        if (!currentMacro.title || !currentMacro.content) return alert("Preencha título e conteúdo.");
        
        if (currentMacro.id) {
            setMacros(prev => prev.map(m => m.id === currentMacro.id ? { ...m, ...currentMacro } as Macro : m));
        } else {
            setMacros(prev => [...prev, { ...currentMacro, id: Date.now().toString() } as Macro]);
        }
        setIsEditing(false);
        setCurrentMacro({});
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir template?")) {
            setMacros(prev => prev.filter(m => m.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileTextIcon className="w-6 h-6 text-primary" />
                        Templates de Evolução
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Crie atalhos para agilizar suas anotações diárias.</p>
                </div>
                <button 
                    onClick={() => { setCurrentMacro({}); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Template
                </button>
            </div>

            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800">{currentMacro.id ? 'Editar Template' : 'Novo Template'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input 
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                            placeholder="Título (ex: Joelho Padrão)"
                            value={currentMacro.title || ''}
                            onChange={e => setCurrentMacro(p => ({ ...p, title: e.target.value }))}
                        />
                        <input 
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                            placeholder="Atalho (ex: /joelho)"
                            value={currentMacro.shortcut || ''}
                            onChange={e => setCurrentMacro(p => ({ ...p, shortcut: e.target.value }))}
                        />
                        <select 
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            value={currentMacro.category || ''}
                            onChange={e => setCurrentMacro(p => ({ ...p, category: e.target.value }))}
                        >
                            <option value="">Selecione Categoria...</option>
                            <option value="Avaliação">Avaliação</option>
                            <option value="Evolução">Evolução</option>
                            <option value="Conclusão">Conclusão</option>
                        </select>
                    </div>
                    <textarea 
                        className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm mb-4 resize-none"
                        placeholder="Texto do template..."
                        value={currentMacro.content || ''}
                        onChange={e => setCurrentMacro(p => ({ ...p, content: e.target.value }))}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600">Salvar</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {macros.map(macro => (
                    <div key={macro.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 transition-colors group relative">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">{macro.category}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setCurrentMacro(macro); setIsEditing(true); }} className="p-1.5 text-slate-400 hover:text-amber-500 bg-slate-50 rounded"><PencilIcon className="w-3 h-3" /></button>
                                <button onClick={() => handleDelete(macro.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded"><TrashIcon className="w-3 h-3" /></button>
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{macro.title}</h4>
                        <div className="flex items-center gap-2 mb-3">
                            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{macro.shortcut}</code>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                            "{macro.content}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplatesManager;
