
'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export interface EvolutionPoint {
  date: string;
  value: number;
  note?: string;
}

interface PatientEvolutionChartProps {
  data: EvolutionPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-xs">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="font-semibold text-slate-900">
                EVA: {payload[0].value}
            </span>
        </div>
      </div>
    );
  }
  return null;
};

const PatientEvolutionChart: React.FC<PatientEvolutionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
      return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
              <p>Sem dados suficientes para gerar o gráfico de evolução.</p>
          </div>
      );
  }

  // Reverse data to show chronological order left-to-right if API returns newest first
  const chartData = [...data].reverse();

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className="text-sm font-bold text-slate-900">Evolução do Nível de Dor (EVA)</h3>
            <p className="text-xs text-slate-500">Monitoramento de recuperação</p>
        </div>
        <div className="px-2 py-1 bg-rose-50 rounded text-[10px] font-bold text-rose-600 uppercase tracking-wider border border-rose-100">
            Sinais Vitais
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEva" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                dy={10}
            />
            
            <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                domain={[0, 10]}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }} />
            
            <ReferenceLine y={3} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Meta de Alta', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#f43f5e"
              strokeWidth={3}
              fill="url(#colorEva)"
              animationDuration={1500}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientEvolutionChart;
