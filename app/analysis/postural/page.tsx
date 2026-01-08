
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
// Workaround for MediaPipe named exports issues with some bundlers/CDNs
import * as mpPose from '@mediapipe/pose';
import * as mpCamera from '@mediapipe/camera_utils';

// Robust import resolution for ESM/CJS interop
const Pose = (mpPose as any).Pose || (mpPose as any).default?.Pose || (window as any).Pose;
const Camera = (mpCamera as any).Camera || (mpCamera as any).default?.Camera;

import { 
    CameraIcon, 
    UploadCloudIcon, 
    CheckCircleIcon, 
    ChevronRightIcon, 
    UsersIcon, 
    ActivityIcon, 
    AlertCircleIcon,
    SparklesIcon,
    CheckIcon,
    TrashIcon,
    XIcon,
    VideoIcon,
    RefreshCwIcon,
    ClockIcon
} from '../../../components/Icons';
import LandmarkEditor from '../../../components/PosturalAnalysis/LandmarkEditor';
import PosturalReport from '../../../components/PosturalAnalysis/PosturalReport';
import { api } from '../../../services/api';
import { Patient, PoseLandmarks, PostureMetrics } from '../../../types';
import { analyzePosture } from '../../../services/biomechanics';

type Step = 'select_patient' | 'checklist' | 'upload' | 'analyze' | 'report';

interface MPResults {
    poseLandmarks: any[];
    poseWorldLandmarks: any[];
    image: any;
}

const mapMediaPipeToLandmarks = (mpLandmarks: any[]): PoseLandmarks => {
    if (!mpLandmarks) return {};
    return {
        nose: { x: mpLandmarks[0].x, y: mpLandmarks[0].y },
        leftEye: { x: mpLandmarks[2].x, y: mpLandmarks[2].y },
        rightEye: { x: mpLandmarks[5].x, y: mpLandmarks[5].y },
        leftEar: { x: mpLandmarks[7].x, y: mpLandmarks[7].y },
        rightEar: { x: mpLandmarks[8].x, y: mpLandmarks[8].y },
        leftShoulder: { x: mpLandmarks[11].x, y: mpLandmarks[11].y },
        rightShoulder: { x: mpLandmarks[12].x, y: mpLandmarks[12].y },
        leftElbow: { x: mpLandmarks[13].x, y: mpLandmarks[13].y },
        rightElbow: { x: mpLandmarks[14].x, y: mpLandmarks[14].y },
        leftWrist: { x: mpLandmarks[15].x, y: mpLandmarks[15].y },
        rightWrist: { x: mpLandmarks[16].x, y: mpLandmarks[16].y },
        leftHip: { x: mpLandmarks[23].x, y: mpLandmarks[23].y },
        rightHip: { x: mpLandmarks[24].x, y: mpLandmarks[24].y },
        leftKnee: { x: mpLandmarks[25].x, y: mpLandmarks[25].y },
        rightKnee: { x: mpLandmarks[26].x, y: mpLandmarks[26].y },
        leftAnkle: { x: mpLandmarks[27].x, y: mpLandmarks[27].y },
        rightAnkle: { x: mpLandmarks[28].x, y: mpLandmarks[28].y },
        leftHeel: { x: mpLandmarks[29].x, y: mpLandmarks[29].y },
        rightHeel: { x: mpLandmarks[30].x, y: mpLandmarks[30].y },
    };
};

export default function PosturalAnalysisPage() {
    const [step, setStep] = useState<Step>('select_patient');
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [patients, setPatients] = useState<Patient[]>([]);
    
    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [activeCaptureView, setActiveCaptureView] = useState<'front' | 'side' | 'back' | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const [countDown, setCountDown] = useState<number | null>(null);

    // Checklist State
    const [checklist, setChecklist] = useState({
        cameraLevel: false,
        fullBody: false,
        lighting: false,
        tightClothes: false
    });

    // Images
    const [previews, setPreviews] = useState({ front: '', side: '', back: '' });
    
    // Analysis
    const [landmarks, setLandmarks] = useState<{
        front?: PoseLandmarks;
        side?: PoseLandmarks;
        back?: PoseLandmarks;
    }>({});
    const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');
    const [isProcessing, setIsProcessing] = useState(false);
    const [metrics, setMetrics] = useState<PostureMetrics | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        api.patients.list().then(setPatients);
    }, []);

    // Camera Logic
    const handleOpenCamera = (view: 'front' | 'side' | 'back') => {
        setActiveCaptureView(view);
        setIsCameraOpen(true);
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc && activeCaptureView) {
            setPreviews(prev => ({ ...prev, [activeCaptureView]: imageSrc }));
            setIsCameraOpen(false);
            setActiveCaptureView(null);
        }
    }, [webcamRef, activeCaptureView]);

    const startTimerCapture = () => {
        setCountDown(3);
    };

    useEffect(() => {
        if (countDown === null) return;
        if (countDown === 0) {
            handleCapture();
            setCountDown(null);
            return;
        }
        const timer = setTimeout(() => setCountDown(countDown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countDown, handleCapture]);

    // MediaPipe Processing Logic
    const processImage = async (url: string): Promise<PoseLandmarks> => {
        return new Promise((resolve) => {
            if (!Pose) {
                console.error("MediaPipe Pose module not loaded correctly.");
                resolve({});
                return;
            }

            const pose = new Pose({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            });
            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            pose.onResults((results: MPResults) => {
                if (results.poseLandmarks) {
                    resolve(mapMediaPipeToLandmarks(results.poseLandmarks));
                } else {
                    resolve({});
                }
            });

            const img = new Image();
            img.src = url;
            img.crossOrigin = "Anonymous";
            img.onload = async () => {
                await pose.send({image: img});
            };
        });
    };

    const handleAnalyze = async () => {
        setIsProcessing(true);
        try {
            const newLandmarks: any = {};

            if (previews.front) newLandmarks.front = await processImage(previews.front);
            if (previews.side) newLandmarks.side = await processImage(previews.side);
            if (previews.back) newLandmarks.back = await processImage(previews.back);

            setLandmarks(newLandmarks);
            setMetrics(analyzePosture(newLandmarks));
            setStep('analyze');
        } catch (e) {
            console.error(e);
            alert("Erro ao processar imagem. Verifique o console.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (view: 'front' | 'side' | 'back', file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviews(prev => ({ ...prev, [view]: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleRecalculate = () => {
        setMetrics(analyzePosture(landmarks));
        setStep('report');
    };

    const handleSave = async () => {
        if (!selectedPatient || !metrics) return;
        setIsSaving(true);
        try {
            await api.postural.create({
                patientId: selectedPatient,
                images: previews,
                landmarks: landmarks,
                metrics: metrics,
                notes: 'Avaliação realizada automaticamente via FisioFlow.'
            });
            alert("Avaliação salva com sucesso!");
            handleReset();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar avaliação.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setStep('select_patient');
        setPreviews({front:'',side:'',back:''});
        setChecklist({cameraLevel: false, fullBody: false, lighting: false, tightClothes: false});
        setLandmarks({});
        setMetrics(null);
    };

    const isChecklistComplete = Object.values(checklist).every(Boolean);

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            {/* Header / Stepper */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ActivityIcon className="w-6 h-6 text-primary" />
                        Avaliação Postural Digital
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Biometria e Fotogrametria Automática</p>
                </div>
                <div className="flex items-center gap-1 text-sm bg-slate-100 p-1 rounded-lg">
                    {['select_patient', 'checklist', 'upload', 'analyze', 'report'].map((s, idx) => {
                        const labels = { select_patient: 'Paciente', checklist: 'Checklist', upload: 'Fotos', analyze: 'Análise', report: 'Relatório' };
                        const isActive = step === s;
                        const isDone = ['select_patient', 'checklist', 'upload', 'analyze', 'report'].indexOf(step) > idx;
                        return (
                            <div key={s} className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${isActive ? 'bg-white shadow-sm text-primary font-bold' : isDone ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                {isDone && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                                {labels[s as keyof typeof labels]}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                
                {/* STEP 1: PATIENT */}
                {step === 'select_patient' && (
                    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mt-10 animate-in zoom-in-95">
                        <UsersIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Iniciar Nova Avaliação</h2>
                        <p className="text-slate-500 mb-6 text-sm">Selecione o paciente para vincular as imagens.</p>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-xl mb-6 outline-none focus:border-primary bg-slate-50"
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button 
                            disabled={!selectedPatient}
                            onClick={() => setStep('checklist')}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50 hover:bg-sky-600 transition-colors shadow-lg shadow-primary/20"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* STEP 2: CHECKLIST */}
                {step === 'checklist' && (
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-6 animate-in slide-in-from-right-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckIcon className="w-5 h-5 text-emerald-500" />
                            Controle de Qualidade
                        </h2>
                        <div className="space-y-4 mb-8">
                            {[
                                { id: 'cameraLevel', label: 'Câmera nivelada (altura do tórax) e na vertical' },
                                { id: 'fullBody', label: 'Corpo inteiro visível (pés a cabeça)' },
                                { id: 'lighting', label: 'Boa iluminação e fundo neutro' },
                                { id: 'tightClothes', label: 'Roupas adequadas (shorts/top) para visualização' }
                            ].map((item) => (
                                <label key={item.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checklist[item.id as keyof typeof checklist] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                        {checklist[item.id as keyof typeof checklist] && <CheckIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={checklist[item.id as keyof typeof checklist]}
                                        onChange={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof checklist] }))}
                                    />
                                    <span className="text-slate-700 font-medium">{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <button 
                            disabled={!isChecklistComplete}
                            onClick={() => setStep('upload')}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-all"
                        >
                            Confirmar e Prosseguir
                        </button>
                    </div>
                )}

                {/* STEP 3: UPLOAD / CAPTURE */}
                {step === 'upload' && (
                    <div className="max-w-5xl mx-auto animate-in slide-in-from-right-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Captura de Imagens</h2>
                            <button onClick={() => setPreviews({ front: '', side: '', back: '' })} className="text-sm text-red-500 hover:underline">Limpar Tudo</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {(['front', 'side', 'back'] as const).map(view => (
                                <div key={view} className="relative group aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center shadow-sm">
                                    {previews[view] ? (
                                        <>
                                            <img src={previews[view]} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenCamera(view)}
                                                    className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 flex items-center gap-2"
                                                >
                                                    <CameraIcon className="w-4 h-4" /> Recapturar
                                                </button>
                                                <label className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                                                    <UploadCloudIcon className="w-4 h-4" /> Upload
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden"
                                                        onChange={(e) => e.target.files?.[0] && handleFileChange(view, e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                {view === 'front' ? <UsersIcon className="w-8 h-8 text-slate-300" /> : 
                                                 view === 'side' ? <UsersIcon className="w-8 h-8 text-slate-300 scale-x-50" /> : 
                                                 <UsersIcon className="w-8 h-8 text-slate-300 opacity-50" />}
                                            </div>
                                            <p className="font-bold text-slate-700 uppercase tracking-wide mb-1">
                                                {view === 'front' ? 'Frontal' : view === 'side' ? 'Lateral' : 'Dorsal'}
                                            </p>
                                            <p className="text-xs text-slate-400 mb-6">Foto de corpo inteiro</p>
                                            
                                            <div className="flex gap-2 w-full px-4">
                                                <button 
                                                    onClick={() => handleOpenCamera(view)}
                                                    className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-sky-600 flex items-center justify-center gap-1"
                                                >
                                                    <CameraIcon className="w-4 h-4" /> Foto
                                                </button>
                                                <label className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 flex items-center justify-center gap-1 cursor-pointer">
                                                    <UploadCloudIcon className="w-4 h-4" /> Arq
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden"
                                                        onChange={(e) => e.target.files?.[0] && handleFileChange(view, e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={handleAnalyze}
                                disabled={isProcessing || !previews.front}
                                className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl flex items-center gap-3 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:shadow-none"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processando IA...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Analisar Postura
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: ANALYZE & EDIT */}
                {step === 'analyze' && (
                    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] animate-in fade-in">
                        {/* Editor Canvas */}
                        <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg border border-slate-700">
                            <LandmarkEditor 
                                imageUrl={previews[activeView]}
                                initialLandmarks={landmarks[activeView]}
                                onChange={(newL) => setLandmarks(prev => ({ ...prev, [activeView]: newL }))}
                            />
                            
                            {/* View Switcher Overlay */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl flex gap-2 border border-white/10 shadow-2xl">
                                {(['front', 'side', 'back'] as const).map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => setActiveView(v)}
                                        disabled={!previews[v]}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeView === v ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-300 hover:bg-white/10 disabled:opacity-30'}`}
                                    >
                                        {v === 'front' ? 'Frente' : v === 'side' ? 'Perfil' : 'Costas'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Controls */}
                        <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-bold text-slate-900 text-lg">Ajuste Fino</h3>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                    A IA detectou os pontos anatômicos. Se necessário, <strong>arraste os pontos</strong> na imagem para corrigir a posição exata das articulações.
                                </p>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6">
                                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-2 mb-2">
                                    <AlertCircleIcon className="w-4 h-4" /> Dica
                                </h4>
                                <p className="text-xs text-amber-700">
                                    Certifique-se de que os pontos do quadril (Espinhas Ilíacas) e ombros (Acrômios) estão alinhados corretamente para o cálculo de desnível.
                                </p>
                            </div>
                            
                            <div className="mt-auto">
                                <button 
                                    onClick={handleRecalculate}
                                    className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Gerar Relatório
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: REPORT */}
                {step === 'report' && metrics && (
                    <PosturalReport 
                        metrics={metrics} 
                        onSave={handleSave} 
                        onReset={handleReset} 
                    />
                )}
            </div>

            {/* CAMERA MODAL */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in">
                    <div className="absolute top-4 right-4 z-50">
                        <button 
                            onClick={() => { setIsCameraOpen(false); setCountDown(null); }}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative">
                        <Webcam 
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="h-full w-full object-contain"
                            videoConstraints={{ facingMode: "environment" }}
                        />
                        
                        {/* Overlay Guidelines */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="border-2 border-white/30 w-64 h-[80%] rounded-2xl relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/20 border-l border-dashed"></div>
                                <div className="absolute top-1/6 w-full h-px bg-white/20 border-t border-dashed"></div>
                                <div className="absolute bottom-1/6 w-full h-px bg-white/20 border-t border-dashed"></div>
                            </div>
                        </div>

                        {countDown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
                                <span className="text-9xl font-black text-white animate-ping">{countDown}</span>
                            </div>
                        )}
                    </div>

                    <div className="h-32 bg-black flex items-center justify-center gap-8 pb-8">
                        <button 
                            onClick={startTimerCapture}
                            className="p-4 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all flex flex-col items-center gap-1"
                        >
                            <ClockIcon className="w-6 h-6" />
                            <span className="text-[10px] font-bold">3s</span>
                        </button>

                        <button 
                            onClick={() => handleCapture()}
                            className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-black"></div>
                        </button>

                        <div className="w-16"></div> {/* Spacer for balance */}
                    </div>
                </div>
            )}
        </div>
    );
}
