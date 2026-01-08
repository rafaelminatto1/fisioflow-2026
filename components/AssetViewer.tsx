
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Asset, Annotation, AnnotationType, AnnotationVersion, AnnotationPoint } from '../types';
import { 
    ZoomInIcon, 
    ZoomOutIcon, 
    RefreshCwIcon, 
    RulerIcon, 
    AngleIcon, 
    PencilIcon, 
    TrashIcon, 
    DownloadIcon, 
    CheckCircleIcon,
    XIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HistoryIcon,
    FileTextIcon,
    SunIcon
} from './Icons';
import { api } from '../services/api';

// Icons for Specific Shapes
const CircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/></svg>
);
const ArrowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const TypeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
);

interface AssetViewerProps {
    asset: Asset;
    onClose: () => void;
}

const AssetViewer: React.FC<AssetViewerProps> = ({ asset, onClose }) => {
    // --- State: Viewport ---
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    
    // --- State: Interaction ---
    const [activeTool, setActiveTool] = useState<AnnotationType | 'none' | 'pan'>('pan');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<AnnotationPoint[]>([]);
    
    // --- State: Annotations & Data ---
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [versions, setVersions] = useState<AnnotationVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null); // ID
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- State: PDF Specific ---
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    // In a real app, use PDF.js to render pages. Here we mock pages.
    
    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Load Asset ---
    useEffect(() => {
        if (asset.type === 'image') {
            const img = new Image();
            img.src = asset.url;
            img.crossOrigin = "anonymous";
            img.onload = () => {
                imageRef.current = img;
                fitToScreen();
                draw();
            };
        } else if (asset.type === 'pdf') {
            // Mock PDF loading: pretend we rendered page 1
            // In prod: pdfjs.getDocument(url).promise.then(...)
            setNumPages(asset.metadata?.totalPages || 5);
            // Simulate page rendering by using a placeholder or thumbnail if available
            const img = new Image();
            img.src = asset.thumbnailUrl || 'https://via.placeholder.com/800x1100.png?text=PDF+Page+1'; // Fallback
            img.onload = () => {
                imageRef.current = img;
                fitToScreen();
                draw();
            };
        }
        
        loadVersions();
    }, [asset]);

    const loadVersions = async () => {
        const history = await api.annotations.list(asset.id);
        setVersions(history);
    };

    // --- Canvas Helpers ---
    const fitToScreen = () => {
        if (!containerRef.current || !imageRef.current) return;
        const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
        const { width: iw, height: ih } = imageRef.current;
        const scaleW = cw / iw;
        const scaleH = ch / ih;
        const newScale = Math.min(scaleW, scaleH) * 0.9;
        
        setScale(newScale);
        setOffset({ 
            x: (cw - iw * newScale) / 2, 
            y: (ch - ih * newScale) / 2 
        });
    };

    const getMousePos = (e: React.MouseEvent | MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    // --- Main Drawing Loop ---
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx || !img) return;

        // 1. Setup Canvas Size
        // We set canvas size to match the container for crisp rendering
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        }

        // 2. Clear & Transforms
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Pan & Zoom
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        // Rotation (around image center)
        ctx.translate(img.width / 2, img.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-img.width / 2, -img.height / 2);

        // 3. Draw Image with Filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        // 4. Draw Annotations
        // Annotations are stored normalized (0-1). We scale them up to image size.
        const drawAnnotation = (ann: Annotation, isDraft = false) => {
            const w = img.width;
            const h = img.height;
            const pts = ann.points.map(p => ({ x: p.x * w, y: p.y * h }));

            ctx.beginPath();
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = ann.strokeWidth / scale; // Scale stroke to keep visibility
            ctx.fillStyle = ann.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (ann.type === 'ruler' && pts.length >= 2) {
                ctx.moveTo(pts[0].x, pts[0].y);
                ctx.lineTo(pts[1].x, pts[1].y);
                ctx.stroke();
                // Draw Ticks
                [pts[0], pts[1]].forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4 / scale, 0, Math.PI * 2);
                    ctx.fill();
                });
                // Draw Label
                const dist = Math.sqrt(Math.pow(pts[1].x - pts[0].x, 2) + Math.pow(pts[1].y - pts[0].y, 2));
                const midX = (pts[0].x + pts[1].x) / 2;
                const midY = (pts[0].y + pts[1].y) / 2;
                ctx.font = `${14 / scale}px sans-serif`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3 / scale;
                const text = ann.metadata?.measuredValue || `${Math.round(dist)}px`;
                ctx.strokeText(text, midX, midY - 10 / scale);
                ctx.fillText(text, midX, midY - 10 / scale);

            } else if (ann.type === 'angle' && pts.length >= 3) {
                ctx.moveTo(pts[0].x, pts[0].y);
                ctx.lineTo(pts[1].x, pts[1].y);
                ctx.lineTo(pts[2].x, pts[2].y);
                ctx.stroke();
                // Label
                const angle = Math.abs(
                    Math.atan2(pts[2].y - pts[1].y, pts[2].x - pts[1].x) - 
                    Math.atan2(pts[0].y - pts[1].y, pts[0].x - pts[1].x)
                ) * (180 / Math.PI);
                const displayAngle = angle > 180 ? 360 - angle : angle;
                
                ctx.font = `${14 / scale}px sans-serif`;
                ctx.fillStyle = 'white';
                ctx.strokeText(`${displayAngle.toFixed(1)}°`, pts[1].x + 10, pts[1].y);
                ctx.fillText(`${displayAngle.toFixed(1)}°`, pts[1].x + 10, pts[1].y);

            } else if (ann.type === 'arrow' && pts.length >= 2) {
                const headlen = 15 / scale;
                const dx = pts[1].x - pts[0].x;
                const dy = pts[1].y - pts[0].y;
                const angle = Math.atan2(dy, dx);
                
                ctx.moveTo(pts[0].x, pts[0].y);
                ctx.lineTo(pts[1].x, pts[1].y);
                ctx.lineTo(pts[1].x - headlen * Math.cos(angle - Math.PI / 6), pts[1].y - headlen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(pts[1].x, pts[1].y);
                ctx.lineTo(pts[1].x - headlen * Math.cos(angle + Math.PI / 6), pts[1].y - headlen * Math.sin(angle + Math.PI / 6));
                ctx.stroke();

            } else if (ann.type === 'circle' && pts.length >= 2) {
                const r = Math.sqrt(Math.pow(pts[1].x - pts[0].x, 2) + Math.pow(pts[1].y - pts[0].y, 2));
                ctx.beginPath();
                ctx.arc(pts[0].x, pts[0].y, r, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (ann.type === 'text' && pts.length >= 1) {
                ctx.font = `${20 / scale}px sans-serif`;
                ctx.fillStyle = ann.color;
                ctx.fillText(ann.text || 'Texto', pts[0].x, pts[0].y);
            }
        };

        annotations.forEach(a => drawAnnotation(a));
        
        // Draw Current Interaction
        if (isDrawing && currentPoints.length > 0 && activeTool !== 'pan') {
            // Create a temp annotation for visualization
            const tempAnn: Annotation = {
                id: 'temp',
                type: activeTool,
                points: currentPoints,
                color: '#f43f5e', // Highlight color while drawing
                strokeWidth: 3
            };
            drawAnnotation(tempAnn, true);
        }

        ctx.restore();

    }, [scale, offset, rotation, brightness, contrast, annotations, isDrawing, currentPoints, activeTool]);

    useEffect(() => {
        requestAnimationFrame(draw);
    }, [draw]);

    // --- Interaction Handlers ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            setIsDrawing(true);
            return;
        }
        
        const pos = getMousePos(e);
        // Inverse transform to get image local coordinates
        // Simplified inverse for Pan/Zoom (Rotation makes this math harder, usually need a Matrix lib)
        // For MVP, assuming no rotation for drawing or basic 0/90/180/270
        // Correct normalization:
        const img = imageRef.current;
        if (!img) return;

        // Apply inverse transform manually
        // 1. Translate back offset
        let lx = pos.x - offset.x;
        let ly = pos.y - offset.y;
        // 2. Scale back
        lx /= scale;
        ly /= scale;
        // 3. Rotate back (around center)
        // Ignoring rotation for MVP drawing simplicity or locking drawing when rotated
        
        // Normalize 0-1
        const nx = lx / img.width;
        const ny = ly / img.height;

        setIsDrawing(true);
        
        if (activeTool === 'text') {
            const text = prompt("Digite o texto:");
            if (text) {
                const newAnn: Annotation = {
                    id: Date.now().toString(),
                    type: 'text',
                    points: [{x: nx, y: ny}],
                    text,
                    color: '#ef4444',
                    strokeWidth: 2
                };
                setAnnotations(prev => [...prev, newAnn]);
            }
            setIsDrawing(false);
            return;
        }

        setCurrentPoints([{x: nx, y: ny}]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;

        if (activeTool === 'pan') {
            setOffset(prev => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY
            }));
            return;
        }

        const pos = getMousePos(e);
        const img = imageRef.current;
        if (!img) return;

        let lx = (pos.x - offset.x) / scale;
        let ly = (pos.y - offset.y) / scale;
        const nx = lx / img.width;
        const ny = ly / img.height;

        if (activeTool === 'ruler' || activeTool === 'arrow' || activeTool === 'circle') {
            setCurrentPoints(prev => [prev[0], {x: nx, y: ny}]);
        } else if (activeTool === 'angle') {
            // For angle we need 3 clicks, but preview shows line to 2nd/3rd point
            if (currentPoints.length === 1) setCurrentPoints(prev => [prev[0], {x: nx, y: ny}]);
            if (currentPoints.length === 2) setCurrentPoints(prev => [prev[0], prev[1], {x: nx, y: ny}]);
        }
    };

    const handleMouseUp = () => {
        if (activeTool === 'pan') {
            setIsDrawing(false);
            return;
        }

        if (activeTool === 'ruler' || activeTool === 'arrow' || activeTool === 'circle') {
            if (currentPoints.length === 2) {
                const newAnn: Annotation = {
                    id: Date.now().toString(),
                    type: activeTool,
                    points: currentPoints,
                    color: '#ef4444',
                    strokeWidth: 3
                };
                setAnnotations(prev => [...prev, newAnn]);
                setCurrentPoints([]);
                setIsDrawing(false);
            }
        } else if (activeTool === 'angle') {
            if (currentPoints.length === 3) {
                const newAnn: Annotation = {
                    id: Date.now().toString(),
                    type: 'angle',
                    points: currentPoints,
                    color: '#f59e0b',
                    strokeWidth: 3
                };
                setAnnotations(prev => [...prev, newAnn]);
                setCurrentPoints([]);
                setIsDrawing(false);
            } else if (currentPoints.length < 3) {
                // Keep drawing for next point
                return; 
            }
        }
    };

    // --- Action Handlers ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Generate Thumbnail (Snapshot of current canvas)
            const canvas = canvasRef.current;
            const thumbnail = canvas ? canvas.toDataURL('image/jpeg', 0.5) : undefined;

            await api.annotations.create({
                assetId: asset.id,
                annotations: annotations,
                thumbnailUrl: thumbnail
            });
            await loadVersions();
            alert('Anotações salvas em nova versão!');
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadVersion = (v: AnnotationVersion) => {
        setAnnotations(v.data as Annotation[]);
        setSelectedVersion(v.id);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col text-white">
            {/* Toolbar */}
            <div className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><XIcon className="w-6 h-6" /></button>
                    <div>
                        <h2 className="font-bold text-sm">{asset.filename}</h2>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            {asset.type.toUpperCase()} • V{versions.length}
                            {isSaving && <span className="text-amber-400 flex gap-1"><RefreshCwIcon className="w-3 h-3 animate-spin"/> Salvando...</span>}
                        </div>
                    </div>
                </div>

                {/* Tools */}
                <div className="flex bg-slate-900 rounded-lg p-1 gap-1">
                    {[
                        { id: 'pan', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l4-4 4 4"/><path d="M5 15l4 4 4-4"/><path d="M9 5v14"/><path d="M15 9l4-4 4 4"/><path d="M15 15l4 4 4-4"/><path d="M19 5v14"/></svg> },
                        { id: 'ruler', icon: <RulerIcon className="w-5 h-5" /> },
                        { id: 'angle', icon: <AngleIcon className="w-5 h-5" /> },
                        { id: 'arrow', icon: <ArrowIcon className="w-5 h-5" /> },
                        { id: 'circle', icon: <CircleIcon className="w-5 h-5" /> },
                        { id: 'text', icon: <FileTextIcon className="w-5 h-5" /> }
                    ].map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={`p-2 rounded-md transition-colors ${activeTool === tool.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            title={tool.id}
                        >
                            {tool.icon}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button onClick={() => setAnnotations([])} className="text-red-400 hover:text-red-300 p-2"><TrashIcon className="w-5 h-5" /></button>
                    <div className="h-6 w-px bg-slate-600"></div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 hover:bg-slate-700 rounded transition-colors ${isSidebarOpen ? 'text-primary' : 'text-slate-400'}`}>
                        <HistoryIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                        <CheckCircleIcon className="w-4 h-4" /> Salvar
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Canvas Container */}
                <div 
                    ref={containerRef}
                    className="flex-1 bg-black relative overflow-hidden flex items-center justify-center cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={(e) => {
                        if (e.ctrlKey) {
                            e.preventDefault();
                            setScale(s => Math.min(5, Math.max(0.1, s - e.deltaY * 0.001)));
                        }
                    }}
                >
                    <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />
                    
                    {/* Floating Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-xl flex items-center gap-4 text-slate-300 shadow-xl">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setScale(s => s * 0.9)} className="p-1 hover:text-white"><ZoomOutIcon className="w-4 h-4" /></button>
                            <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => s * 1.1)} className="p-1 hover:text-white"><ZoomInIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="w-px h-4 bg-slate-600"></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setRotation(r => r - 90)} className="p-1 hover:text-white"><RefreshCwIcon className="w-4 h-4 -scale-x-100" /></button>
                            <button onClick={() => setRotation(r => r + 90)} className="p-1 hover:text-white"><RefreshCwIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="w-px h-4 bg-slate-600"></div>
                        <div className="flex items-center gap-2" title="Brilho / Contraste">
                            <SunIcon className="w-4 h-4 text-amber-400" />
                            <input 
                                type="range" min="50" max="150" 
                                value={brightness} 
                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            />
                        </div>
                    </div>

                    {/* PDF Navigation (if applicable) */}
                    {asset.type === 'pdf' && (
                        <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-800 p-2 rounded-lg text-white">
                            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeftIcon className="w-5 h-5"/></button>
                            <span className="text-sm">Pág {currentPage} / {numPages}</span>
                            <button disabled={currentPage >= numPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRightIcon className="w-5 h-5"/></button>
                        </div>
                    )}
                </div>

                {/* Sidebar (History) */}
                {isSidebarOpen && (
                    <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="p-4 border-b border-slate-700 font-bold text-sm text-slate-300">
                            Versões Salvas
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {versions.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Nenhuma anotação salva.</p>}
                            {versions.map(v => (
                                <div 
                                    key={v.id}
                                    onClick={() => handleLoadVersion(v)}
                                    className={`p-3 rounded-lg border cursor-pointer hover:border-primary transition-all ${selectedVersion === v.id ? 'bg-slate-700 border-primary' : 'bg-slate-700/50 border-slate-600'}`}
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-white">Versão {v.versionNumber}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="aspect-video bg-black rounded overflow-hidden mb-2 relative">
                                        {v.thumbnailUrl ? (
                                            <img src={v.thumbnailUrl} className="w-full h-full object-cover opacity-70" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Sem Preview</div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate">Por: {v.createdBy}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetViewer;
