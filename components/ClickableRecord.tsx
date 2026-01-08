
'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, AlertCircleIcon } from './Icons';

interface Option {
    id: string;
    label: string;
    color?: string;
}

interface Section {
    id: string;
    title: string;
    type: 'single' | 'multiple';
    options: Option[];
}

const PILATES_TEMPLATE: Section[] = [
    {
        id: 'pain_arrival',
        title: 'Paciente Chegou',
        type: 'single',
        options: [
            { id: 'pain', label: 'Com Dor', color: 'bg-red-100 text-red-700 border-red-200' },
            { id: 'no_pain', label: 'Sem Dor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
        ]
    },
    {
        id: 'power_house',
        title: 'Avaliação do Power House',
        type: 'single',
        options: [
            { id: 'great', label: 'Ótimo', color: 'bg-blue-50 text-blue-700' },
            { id: 'good', label: 'Bom', color: 'bg-blue-50 text-blue-700' },
            { id: 'bad', label: 'Ruim', color: 'bg-orange-50 text-orange-700' }
        ]
    },
    // Seção MMII expandida conforme PDF
    {
        id: 'mmii_general',
        title: 'Membros Inferiores (Geral)',
        type: 'multiple',
        options: [
            { id: 'stretch', label: 'Alongamento' },
            { id: 'strength', label: 'Fortalecimento' },
            { id: 'mobility', label: 'Mobilidade' },
            { id: 'proprioception', label: 'Propriocepção' }
        ]
    },
    {
        id: 'mmii_specific',
        title: 'MMII - Ênfase Específica',
        type: 'multiple',
        options: [
            { id: 'quadriceps', label: 'Quadríceps' },
            { id: 'hamstrings', label: 'Isquiotibiais' },
            { id: 'glutes', label: 'Glúteos' },
            { id: 'calves', label: 'Panturrilha' }
        ]
    },
    // Seção Tronco conforme PDF
    {
        id: 'spine',
        title: 'Coluna / Tronco',
        type: 'multiple',
        options: [
            { id: 'stretch', label: 'Alongamento' },
            { id: 'strength', label: 'Fortalecimento' },
            { id: 'mobility', label: 'Mobilidade' },
            { id: 'stabilization', label: 'Estabilização Segmentar' }
        ]
    },
    // Seção MMSS conforme PDF
    {
        id: 'mmss',
        title: 'Membros Superiores (MMSS)',
        type: 'multiple',
        options: [
            { id: 'stretch', label: 'Alongamento' },
            { id: 'strength', label: 'Fortalecimento' },
            { id: 'mobility', label: 'Mobilidade' },
            { id: 'scapula', label: 'Estabilização Escapular' }
        ]
    },
    // Dor
    {
        id: 'pain_scale',
        title: 'Escala da Dor (EVA)',
        type: 'single',
        options: Array.from({length: 11}, (_, i) => ({ 
            id: String(i), 
            label: String(i), 
            color: i > 7 ? 'bg-red-100 text-red-800' : i > 3 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800' 
        }))
    },
    {
        id: 'pain_exit',
        title: 'Paciente Saiu',
        type: 'single',
        options: [
            { id: 'pain', label: 'Com Dor', color: 'bg-red-100 text-red-700 border-red-200' },
            { id: 'no_pain', label: 'Sem Dor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
        ]
    }
];

interface ClickableRecordProps {
    onChange: (data: any) => void;
    initialData?: any;
}

const ClickableRecord: React.FC<ClickableRecordProps> = ({ onChange, initialData = {} }) => {
    const [selections, setSelections] = useState<Record<string, string | string[]>>(initialData);

    const handleSelect = (sectionId: string, type: 'single' | 'multiple', optionId: string) => {
        setSelections(prev => {
            let newVal;
            if (type === 'single') {
                newVal = prev[sectionId] === optionId ? undefined : optionId;
            } else {
                const current = (prev[sectionId] as string[]) || [];
                newVal = current.includes(optionId) 
                    ? current.filter(id => id !== optionId)
                    : [...current, optionId];
            }
            
            const updated = { ...prev, [sectionId]: newVal };
            onChange(updated);
            return updated;
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 mb-4">
                <strong>Modelo:</strong> Evolução Pilates Padrão
            </div>
            
            {PILATES_TEMPLATE.map(section => (
                <div key={section.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        {section.title}
                        {section.type === 'multiple' && <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Múltipla escolha</span>}
                    </h4>
                    
                    <div className="flex flex-wrap gap-3">
                        {section.options.map(option => {
                            const isSelected = section.type === 'single' 
                                ? selections[section.id] === option.id
                                : (selections[section.id] as string[])?.includes(option.id);

                            const baseClass = option.color || 'bg-slate-50 text-slate-600 border-slate-200';
                            
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(section.id, section.type, option.id)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2
                                        ${isSelected 
                                            ? 'ring-2 ring-offset-1 ring-primary border-transparent shadow-sm scale-105 ' + baseClass.replace('bg-', 'bg-opacity-100 ')
                                            : baseClass + ' hover:brightness-95 opacity-80 hover:opacity-100'}
                                    `}
                                >
                                    {isSelected && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ClickableRecord;
