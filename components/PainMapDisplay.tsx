
'use client';

import React from 'react';
import InteractivePainMap, { PainPoint } from './InteractivePainMap';

interface PainMapDisplayProps {
  imageUrl?: string; 
  bodyPart: string;
  points: PainPoint[];
}

const PainMapDisplay: React.FC<PainMapDisplayProps> = ({ points, bodyPart }) => {
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-50 rounded-lg overflow-hidden border border-slate-200 relative group">
        <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 uppercase border border-slate-100 shadow-sm pointer-events-none">
            {bodyPart}
        </div>
        <InteractivePainMap 
            initialPoints={points} 
            readOnly={true} 
        />
    </div>
  );
};

export default PainMapDisplay;
