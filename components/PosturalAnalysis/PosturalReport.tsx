
'use client';

import React from 'react';
import { 
    CheckCircleIcon, 
    UsersIcon, 
    ActivityIcon,
    AlertCircleIcon
} from '../Icons';
import { PostureMetrics } from '../../types';

interface PosturalReportProps {
    metrics: PostureMetrics;
    notes?: string;
    onSave: () => void;
    onReset: () => void;
}

const MetricItem = ({ label, value, unit, ideal, tolerance }: any) => {
    if (value === undefined || isNaN(value)) return null;
    const val = parseFloat(value);
    const diff = Math.abs(val - ideal);
    const status = diff <= tolerance ? 'normal' : diff <= tolerance * 2 ? 'moderate' : 'severe';
    
    const colors = {
        normal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        moderate: 'bg-amber-100 text-amber-800 border-amber-200',
        severe: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <span className={`px-2.5 py-1 rounded text-xs font-bold border ${colors[status]}`}>
                {value}{unit}
            </span>
        </div>
    );
};

const PosturalReport: React.FC<PosturalReportProps> = ({ metrics, notes, onSave, onReset }) => {
    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 pb-20">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Análise Concluída!</h2>
                <p className="text-slate-500 max-w-lg mx-auto mt-2">
                    Os cálculos biomecânicos foram processados com base nos marcadores posicionados.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Frontal Metrics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
                        <UsersIcon className="w-5 h-5 text-blue-500" /> Vista Frontal
                    </h3>
                    <div className="space-y-5">
                        <MetricItem label="Alinhamento Cabeça" value={metrics.headTiltDeg?.toFixed(1)} unit="°" ideal={0} tolerance={2} />
                        <MetricItem label="Nível Ombros (Diff)" value={(metrics.shoulderHeightDiff || 0 * 100).toFixed(2)} unit="%" ideal={0} tolerance={0.02} />
                        <MetricItem label="Nível Pélvico" value={metrics.pelvicTiltDeg?.toFixed(1)} unit="°" ideal={0} tolerance={1.5} />
                        <MetricItem label="Inclinação Tronco" value={metrics.trunkLeanDeg?.toFixed(1)} unit="°" ideal={0} tolerance={2} />
                        
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Ângulo Q Estimado (Valgo)</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-2 rounded text-center">
                                    <span className="text-xs text-slate-500 block mb-1">Esq</span>
                                    <span className="font-bold text-slate-800">{metrics.kneeValgus?.left.toFixed(1)}°</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded text-center">
                                    <span className="text-xs text-slate-500 block mb-1">Dir</span>
                                    <span className="font-bold text-slate-800">{metrics.kneeValgus?.right.toFixed(1)}°</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Metrics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
                        <UsersIcon className="w-5 h-5 text-purple-500" /> Vista Lateral
                    </h3>
                    <div className="space-y-5">
                        <MetricItem label="Anteriorização Cabeça" value={metrics.forwardHead?.toFixed(1)} unit="%" ideal={0} tolerance={5} />
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-800 leading-relaxed">
                                <strong>Nota Clínica:</strong> Valores de perfil são baseados em projeção 2D. Para cifose e lordose precisas, recomenda-se avaliação radiográfica ou inclinômetro manual.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Metrics / Summary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
                        <ActivityIcon className="w-5 h-5 text-orange-500" /> Conclusão
                    </h3>
                    <div className="flex-1 space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-sm text-slate-600">
                                <strong>Disfunção Principal:</strong> {
                                    (metrics.pelvicTiltDeg || 0) > 3 ? "Desnível Pélvico Significativo" :
                                    (metrics.headTiltDeg || 0) > 3 ? "Inclinação Cervical" :
                                    "Alinhamento Global Preservado"
                                }
                            </p>
                        </div>
                        <textarea 
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm h-32 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            placeholder="Adicionar observações clínicas manuais..."
                            defaultValue={notes}
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <button 
                    onClick={onReset}
                    className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Nova Avaliação
                </button>
                <button 
                    onClick={onSave}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
                >
                    Salvar no Prontuário
                </button>
            </div>
        </div>
    );
};

export default PosturalReport;
