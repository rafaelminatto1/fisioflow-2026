
'use client';

import React, { useMemo } from 'react';
import { PhysioPerformance } from '../types';

interface PhysioChartProps {
  data: PhysioPerformance[];
}

const PhysioChart: React.FC<PhysioChartProps> = React.memo(({ data }) => {
  const { sortedData, maxVal } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.appointments - a.appointments);
    const max = Math.max(...sorted.map(d => d.appointments)) || 1; 
    return { sortedData: sorted, maxVal: max };
  }, [data]);

  return (
    <div className="glass-card p-6 rounded-[32px] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Produtividade</h3>
            <p className="text-lg font-bold dark:text-white text-slate-900">Atendimentos do Mês</p>
        </div>
        <button className="text-primary text-[10px] font-black uppercase hover:underline tracking-widest">Ver Detalhes</button>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {sortedData.map((item, index) => {
            const scaleFactor = item.appointments / maxVal;
            const delay = index * 100;
            
            return (
                <div key={item.therapistId} className="group">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            {item.name.replace('Dr. ', '').replace('Dra. ', '')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.appointments}
                        </span>
                    </div>
                    
                    {/* Progress Track */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        {/* Progress Bar */}
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.4)] relative"
                            style={{ 
                                width: `${scaleFactor * 100}%`,
                                animation: `slideIn 1s ease-out ${delay}ms forwards`,
                                transformOrigin: 'left'
                            }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-[2px]"></div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
});

PhysioChart.displayName = 'PhysioChart';

export default PhysioChart;
