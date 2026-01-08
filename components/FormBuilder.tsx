
import React, { useState } from 'react';
import { FileTextIcon, PlusIcon, TrashIcon, ListIcon, CheckCircleIcon, XIcon, GripVerticalIcon } from './Icons';

interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'scale';
    label: string;
    options?: string[]; // For select
    required: boolean;
}

interface FormTemplate {
    id: string;
    title: string;
    description: string;
    fields: FormField[];
}

const FIELD_TYPES = [
    { type: 'text', label: 'Texto Curto', icon: 'Aa' },
    { type: 'textarea', label: 'Texto Longo', icon: '¶' },
    { type: 'number', label: 'Número', icon: '123' },
    { type: 'select', label: 'Seleção', icon: '▼' },
    { type: 'checkbox', label: 'Checklist', icon: '☑' },
    { type: 'scale', label: 'Escala 0-10', icon: '⟷' },
] as const;

const MOCK_FORMS: FormTemplate[] = [
    { 
        id: '1', 
        title: 'Avaliação Inicial de Ombro', 
        description: 'Protocolo padrão para queixas de ombro (manguito, impacto).', 
        fields: [
            { id: 'f1', type: 'scale', label: 'Nível de Dor (EVA)', required: true },
            { id: 'f2', type: 'text', label: 'ADM Flexão (Graus)', required: true },
            { id: 'f3', type: 'checkbox', label: 'Testes Especiais Positivos', options: ['Neer', 'Hawkins', 'Jobe'], required: false }
        ] 
    }
];

const FormBuilder = () => {
    const [forms, setForms] = useState<FormTemplate[]>(MOCK_FORMS);
    const [isEditing, setIsEditing] = useState(false);
    const [currentForm, setCurrentForm] = useState<Partial<FormTemplate>>({ fields: [] });

    const handleAddField = (type: FormField['type']) => {
        const newField: FormField = {
            id: Date.now().toString(),
            type,
            label: `Novo Campo ${type}`,
            required: false,
            options: type === 'select' || type === 'checkbox' ? ['Opção 1', 'Opção 2'] : undefined
        };
        setCurrentForm(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
    };

    const handleRemoveField = (id: string) => {
        setCurrentForm(prev => ({ ...prev, fields: prev.fields?.filter(f => f.id !== id) }));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setCurrentForm(prev => ({ ...prev, fields: prev.fields?.map(f => f.id === id ? { ...f, ...updates } : f) }));
    };

    const handleSave = () => {
        if (!currentForm.title) return alert("Dê um nome ao formulário.");
        
        if (currentForm.id) {
            setForms(prev => prev.map(f => f.id === currentForm.id ? { ...f, ...currentForm } as FormTemplate : f));
        } else {
            setForms(prev => [...prev, { ...currentForm, id: Date.now().toString() } as FormTemplate]);
        }
        setIsEditing(false);
        setCurrentForm({ fields: [] });
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {!isEditing ? (
                <>
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <FileTextIcon className="w-6 h-6 text-primary" />
                                Fichas de Avaliação
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Crie protocolos e formulários personalizados.</p>
                        </div>
                        <button 
                            onClick={() => { setCurrentForm({ fields: [] }); setIsEditing(true); }}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Criar Ficha
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map(form => (
                            <div key={form.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <h3 className="font-bold text-slate-800 mb-2">{form.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{form.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                    <ListIcon className="w-3 h-3" /> {form.fields.length} campos
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setCurrentForm(form); setIsEditing(true); }}
                                        className="flex-1 py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-xs"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0">
                    {/* Sidebar Toolbox */}
                    <div className="w-full lg:w-64 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-sm text-slate-700">Ferramentas</h3>
                        </div>
                        <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Adicionar Campos</p>
                            {FIELD_TYPES.map(ft => (
                                <button 
                                    key={ft.type}
                                    onClick={() => handleAddField(ft.type)}
                                    className="flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:text-primary border border-slate-100 rounded-lg text-sm text-slate-600 transition-colors text-left"
                                >
                                    <span className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-mono text-xs font-bold">{ft.icon}</span>
                                    {ft.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor Canvas */}
                    <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner flex flex-col overflow-hidden">
                        {/* Toolbar */}
                        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
                            <div className="flex-1 mr-4">
                                <input 
                                    className="text-lg font-bold text-slate-900 border-none outline-none w-full placeholder:text-slate-300" 
                                    placeholder="Nome da Ficha (ex: Avaliação de Joelho)"
                                    value={currentForm.title || ''}
                                    onChange={e => setCurrentForm(p => ({ ...p, title: e.target.value }))}
                                />
                                <input 
                                    className="text-sm text-slate-500 border-none outline-none w-full placeholder:text-slate-300" 
                                    placeholder="Descrição opcional..."
                                    value={currentForm.description || ''}
                                    onChange={e => setCurrentForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 shadow-sm flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4" /> Salvar Ficha
                                </button>
                            </div>
                        </div>

                        {/* Fields Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {currentForm.fields?.length === 0 && (
                                <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
                                    <p>Arraste ou clique nos itens à esquerda para adicionar campos.</p>
                                </div>
                            )}
                            
                            {currentForm.fields?.map((field, index) => (
                                <div key={field.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group animate-in slide-in-from-bottom-2 fade-in">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleRemoveField(field.id)} className="text-slate-400 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                    
                                    <div className="flex gap-4 items-start">
                                        <div className="text-slate-300 pt-2 cursor-grab active:cursor-grabbing"><GripVerticalIcon className="w-4 h-4" /></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-2">
                                                <input 
                                                    className="font-semibold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-primary outline-none bg-transparent w-full"
                                                    value={field.label}
                                                    onChange={e => updateField(field.id, { label: e.target.value })}
                                                />
                                            </div>
                                            
                                            {/* Field Preview/Config */}
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-500 pointer-events-none opacity-80">
                                                {field.type === 'text' && <div className="h-8 border border-slate-200 bg-white rounded w-full"></div>}
                                                {field.type === 'textarea' && <div className="h-20 border border-slate-200 bg-white rounded w-full"></div>}
                                                {field.type === 'scale' && <div className="flex justify-between px-2"><span className="w-4 h-4 rounded-full bg-slate-200"></span><span className="w-full h-1 bg-slate-200 mt-1.5 mx-2"></span><span className="w-4 h-4 rounded-full bg-slate-200"></span></div>}
                                                {(field.type === 'select' || field.type === 'checkbox') && (
                                                    <div className="space-y-1">
                                                        <div className="flex gap-2"><div className="w-4 h-4 border rounded bg-white"></div> Opção 1</div>
                                                        <div className="flex gap-2"><div className="w-4 h-4 border rounded bg-white"></div> Opção 2</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs">
                                                <label className="flex items-center gap-1 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={field.required} 
                                                        onChange={e => updateField(field.id, { required: e.target.checked })}
                                                        className="rounded text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-slate-500">Obrigatório</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormBuilder;
