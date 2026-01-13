'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { XIcon, EditIcon, TrashIcon, PlusIcon, AlertCircleIcon } from './Icons';

export interface PainPoint {
    id: string;
    x: number;
    y: number;
    angle: number;
    intensity: number;
    type: string;
    muscleGroup?: string;
    notes?: string;
    agravantes?: string[];
    aliviantes?: string[];
}

const PAIN_TYPES = ['Pulsátil', 'Aguda', 'Em facada', 'Queimação', 'Cólica', 'Pressão', 'Fadiga', 'Latejante'];

const BODY_PATHS = {
    front: [
        { id: 'head', d: "M110,35 Q110,15 120,15 T130,35 Q130,50 120,50 T110,35", name: "Cabeça" },
        { id: 'neck', d: "M115,50 L125,50 L128,60 L112,60 Z", name: "Pescoço" },
        { id: 'chest', d: "M100,60 L140,60 L145,110 Q120,120 95,110 Z", name: "Tórax" },
        { id: 'abdomen', d: "M95,110 Q120,120 145,110 L142,150 L98,150 Z", name: "Abdômen" },
        { id: 'pelvis', d: "M98,150 L142,150 L135,175 L105,175 Z", name: "Pelve" },
        { id: 'shoulder_r', d: "M80,65 Q90,60 100,60 L95,85 L75,80 Z", name: "Ombro D" },
        { id: 'shoulder_l', d: "M140,60 Q150,60 160,65 L165,80 L145,85 Z", name: "Ombro E" },
        { id: 'arm_r', d: "M75,80 L95,85 L90,120 L70,115 Z", name: "Braço D" },
        { id: 'arm_l', d: "M145,85 L165,80 L170,115 L150,120 Z", name: "Braço E" },
        { id: 'forearm_r', d: "M70,115 L90,120 L85,150 L65,145 Z", name: "Antebraço Direito" },
        { id: 'forearm_l', d: "M150,120 L170,115 L175,145 L155,150 Z", name: "Antebraço Esquerdo" },
        { id: 'hand_r', d: "M65,145 L85,150 L80,165 L60,160 Z", name: "Mão D" },
        { id: 'hand_l', d: "M155,150 L175,145 L180,160 L160,165 Z", name: "Mão E" },
        { id: 'thigh_r', d: "M105,175 L120,175 L115,240 L95,235 Z", name: "Coxa D" },
        { id: 'thigh_l', d: "M120,175 L135,175 L145,235 L125,240 Z", name: "Coxa E" },
        { id: 'leg_r', d: "M95,235 L115,240 L110,290 L95,285 Z", name: "Perna D" },
        { id: 'leg_l', d: "M125,240 L145,235 L145,285 L130,290 Z", name: "Perna E" },
        { id: 'foot_r', d: "M95,285 L110,290 L105,305 L90,300 Z", name: "Pé D" },
        { id: 'foot_l', d: "M130,290 L145,285 L150,300 L135,305 Z", name: "Pé E" },
    ],
    back: [
        { id: 'head_b', d: "M110,35 Q110,15 120,15 T130,35 Q130,50 120,50 T110,35", name: "Nuca" },
        { id: 'neck_b', d: "M115,50 L125,50 L128,60 L112,60 Z", name: "Cervical" },
        { id: 'upper_back', d: "M100,60 L140,60 L135,100 L105,100 Z", name: "Dorsal Alta" },
        { id: 'lower_back', d: "M105,100 L135,100 L138,150 L102,150 Z", name: "Lombar" },
        { id: 'glutes', d: "M102,150 L138,150 L135,180 L105,180 Z", name: "Glúteos" },
        { id: 'shoulder_blade_r', d: "M125,65 L135,65 L132,90 L122,90 Z", name: "Escápula D" },
        { id: 'shoulder_blade_l', d: "M105,65 L115,65 L118,90 L108,90 Z", name: "Escápula E" },
        { id: 'arm_rb', d: "M140,60 Q150,60 160,65 L165,80 L145,85 Z", name: "Braço D (Post)" },
        { id: 'arm_lb', d: "M80,65 Q90,60 100,60 L95,85 L75,80 Z", name: "Braço E (Post)" },
        { id: 'thigh_rb', d: "M120,180 L135,180 L145,240 L125,245 Z", name: "Coxa D (Post)" },
        { id: 'thigh_lb', d: "M105,180 L120,180 L115,245 L95,240 Z", name: "Coxa E (Post)" },
        { id: 'calf_r', d: "M125,245 L145,240 L145,290 L130,295 Z", name: "Panturrilha D" },
        { id: 'calf_l', d: "M95,240 L115,245 L110,295 L95,290 Z", name: "Panturrilha E" },
    ]
};

interface InteractivePainMapProps {
    initialPoints?: PainPoint[];
    onChange?: (p: PainPoint[]) => void;
    readOnly?: boolean;
    rotation?: number;
    zoom?: number;
    onPointSelect?: (point: PainPoint | null) => void;
    selectedPointId?: string | null;
}

// Pain Point Editor Modal
interface PainPointEditorProps {
    point: PainPoint | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (point: PainPoint) => void;
    onDelete?: (pointId: string) => void;
}

const PainPointEditor: React.FC<PainPointEditorProps> = ({ point, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Partial<PainPoint>>({});
    const [newAgravante, setNewAgravante] = useState('');
    const [newAliviante, setNewAliviante] = useState('');

    useEffect(() => {
        if (point) {
            setFormData({ ...point });
        } else {
            setFormData({
                intensity: 5,
                type: 'Pulsátil',
                agravantes: [],
                aliviantes: []
            });
        }
    }, [point]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!point) return;
        onSave({
            ...point,
            intensity: formData.intensity || 5,
            type: formData.type || 'Pulsátil',
            notes: formData.notes,
            agravantes: formData.agravantes || [],
            aliviantes: formData.aliviantes || []
        });
        onClose();
    };

    const addAgravante = () => {
        if (newAgravante.trim()) {
            setFormData(prev => ({
                ...prev,
                agravantes: [...(prev.agravantes || []), newAgravante.trim()]
            }));
            setNewAgravante('');
        }
    };

    const removeAgravante = (index: number) => {
        setFormData(prev => ({
            ...prev,
            agravantes: prev.agravantes?.filter((_, i) => i !== index)
        }));
    };

    const addAliviante = () => {
        if (newAliviante.trim()) {
            setFormData(prev => ({
                ...prev,
                aliviantes: [...(prev.aliviantes || []), newAliviante.trim()]
            }));
            setNewAliviante('');
        }
    };

    const removeAliviante = (index: number) => {
        setFormData(prev => ({
            ...prev,
            aliviantes: prev.aliviantes?.filter((_, i) => i !== index)
        }));
    };

    const intensityColor = formData.intensity && formData.intensity > 7 ? 'text-red-600' : formData.intensity && formData.intensity > 3 ? 'text-amber-600' : 'text-sky-600';

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <AlertCircleIcon className={`w-5 h-5 ${intensityColor}`} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {point?.muscleGroup || 'Ponto de Dor'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Intensity */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Intensidade da Dor
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={formData.intensity || 5}
                                onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className={`text-2xl font-black ${intensityColor} w-10 text-center`}>
                                {formData.intensity}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Sem dor</span>
                            <span>Dor moderada</span>
                            <span>Dor extrema</span>
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Tipo de Dor
                        </label>
                        <select
                            value={formData.type || 'Pulsátil'}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {PAIN_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Agravantes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            O que piora (Agravantes)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newAgravante}
                                onChange={(e) => setNewAgravante(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAgravante())}
                                placeholder="Ex: Correr, Subir escadas..."
                                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                            <button
                                onClick={addAgravante}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {formData.agravantes?.map((ag, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs">
                                    {ag}
                                    <button onClick={() => removeAgravante(i)} className="hover:text-red-800">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Aliviantes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            O que melhora (Aliviantes)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newAliviante}
                                onChange={(e) => setNewAliviante(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAliviante())}
                                placeholder="Ex: Repouso, Gelo, Massagem..."
                                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                            <button
                                onClick={addAliviante}
                                className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {formData.aliviantes?.map((al, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs">
                                    {al}
                                    <button onClick={() => removeAliviante(i)} className="hover:text-emerald-800">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Observações
                        </label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Detalhes adicionais sobre a dor..."
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                    {onDelete && (
                        <button
                            onClick={() => { onDelete(point!.id); onClose(); }}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                            <TrashIcon className="w-4 h-4" /> Excluir
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-semibold text-sm transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InteractivePainMap: React.FC<InteractivePainMapProps> = ({
    initialPoints = [],
    onChange,
    readOnly,
    rotation = 0,
    zoom = 1,
    onPointSelect,
    selectedPointId
}) => {
    const [points, setPoints] = useState<PainPoint[]>(initialPoints);
    const [selectedPoint, setSelectedPoint] = useState<PainPoint | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => { setPoints(initialPoints); }, [initialPoints]);

    const isBackView = rotation > 90 && rotation < 270;
    const currentPaths = isBackView ? BODY_PATHS.back : BODY_PATHS.front;

    const handleBodyClick = (e: React.MouseEvent<SVGElement>, partName: string) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newPoint: PainPoint = {
            id: uuidv4(),
            x, y,
            angle: rotation,
            intensity: 5,
            type: 'Pulsátil',
            muscleGroup: partName,
            agravantes: [],
            aliviantes: []
        };

        const updated = [...points, newPoint];
        setPoints(updated);
        if (onChange) onChange(updated);
        setSelectedPoint(newPoint);
        setIsEditorOpen(true);
        if (onPointSelect) onPointSelect(newPoint);
    };

    const handlePointClick = (e: React.MouseEvent, point: PainPoint) => {
        e.stopPropagation();
        if (readOnly) return;
        setSelectedPoint(point);
        setIsEditorOpen(true);
        if (onPointSelect) onPointSelect(point);
    };

    const handlePointDrag = (e: React.MouseEvent, point: PainPoint) => {
        if (readOnly) return;
        // Simple drag implementation - could be enhanced with drag events
        const rect = (e.target as HTMLElement).closest('svg')?.getBoundingClientRect();
        if (!rect) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const updated = points.map(p =>
            p.id === point.id ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p
        );
        setPoints(updated);
        if (onChange) onChange(updated);
    };

    const handleSavePoint = (updatedPoint: PainPoint) => {
        const updated = points.map(p => p.id === updatedPoint.id ? updatedPoint : p);
        setPoints(updated);
        if (onChange) onChange(updated);
        if (onPointSelect) onPointSelect(updatedPoint);
    };

    const handleDeletePoint = (pointId: string) => {
        const updated = points.filter(p => p.id !== pointId);
        setPoints(updated);
        if (onChange) onChange(updated);
        if (onPointSelect) onPointSelect(null);
    };

    const isPointVisible = (pointAngle: number) => {
        const diff = Math.abs(pointAngle - rotation);
        const normalizedDiff = Math.min(diff, 360 - diff);
        return normalizedDiff < 85;
    };

    // Calculate stats
    const avgIntensity = points.length > 0
        ? Math.round(points.reduce((sum, p) => sum + p.intensity, 0) / points.length * 10) / 10
        : 0;
    const maxIntensity = points.length > 0 ? Math.max(...points.map(p => p.intensity)) : 0;

    return (
        <div className="w-full h-full flex items-center justify-center relative">
            <div
                className="relative h-full w-auto aspect-[3/4] transition-transform duration-300 ease-out will-change-transform"
                style={{ transform: `scale(${zoom}) rotateY(${rotation}deg)`, transformStyle: 'preserve-3d' }}
            >
                {/* Holographic Base Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-sky-500/30 rounded-[100%] blur-2xl transform rotateX(70deg)"></div>

                <svg viewBox="0 0 240 320" className="h-full w-full filter drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                    <defs>
                        <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
                            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
                        </linearGradient>
                        <filter id="neonGlow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Body - Neon Skeleton Style */}
                    <g
                        transform={isBackView ? "scale(-1, 1) translate(-240, 0)" : ""}
                        fill="url(#skeletonGradient)"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        className="hover:stroke-cyan-200 transition-all duration-300"
                        filter="url(#neonGlow)"
                    >
                        {currentPaths.map(path => (
                            <path
                                key={path.id}
                                d={path.d}
                                className="cursor-pointer hover:fill-sky-500/20 transition-all duration-300 hover:stroke-[2]"
                                onClick={(e) => handleBodyClick(e, path.name)}
                            />
                        ))}
                    </g>

                    {/* Internal "Bones" decoration (Abstract) */}
                    <path d="M120,60 L120,150 M120,150 L105,175 M120,150 L135,175" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.5" fill="none" transform={isBackView ? "scale(-1, 1) translate(-240, 0)" : ""} />

                    {/* Render Points */}
                    {points.map(p => {
                        if (!isPointVisible(p.angle)) return null;
                        const isSelected = selectedPointId === p.id;

                        const color = p.intensity > 7 ? '#ef4444' : p.intensity > 3 ? '#f59e0b' : '#38bdf8';

                        return (
                            <g
                                key={p.id}
                                onClick={(e) => handlePointClick(e, p)}
                                className="cursor-pointer"
                                onMouseMove={(e) => { if (e.buttons === 1) handlePointDrag(e, p); }}
                            >
                                {/* Outer Glow Ring */}
                                <circle
                                    cx={p.x + '%'} cy={p.y + '%'} r={isSelected ? 10 : 0}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="0.5"
                                    strokeDasharray="2 2"
                                    className="animate-[spin_4s_linear_infinite]"
                                />
                                {/* Core Glow */}
                                <circle
                                    cx={p.x + '%'} cy={p.y + '%'} r={isSelected ? 6 : 4}
                                    fill={color}
                                    filter="url(#neonGlow)"
                                    opacity="0.8"
                                    className={isSelected ? "animate-pulse" : ""}
                                />
                                {/* Inner Core */}
                                <circle cx={p.x + '%'} cy={p.y + '%'} r={2} fill="#fff" />
                                {/* Intensity Label */}
                                {isSelected && (
                                    <text
                                        x={p.x + '%'}
                                        y={(p.y - 8) + '%'}
                                        textAnchor="middle"
                                        className="text-[8px] fill-white font-bold"
                                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                    >
                                        {p.intensity}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Stats Panel */}
                {points.length > 0 && (
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl shadow-lg text-xs border border-white/20 backdrop-blur-md">
                        <p className="font-bold mb-2 text-slate-700 dark:text-slate-300">Resumo de Dor</p>
                        <div className="space-y-1">
                            <p><span className="text-slate-500">Pontos:</span> <span className="font-bold">{points.length}</span></p>
                            <p><span className="text-slate-500">Média:</span> <span className={`font-bold ${maxIntensity > 7 ? 'text-red-600' : maxIntensity > 3 ? 'text-amber-600' : 'text-sky-600'}`}>{avgIntensity}</span></p>
                            <p><span className="text-slate-500">Máxima:</span> <span className={`font-bold ${maxIntensity > 7 ? 'text-red-600' : maxIntensity > 3 ? 'text-amber-600' : 'text-sky-600'}`}>{maxIntensity}</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pain Point Editor Modal */}
            <PainPointEditor
                point={selectedPoint}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSavePoint}
                onDelete={handleDeletePoint}
            />
        </div>
    );
};

export default InteractivePainMap;
