
'use client';

import React, { useContext } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FinancialData } from '../types';
import { ThemeContext } from '../App';

interface FinancialChartProps {
  data: FinancialData[];
}

const FinancialChart: React.FC<FinancialChartProps> = React.memo(({ data }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="glass-card p-6 rounded-[32px] h-full flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo de Caixa</h3>
          <p className="text-2xl font-bold dark:text-white text-slate-900 mt-1">Performance Semestral</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#0ea5e9]"></span>
            <span className="dark:text-slate-400">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="dark:text-slate-400 text-slate-600">Despesa</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[200px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? "#94a3b8" : "#64748b"} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isDark ? "#94a3b8" : "#64748b"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
            <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                dy={10}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '16px', 
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                    color: isDark ? '#fff' : '#0f172a'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Receita"
              stroke="#0ea5e9"
              strokeWidth={3}
              fill="url(#colorRev)"
              animationDuration={2000}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Despesas"
              stroke={isDark ? "#94a3b8" : "#cbd5e1"}
              strokeWidth={2}
              fill="url(#colorExp)"
              strokeDasharray="5 5"
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default FinancialChart;
