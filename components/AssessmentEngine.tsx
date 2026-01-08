
'use client';

import React, { useState, useEffect } from 'react';
import { 
    XIcon, 
    ChevronRightIcon, 
    ChevronLeftIcon, 
    CheckCircleIcon,
    SparklesIcon
} from './Icons';
import { AssessmentTemplate, AssessmentField } from '../types';
import InteractivePainMap, { PainPoint } from './InteractivePainMap';

interface AssessmentEngineProps {
    template: AssessmentTemplate;
    patientName: string;
    onClose: () => void;
    onComplete: (answers: Record<string, any>) => void;
}

const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ template, patientName, onClose, onComplete }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    
    const currentStep = template.steps[currentStepIndex];
    const totalSteps = template.steps.length;

    // Scroll to top on step change
    useEffect(() => {
        const container = document.getElementById('assessment-scroll-container');
        if(container) container.scrollTo(0,0);
    }, [currentStepIndex]);

    const handleNext = () => {
        if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onComplete(answers);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const updateAnswer = (fieldId: string, val: any) => {
        setAnswers(prev => ({ ...prev, [fieldId]: val }));
    };

    // Componente Visual para Amplitude de Movimento (Goniometria)
    const renderVisualRangeOfMotion = (field: AssessmentField) => {
        const val = (answers[field.id] as number) || field.min || 0;
        const max = field.max || 180;
        const min = field.min || 0;
        
        // Lógica de cor baseada no progresso (Ex: Flexão quanto mais, melhor)
        let colorClass = 'bg-slate-300';
        if (field.label.includes('Flexão')) {
             if (val > 110) colorClass = 'bg-emerald-500';
             else if (val > 90) colorClass = 'bg-amber-500';
             else colorClass = 'bg-red-500';
        } else if (field.label.includes('Extensão')) {
             // Para extensão, perto de 0 é o ideal
             if (Math.abs(val) <= 5) colorClass = 'bg-emerald-500';
             else if (Math.abs(val) <= 10) colorClass = 'bg-amber-500';
             else colorClass = 'bg-red-500';
        }

        const percentage = Math.min(Math.max((val - min) / (max - min), 0), 1) * 100;

        return (
            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end">
                    <span className={`text-4xl font-extrabold ${colorClass.replace('bg-', 'text-')}`}>{val}°</span>
                    <span className="text-xs text-slate-400 uppercase font-bold mb-1">Alcance Máx: {max}°</span>
                </div>
                
                {/* Visual Slider Container */}
                <div className="relative h-14 w-full bg-slate-100 rounded-2xl overflow-hidden flex items-center px-1 shadow-inner border border-slate-200">
                    {/* Tick marks */}
                    <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
                        {[0, 0.25, 0.5, 0.75, 1].map(p => (
                            <div key={p} className="h-full w-px bg-slate-300/50 z-0 relative">
                                <span className="absolute bottom-1 left-1 text-[9px] text-slate-400">{Math.round(min + (max - min) * p)}°</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Colored Bar */}
                    <div className="absolute top-0 left-0 bottom-0 transition-all duration-100 ease-out flex items-center justify-end"
                         style={{ width: `${percentage}%` }}>
                         <div className={`absolute inset-0 opacity-20 ${colorClass}`}></div>
                    </div>

                    {/* Interactive Slider Input on top */}
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        value={val}
                        onChange={(e) => updateAnswer(field.id, parseInt(e.target.value))}
                        className="w-full absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    
                    {/* Visual Thumb */}
                    <div 
                        className={`w-10 h-10 rounded-xl border-4 border-white shadow-lg z-10 transition-all pointer-events-none absolute top-2 flex items-center justify-center ${colorClass}`}
                        style={{ left: `calc(${percentage}% - 20px)` }}
                    >
                        <div className="w-1.5 h-4 bg-white/30 rounded-full"></div>
                    </div>
                </div>
                
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mt-1">
                    <span>Restrito</span>
                    <span className="text-slate-300">|</span>
                    <span>Funcional</span>
                    <span className="text-slate-300">|</span>
                    <span>Normal</span>
                </div>
            </div>
        );
    };

    const renderInput = (field: AssessmentField) => {
        switch(field.type) {
            case 'text':
                return (
                    <input 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
                        placeholder={field.placeholder || "Digite a resposta..."}
                        value={answers[field.id] || ''}
                        onChange={e => updateAnswer(field.id, e.target.value)}
                    />
                );
            case 'textarea':
                return (
                    <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32 text-slate-800"
                        placeholder={field.placeholder || "Descreva os detalhes..."}
                        value={answers[field.id] || ''}
                        onChange={e => updateAnswer(field.id, e.target.value)}
                    />
                );
            case 'number':
                return (
                    <div className="relative">
                        <input 
                            type="number"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xl font-bold text-slate-900"
                            value={answers[field.id] || ''}
                            onChange={e => updateAnswer(field.id, e.target.value)}
                            placeholder="0"
                        />
                        {field.suffix && (
                            <span className="absolute right-4 top-4 text-slate-400 font-medium">{field.suffix}</span>
                        )}
                    </div>
                );
            case 'range_motion':
                return renderVisualRangeOfMotion(field);
            case 'scale_10':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between px-2 text-sm font-bold text-slate-400">
                            <span>0 (Sem Dor)</span>
                            <span>10 (Dor Máxima)</span>
                        </div>
                        <div className="grid grid-cols-11 gap-1">
                            {Array.from({length: 11}).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => updateAnswer(field.id, i)}
                                    className={`
                                        h-12 rounded-lg font-bold text-lg transition-all border-2 flex items-center justify-center
                                        ${answers[field.id] === i 
                                            ? (i > 7 ? 'bg-red-500 border-red-500 text-white' : i > 3 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') + ' scale-110 shadow-lg z-10' 
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}
                                    `}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'select':
                return (
                    <div className="grid grid-cols-1 gap-3">
                        {field.options?.map(opt => (
                            <button
                                key={opt}
                                onClick={() => updateAnswer(field.id, opt)}
                                className={`p-4 text-left rounded-xl border-2 transition-all font-semibold flex items-center justify-between group ${
                                    answers[field.id] === opt 
                                    ? 'border-primary bg-blue-50 text-primary shadow-sm' 
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <span>{opt}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    answers[field.id] === opt ? 'border-primary bg-primary text-white' : 'border-slate-300 group-hover:border-slate-400'
                                }`}>
                                    {answers[field.id] === opt && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                </div>
                            </button>
                        ))}
                    </div>
                );
            case 'body_map':
                return (
                    <div className="h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                        <InteractivePainMap 
                            initialPoints={answers[field.id] || []}
                            onChange={(points) => updateAnswer(field.id, points)}
                        />
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Nav Header */}
            <div className="h-16 border-b border-slate-100 px-4 sm:px-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg text-white shadow-lg shadow-slate-200">
                        <SparklesIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{template.title}</h2>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Paciente: {patientName}</p>
                    </div>
                </div>
                <button 
                    onClick={() => confirm("Sair da avaliação agora? Os dados não salvos serão perdidos.") && onClose()} 
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Stepper (Visual Progress) */}
            <div className="bg-white border-b border-slate-100 py-4 px-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-center min-w-max mx-auto gap-2">
                    {template.steps.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const isCompleted = idx < currentStepIndex;
                        
                        return (
                            <React.Fragment key={step.id}>
                                <button 
                                    onClick={() => isCompleted ? setCurrentStepIndex(idx) : null}
                                    className={`
                                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2
                                        ${isActive 
                                            ? 'bg-slate-900 text-white border-slate-900 scale-110 shadow-lg' 
                                            : isCompleted 
                                                ? 'bg-emerald-500 text-white border-emerald-500 cursor-pointer hover:bg-emerald-600' 
                                                : 'bg-white text-slate-300 border-slate-200'}
                                    `}
                                >
                                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : idx + 1}
                                </button>
                                {idx < totalSteps - 1 && (
                                    <div className={`h-1 w-4 sm:w-8 rounded-full ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className="text-center mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest animate-in fade-in">
                    {currentStep.title}
                </div>
            </div>

            {/* Question Area */}
            <div id="assessment-scroll-container" className="flex-1 overflow-y-auto bg-slate-50/50">
                <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
                    
                    <div className="space-y-8 pb-20">
                        {currentStep.fields.map((field) => (
                            <div key={field.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-start mb-4">
                                    <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded-full">*</span>}
                                    </label>
                                    {field.helperText && (
                                        <div className="group relative">
                                            <span className="text-slate-400 cursor-help text-xs border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-serif">i</span>
                                            <div className="absolute right-0 top-6 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {field.helperText}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {renderInput(field)}
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-20 sm:h-24 border-t border-slate-200 px-6 flex justify-between items-center bg-white sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 disabled:opacity-30 transition-all text-sm sm:text-base disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-5 h-5" /> Anterior
                </button>

                <button 
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-extrabold text-sm sm:text-lg transition-all shadow-lg transform active:scale-95 ${currentStepIndex === totalSteps - 1 ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 text-white' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 text-white'}`}
                >
                    {currentStepIndex === totalSteps - 1 ? (
                        <> Finalizar <CheckCircleIcon className="w-6 h-6" /> </>
                    ) : (
                        <> Próximo <ChevronRightIcon className="w-6 h-6" /> </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AssessmentEngine;
