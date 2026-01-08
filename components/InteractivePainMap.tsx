
'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
        { id: 'forearm_r', d: "M70,115 L90,120 L85,150 L65,145 Z", name: "Antebraço D" },
        { id: 'forearm_l', d: "M150,120 L170,115 L175,145 L155,150 Z", name: "Antebraço E" },
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
      if (onPointSelect) onPointSelect(newPoint);
  };

  const handlePointClick = (e: React.MouseEvent, point: PainPoint) => {
      e.stopPropagation();
      if (onPointSelect) onPointSelect(point);
  };

  const isPointVisible = (pointAngle: number) => {
      const diff = Math.abs(pointAngle - rotation);
      const normalizedDiff = Math.min(diff, 360 - diff);
      return normalizedDiff < 85;
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative perspective-1000">
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
                    
                    // Intensity Gradient Color
                    const color = p.intensity > 7 ? '#ef4444' : p.intensity > 3 ? '#f59e0b' : '#38bdf8'; 

                    return (
                        <g key={p.id} onClick={(e) => handlePointClick(e, p)} className="cursor-pointer">
                            {/* Outer Glow Ring */}
                            <circle 
                                cx={p.x + '%'} cy={p.y + '%'} r={isSelected ? 10 : 0} 
                                fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2 2"
                                className="animate-[spin_4s_linear_infinite]"
                            />
                            {/* Core Glow */}
                            <circle 
                                cx={p.x + '%'} cy={p.y + '%'} r={isSelected ? 6 : 4} 
                                fill={color} filter="url(#neonGlow)" opacity="0.8"
                                className={isSelected ? "animate-pulse" : ""}
                            />
                            {/* Inner Core */}
                            <circle cx={p.x + '%'} cy={p.y + '%'} r={2} fill="#fff" />
                        </g>
                    );
                })}
            </svg>
        </div>
    </div>
  );
};

export default InteractivePainMap;
