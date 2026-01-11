
'use client';

import React, { useContext } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FinancialData } from '../types';
import { ThemeContext } from './ThemeProvider';

interface FinancialChartProps {
  data: FinancialData[];
}

const FinancialChart: React.FC<FinancialChartProps> = React.memo(({ data }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="glass-card p-6 rounded-[32px] h-full flex flex-col relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-500 group-hover:opacity-75"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fluxo de Caixa</h3>
          <p className="text-2xl font-bold dark:text-white text-slate-900">Performance Semestral</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#0ea5e9]"></span>
            <span className="dark:text-slate-400 font-bold">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 dark:bg-rose-500 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></span>
            <span className="dark:text-slate-400 text-slate-600 font-bold">Despesa</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `R$ ${(value / 100 / 1000).toFixed(0)}k`} // Show in k Reals (e.g. 500000 -> 5k)
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                color: isDark ? '#fff' : '#0f172a',
                padding: '12px 16px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
              labelStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px' }}
              cursor={{ stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '4 4' }}
              formatter={(value: number) => [`R$ ${(value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Receita"
              stroke="#0ea5e9"
              strokeWidth={3}
              fill="url(#colorRev)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Despesas"
              stroke="#fb7185"
              strokeWidth={3}
              fill="url(#colorExp)"
              animationDuration={1500}
              animationEasing="ease-out"
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default FinancialChart;
