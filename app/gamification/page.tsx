
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RankingEntry } from '../../types';
import { TrophyIcon, TrendingUpIcon } from '../../components/Icons';

export default function GamificationPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        const data = await api.gamification.ranking();
        setRanking(data);
        setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando ranking...</div>;

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 rounded-2xl shadow-lg text-white flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <TrophyIcon className="w-10 h-10 text-yellow-300" />
                    Ranking de Pacientes
                </h2>
                <p className="opacity-90 mt-2">Engajamento e assiduidade recompensados!</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
                <TrophyIcon className="w-64 h-64" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ranking.slice(0, 3).map((entry, index) => (
                <div key={entry.patientId} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-400' : 'bg-orange-700'}`}></div>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold mb-3 border-4 border-white shadow-md">
                        {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{entry.patientName}</h3>
                    <div className="mt-2 text-3xl font-extrabold text-primary">{entry.points} <span className="text-sm font-normal text-slate-400">pts</span></div>
                    <div className="flex gap-1 mt-4">
                        {entry.badges.map(b => <span key={b} className="text-xl" title="Conquista">{b}</span>)}
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 w-16">#</th>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Nível</th>
                        <th className="px-6 py-4">Streak (Dias)</th>
                        <th className="px-6 py-4 text-right">Total Pontos</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {ranking.slice(3).map((entry, index) => (
                        <tr key={entry.patientId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-400">{index + 4}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{entry.patientName}</td>
                            <td className="px-6 py-4 text-slate-600">Nível {entry.level}</td>
                            <td className="px-6 py-4">
                                <span className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 w-fit px-2 py-1 rounded-full text-xs">
                                    <TrendingUpIcon className="w-3 h-3" /> {entry.streak}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-primary">{entry.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
