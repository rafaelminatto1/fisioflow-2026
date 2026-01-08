
'use client';

import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from './Icons';

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  Icon: React.ElementType;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, Icon, className }) => {
  const isPositive = trend > 0;

  return (
    <div className={`group transition-all duration-300 hover:-translate-y-2 ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-white/5 flex items-center justify-center border border-primary/20 dark:border-white/10 transition-colors group-hover:bg-primary group-hover:text-white">
            <Icon className="w-7 h-7" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border ${
            isPositive ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'
        }`}>
            {isPositive ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
            {Math.abs(trend)}%
        </div>
      </div>
      
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            {value}
        </p>
      </div>
    </div>
  );
};

export default KPICard;
