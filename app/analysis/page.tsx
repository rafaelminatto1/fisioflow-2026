
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
// Use namespace import to avoid named export errors with some ESM CDNs
import * as mediapipePose from '@mediapipe/pose';
import * as cameraUtils from '@mediapipe/camera_utils';
import { GoogleGenAI } from "@google/genai";
import { api } from '../../services/api';
import { Patient } from '../../types';
import { 
  ScanEyeIcon, 
  UploadCloudIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  XIcon, 
  RulerIcon,
  AngleIcon,
  GridIcon,
  TrashIcon,
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  VideoIcon,
  CameraIcon as CameraIconSolid,
  UsersIcon,
  ActivityIcon,
  AlertCircleIcon
} from '../../components/Icons';

// Workaround to access Camera and Pose classes from the namespace objects
const Camera = (cameraUtils as any).Camera || (cameraUtils as any).default?.Camera;
const Pose = (mediapipePose as any).Pose || (mediapipePose as any).default?.Pose;

// Local interface for Results to avoid import errors
interface Results {
    poseLandmarks: { x: number; y: number; z: number; visibility?: number }[];
    poseWorldLandmarks?: { x: number; y: number; z: number; visibility?: number }[];
    image: any;
}

// --- Types & Interfaces ---
type Tool = 'none' | 'line' | 'angle' | 'cobb';
type ViewMode = 'realtime' | 'static';

interface Point {
    x: number;
    y: number;
}

interface Annotation {
    id: string;
    type: 'line' | 'angle' | 'cobb';
    points: Point[];
    color: string;
    value?: number;
}

// --- Math Helpers ---
const calculateAngle = (p1: Point, p2: Point, p3: Point) => {
    const angle = Math.abs(
        Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
        Math.atan2(p1.y - p2.y, p1.x - p2.x)
    ) * (180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
};

const drawLandmarks = (ctx: CanvasRenderingContext2D, results: Results) => {
    if (!results.poseLandmarks) return;

    // Draw Connectors
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0ea5e9'; // Primary Blue
    
    // Helper to draw lines based on POSE_CONNECTIONS (Simulated here)
    const connections = [
        [11, 13], [13, 15], // Right Arm
        [12, 14], [14, 16], // Left Arm
        [11, 12], [11, 23], [12, 24], [23, 24], // Torso
        [23, 25], [25, 27], // Right Leg
        [24, 26], [26, 28]  // Left Leg
    ];

    connections.forEach(([i, j]) => {
        const p1 = results.poseLandmarks[i];
        const p2 = results.poseLandmarks[j];
        if (p1 && p2 && (p1.visibility ?? 1) > 0.5 && (p2.visibility ?? 1) > 0.5) {
            ctx.beginPath();
            ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
            ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
            ctx.stroke();
        }
    });

    // Draw Landmarks
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#f43f5e'; // Rose for joints
    ctx.lineWidth = 2;
    
    results.poseLandmarks.forEach((landmark) => {
        if ((landmark.visibility ?? 1) > 0.5) {
            const x = landmark.x * ctx.canvas.width;
            const y = landmark.y * ctx.canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    });
};

export default function BiomechanicsPage() {
  // --- State: General ---
  const [activeTab, setActiveTab] = useState<ViewMode>('static');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // --- State: Static Analysis ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticContainerRef = useRef<HTMLDivElement>(null);
  
  // --- Initialization ---
  useEffect(() => {
      const loadPatients = async () => {
          const data = await api.patients.list();
          setPatients(data);
      };
      loadPatients();
  }, []);

  // --- Logic: Real-time Pose (MediaPipe) ---
  const onResults = useCallback((results: Results) => {
      if (!canvasRef.current || !webcamRef.current?.video || !results.poseLandmarks) return;

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
          ctx.save();
          ctx.clearRect(0, 0, videoWidth, videoHeight);
          
          // Draw Skeleton
          drawLandmarks(ctx, results);
          
          // Example Analysis: Knee Angle (Right)
          // 23 (Hip), 25 (Knee), 27 (Ankle)
          const p1 = results.poseLandmarks[23];
          const p2 = results.poseLandmarks[25];
          const p3 = results.poseLandmarks[27];

          if (p1 && p2 && p3 && (p1.visibility ?? 1) > 0.5 && (p2.visibility ?? 1) > 0.5 && (p3.visibility ?? 1) > 0.5) {
              const angle = calculateAngle(p1, p2, p3);
              
              // Draw Angle Text
              ctx.font = 'bold 24px Inter';
              ctx.fillStyle = angle < 90 ? '#ef4444' : '#10b981';
              ctx.fillText(`${Math.round(angle)}°`, p2.x * videoWidth + 10, p2.y * videoHeight);
          }

          ctx.restore();
      }
  }, []);

  useEffect(() => {
      let camera: any = null;
      let pose: any = null;

      if (activeTab === 'realtime' && webcamRef.current?.video && Pose) {
          pose = new Pose({locateFile: (file: string) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }});
          
          pose.setOptions({
              modelComplexity: 1,
              smoothLandmarks: true,
              enableSegmentation: false,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
          });
          
          pose.onResults(onResults);

          if (typeof webcamRef.current.video !== 'string' && Camera) {
             camera = new Camera(webcamRef.current.video, {
                 onFrame: async () => {
                     if(webcamRef.current?.video && pose) {
                         await pose.send({image: webcamRef.current.video});
                     }
                 },
                 width: 640,
                 height: 480
             });
             camera.start();
          }
      }
      return () => {
          if (camera) camera.stop();
          if (pose) pose.close();
      };
  }, [activeTab, onResults]);

  // --- Logic: Static Analysis ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewUrl(reader.result as string);
              setSelectedFile(file);
              setAnnotations([]);
              setZoomLevel(1);
              setPanOffset({x: 0, y: 0});
              setAiReport(null);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
      if (activeTool === 'none') return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const point = { x, y };

      if (activeTool === 'line') {
          const activeAnn = annotations.find(a => a.type === 'line' && a.points.length === 1);
          if (activeAnn) {
              setAnnotations(prev => prev.map(a => a.id === activeAnn.id ? { ...a, points: [...a.points, point] } : a));
          } else {
              setAnnotations(prev => [...prev, { id: Date.now().toString(), type: 'line', points: [point], color: '#10b981' }]);
          }
      } else if (activeTool === 'angle') {
          const activeAnn = annotations.find(a => a.type === 'angle' && a.points.length < 3);
          if (activeAnn) {
              setAnnotations(prev => prev.map(a => a.id === activeAnn.id ? { ...a, points: [...a.points, point] } : a));
          } else {
              setAnnotations(prev => [...prev, { id: Date.now().toString(), type: 'angle', points: [point], color: '#f59e0b' }]);
          }
      }
  };

  // --- Logic: AI Analysis ---
  const generateAiReport = async () => {
      if ((!previewUrl && activeTab === 'static') || (!webcamRef.current && activeTab === 'realtime')) return;
      if (!selectedPatientId) {
          alert("Selecione um paciente para salvar o laudo.");
          return;
      }

      setIsAnalyzing(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          let imageData = '';
          let mimeType = '';

          if (activeTab === 'static' && previewUrl) {
              imageData = previewUrl.split(',')[1];
              mimeType = selectedFile?.type || 'image/jpeg';
          } else if (activeTab === 'realtime' && webcamRef.current) {
              const screenshot = webcamRef.current.getScreenshot();
              if (screenshot) {
                  imageData = screenshot.split(',')[1];
                  mimeType = 'image/jpeg';
              }
          }

          if (!imageData) throw new Error("Imagem não encontrada");

          const prompt = `Atue como um Especialista em Biomecânica e Fisioterapia.
          Analise esta imagem clínica do paciente.
          
          Se for uma foto postural: Avalie alinhamento de ombros, pelve, joelhos e cabeça. Identifique compensações.
          Se for um exame (Raio-X/Ressonância): Descreva os achados visíveis e possíveis implicações funcionais.
          
          Estruture a resposta em Markdown:
          ## Análise Biomecânica
          * **Achados Principais**: ...
          * **Disfunções Observadas**: ...
          * **Sugestão de Conduta**: Exercícios ou correções sugeridas.
          
          AVISO LEGAL: Adicione sempre que esta é uma análise assistida por IA e não substitui diagnóstico clínico.`;

          const response = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: {
                  parts: [
                      { inlineData: { mimeType, data: imageData } },
                      { text: prompt }
                  ]
              }
          });

          setAiReport(response.text || "Sem análise gerada.");
      } catch (error) {
          console.error(error);
          alert("Erro na análise IA.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm z-10 shrink-0">
            <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ActivityIcon className="w-6 h-6 text-primary" />
                    NeuroPose <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">v1.0</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">Estação de Avaliação Biomecânica e Postural</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <UsersIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select 
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                    >
                        <option value="">Selecione o Paciente...</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex">
                    <button 
                        onClick={() => setActiveTab('static')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'static' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <UploadCloudIcon className="w-4 h-4" /> Arquivo
                    </button>
                    <button 
                        onClick={() => setActiveTab('realtime')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'realtime' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <VideoIcon className="w-4 h-4" /> Ao Vivo
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Main Canvas / Video Area */}
            <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {activeTab === 'realtime' ? (
                    <div className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center bg-black">
                        <Webcam
                            ref={webcamRef}
                            className="absolute inset-0 w-full h-full object-contain"
                            mirrored
                        />
                        <canvas 
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                        <div className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            AO VIVO
                        </div>
                    </div>
                ) : (
                    <div 
                        className="relative w-full h-full overflow-hidden cursor-crosshair"
                        ref={staticContainerRef}
                    >
                        {previewUrl ? (
                            <div 
                                className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
                                style={{ transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` }}
                            >
                                <img src={previewUrl} alt="Analysis" className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none" />
                                
                                <svg className="absolute inset-0 w-full h-full z-10" onClick={handleSvgClick}>
                                    {/* Annotations */}
                                    {annotations.map(ann => (
                                        <g key={ann.id}>
                                            {ann.points.map((p, i) => (
                                                <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="4" fill={ann.color} stroke="white" strokeWidth="2" />
                                            ))}
                                            {ann.type === 'line' && ann.points.length === 2 && (
                                                <line x1={`${ann.points[0].x}%`} y1={`${ann.points[0].y}%`} x2={`${ann.points[1].x}%`} y2={`${ann.points[1].y}%`} stroke={ann.color} strokeWidth="3" />
                                            )}
                                            {ann.type === 'angle' && ann.points.length === 3 && (
                                                <>
                                                    <line x1={`${ann.points[0].x}%`} y1={`${ann.points[0].y}%`} x2={`${ann.points[1].x}%`} y2={`${ann.points[1].y}%`} stroke={ann.color} strokeWidth="2" strokeDasharray="5,5" />
                                                    <line x1={`${ann.points[1].x}%`} y1={`${ann.points[1].y}%`} x2={`${ann.points[2].x}%`} y2={`${ann.points[2].y}%`} stroke={ann.color} strokeWidth="2" strokeDasharray="5,5" />
                                                    <text x={`${ann.points[1].x + 2}%`} y={`${ann.points[1].y - 2}%`} fill="white" fontSize="16" fontWeight="bold" style={{ textShadow: '0 2px 4px black' }}>
                                                        {calculateAngle(ann.points[0], ann.points[1], ann.points[2]).toFixed(1)}°
                                                    </text>
                                                </>
                                            )}
                                        </g>
                                    ))}
                                    {showGrid && (
                                        <rect width="100%" height="100%" fill="url(#grid)" pointerEvents="none" />
                                    )}
                                    <defs>
                                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                                        </pattern>
                                    </defs>
                                </svg>
                            </div>
                        ) : (
                            <div 
                                className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloudIcon className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Clique para carregar imagem</p>
                                <p className="text-sm opacity-70">JPG, PNG, DICOM (Simulado)</p>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                )}

                {/* Floating Tools (Static Mode) */}
                {activeTab === 'static' && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20 flex gap-2 z-20">
                        <button 
                            onClick={() => setActiveTool('none')} 
                            className={`p-2.5 rounded-xl transition-all ${activeTool === 'none' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                            title="Mover"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                        </button>
                        <div className="w-px bg-slate-200 mx-1"></div>
                        <button 
                            onClick={() => setActiveTool('line')} 
                            className={`p-2.5 rounded-xl transition-all ${activeTool === 'line' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                            title="Régua"
                        >
                            <RulerIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setActiveTool('angle')} 
                            className={`p-2.5 rounded-xl transition-all ${activeTool === 'angle' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                            title="Goniômetro"
                        >
                            <AngleIcon className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-slate-200 mx-1"></div>
                        <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl"><ZoomOutIcon className="w-5 h-5" /></button>
                        <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl"><ZoomInIcon className="w-5 h-5" /></button>
                        <button onClick={() => setShowGrid(!showGrid)} className={`p-2.5 rounded-xl transition-all ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}><GridIcon className="w-5 h-5" /></button>
                        <div className="w-px bg-slate-200 mx-1"></div>
                        <button onClick={() => setAnnotations([])} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                )}
            </div>

            {/* Right Sidebar: AI & Results */}
            <div className="w-96 bg-white border-l border-slate-200 flex flex-col z-20 shadow-xl">
                <div className="p-5 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                        Laudo Inteligente
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Análise assistida por IA Generativa.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {aiReport ? (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <div className="prose prose-sm prose-slate max-w-none text-slate-600">
                                <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>') }} />
                            </div>
                            
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800 flex items-start gap-2">
                                <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Este laudo é gerado por IA e serve apenas como auxílio. Valide clinicamente.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <SparklesIcon className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Aguardando Análise</p>
                                <p className="text-sm text-slate-500">Capture ou carregue uma imagem para processar.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                    <button 
                        onClick={generateAiReport}
                        disabled={isAnalyzing || (!previewUrl && !webcamRef.current)}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Analisando...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Gerar Laudo IA
                            </>
                        )}
                    </button>
                    
                    {aiReport && (
                        <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <DownloadIcon className="w-4 h-4" />
                            Salvar PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
