
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { PoseLandmarks, Landmark } from '../../types';

interface LandmarkEditorProps {
    imageUrl: string;
    initialLandmarks?: PoseLandmarks;
    onChange?: (landmarks: PoseLandmarks) => void;
    readOnly?: boolean;
}

const POINT_RADIUS = 6;
const HOVER_RADIUS = 10;
const SKELETON_COLOR = '#0ea5e9'; // Sky 500
const POINT_COLOR = '#ffffff';
const POINT_BORDER = '#0284c7'; // Sky 600

// Conexões anatômicas para desenho do esqueleto
const CONNECTIONS: [keyof PoseLandmarks, keyof PoseLandmarks][] = [
    ['leftEar', 'leftEye'], ['rightEar', 'rightEye'], ['leftEye', 'nose'], ['rightEye', 'nose'],
    ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'], ['leftHip', 'rightHip'],
    ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle']
];

const LandmarkEditor: React.FC<LandmarkEditorProps> = ({ imageUrl, initialLandmarks, onChange, readOnly }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [landmarks, setLandmarks] = useState<PoseLandmarks>(initialLandmarks || {});
    const [activePoint, setActivePoint] = useState<keyof PoseLandmarks | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<keyof PoseLandmarks | null>(null);
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

    // Carregar imagem
    useEffect(() => {
        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "Anonymous";
        img.onload = () => setImageObj(img);
    }, [imageUrl]);

    // Sincronizar props externas
    useEffect(() => {
        if (initialLandmarks) setLandmarks(initialLandmarks);
    }, [initialLandmarks]);

    // Loop de desenho
    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !imageObj) return;

        // Limpar
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calcular escala para "contain" a imagem no canvas
        const scale = Math.min(canvas.width / imageObj.width, canvas.height / imageObj.height);
        const imgW = imageObj.width * scale;
        const imgH = imageObj.height * scale;
        const offsetX = (canvas.width - imgW) / 2;
        const offsetY = (canvas.height - imgH) / 2;
        
        // Desenhar imagem
        ctx.drawImage(imageObj, offsetX, offsetY, imgW, imgH);

        // Helper para converter coord normalizada (0-1) para pixel
        const toPx = (l: Landmark) => ({
            x: offsetX + l.x * imgW,
            y: offsetY + l.y * imgH
        });

        // Desenhar Esqueleto
        ctx.lineWidth = 3;
        ctx.strokeStyle = SKELETON_COLOR;
        ctx.lineCap = 'round';
        CONNECTIONS.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            if (p1 && p2) {
                const c1 = toPx(p1);
                const c2 = toPx(p2);
                ctx.beginPath();
                ctx.moveTo(c1.x, c1.y);
                ctx.lineTo(c2.x, c2.y);
                ctx.stroke();
            }
        });

        // Desenhar Linha de Prumo (Referência Vertical Central)
        if (landmarks.nose && landmarks.leftAnkle && landmarks.rightAnkle) {
             const midAnkleX = (landmarks.leftAnkle.x + landmarks.rightAnkle.x) / 2;
             // Usa o nariz ou meio dos tornozelos como referência
             const top = toPx({ x: midAnkleX, y: 0 });
             const bottom = toPx({ x: midAnkleX, y: 1 });
             
             ctx.beginPath();
             ctx.setLineDash([5, 5]);
             ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
             ctx.lineWidth = 1;
             ctx.moveTo(top.x, top.y);
             ctx.lineTo(bottom.x, bottom.y);
             ctx.stroke();
             ctx.setLineDash([]);
        }

        // Desenhar Pontos
        (Object.keys(landmarks) as Array<keyof PoseLandmarks>).forEach(key => {
            const point = landmarks[key];
            if (!point) return;
            const coord = toPx(point);

            ctx.beginPath();
            ctx.arc(coord.x, coord.y, key === hoveredPoint || key === activePoint ? HOVER_RADIUS : POINT_RADIUS, 0, 2 * Math.PI);
            ctx.fillStyle = key === activePoint ? '#f43f5e' : POINT_COLOR; 
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = POINT_BORDER;
            ctx.stroke();
            
            // Labels ao passar o mouse
            if (key === hoveredPoint || key === activePoint) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(coord.x + 15, coord.y - 15, ctx.measureText(key).width + 10, 20);
                ctx.fillStyle = 'white';
                ctx.font = '10px sans-serif';
                ctx.fillText(key, coord.x + 20, coord.y - 2);
            }
        });
    };

    useEffect(() => {
        requestAnimationFrame(draw);
    }, [imageObj, landmarks, hoveredPoint, activePoint]);

    // Responsividade
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                draw();
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [containerRef.current]);

    // --- Manipulação de Eventos ---
    
    const getNormalizedPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageObj) return null;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        // Calcular posição relativa à imagem (não ao canvas inteiro, pois tem letterboxing)
        const scale = Math.min(canvas.width / imageObj.width, canvas.height / imageObj.height);
        const imgW = imageObj.width * scale;
        const imgH = imageObj.height * scale;
        const offsetX = (canvas.width - imgW) / 2;
        const offsetY = (canvas.height - imgH) / 2;

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Check if inside image bounds
        if (mouseX < offsetX || mouseX > offsetX + imgW || mouseY < offsetY || mouseY > offsetY + imgH) {
            return null; // Fora da imagem
        }

        return {
            x: (mouseX - offsetX) / imgW,
            y: (mouseY - offsetY) / imgH
        };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (readOnly) return;
        const pos = getNormalizedPos(e);
        if (!pos) return;

        // Detectar clique em ponto existente
        let clickedPoint: keyof PoseLandmarks | null = null;
        let minDist = 0.05; // Tolerância normalizada (aprox 5% da largura)

        (Object.keys(landmarks) as Array<keyof PoseLandmarks>).forEach(key => {
            const l = landmarks[key];
            if (l) {
                const dist = Math.sqrt(Math.pow(l.x - pos.x, 2) + Math.pow(l.y - pos.y, 2));
                if (dist < minDist) {
                    minDist = dist;
                    clickedPoint = key;
                }
            }
        });

        if (clickedPoint) {
            setActivePoint(clickedPoint);
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getNormalizedPos(e);
        
        if (activePoint && pos) {
            // Dragging
            const updated = { ...landmarks, [activePoint]: { ...landmarks[activePoint], x: pos.x, y: pos.y } as Landmark };
            setLandmarks(updated);
            onChange?.(updated);
        } else if (pos && !readOnly) {
            // Hovering
            let found: keyof PoseLandmarks | null = null;
            let minDist = 0.03;
            
            (Object.keys(landmarks) as Array<keyof PoseLandmarks>).forEach(key => {
                const l = landmarks[key];
                if (l) {
                    const dist = Math.sqrt(Math.pow(l.x - pos.x, 2) + Math.pow(l.y - pos.y, 2));
                    if (dist < minDist) found = key;
                }
            });
            setHoveredPoint(found);
            if (canvasRef.current) canvasRef.current.style.cursor = found ? 'grab' : 'default';
        }
    };

    const handleMouseUp = () => {
        setActivePoint(null);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden select-none shadow-inner border border-slate-700">
            <canvas 
                ref={canvasRef}
                className="block w-full h-full touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            />
            
            {!readOnly && (
                <div className="absolute top-3 left-3 bg-black/60 text-white/90 text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-none border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Modo Edição: Arraste os pontos para corrigir
                </div>
            )}
        </div>
    );
};

export default LandmarkEditor;
