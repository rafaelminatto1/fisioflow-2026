'use client';

import React, { useState } from 'react';
import { PlusIcon, XIcon, CheckCircleIcon, AlertCircleIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';

export interface RangeOfMotion {
  joint: string;
  movement: string;
  left?: number;
  right?: number;
  normal: number;
  unit: string;
  notes?: string;
}

export interface MuscleStrength {
  muscle: string;
  side: 'left' | 'right' | 'bilateral';
  grade: number; // 0-5 MRC scale
  notes?: string;
}

export interface SpecialTest {
  name: string;
  region: string;
  result: 'positive' | 'negative' | 'inconclusive';
  notes?: string;
}

export interface FunctionalTests {
  rangeOfMotion: RangeOfMotion[];
  muscleStrength: MuscleStrength[];
  specialTests: SpecialTest[];
  gait?: {
    pattern: string;
    assistiveDevice?: string;
    notes?: string;
  };
  balance?: {
    rombergTest?: 'positive' | 'negative';
    tandemStance?: number; // seconds
    singleLegStanceLeft?: number;
    singleLegStanceRight?: number;
    notes?: string;
  };
  functionalScores?: {
    name: string;
    score: number;
    maxScore: number;
    interpretation?: string;
  }[];
}

interface FunctionalTestsSectionProps {
  value: FunctionalTests;
  onChange: (value: FunctionalTests) => void;
  readOnly?: boolean;
}

// Pre-defined templates
const ROM_TEMPLATES: Omit<RangeOfMotion, 'left' | 'right'>[] = [
  { joint: 'Ombro', movement: 'Flexão', normal: 180, unit: '°' },
  { joint: 'Ombro', movement: 'Abdução', normal: 180, unit: '°' },
  { joint: 'Ombro', movement: 'Rotação Externa', normal: 90, unit: '°' },
  { joint: 'Ombro', movement: 'Rotação Interna', normal: 70, unit: '°' },
  { joint: 'Cotovelo', movement: 'Flexão', normal: 145, unit: '°' },
  { joint: 'Cotovelo', movement: 'Extensão', normal: 0, unit: '°' },
  { joint: 'Punho', movement: 'Flexão', normal: 80, unit: '°' },
  { joint: 'Punho', movement: 'Extensão', normal: 70, unit: '°' },
  { joint: 'Quadril', movement: 'Flexão', normal: 120, unit: '°' },
  { joint: 'Quadril', movement: 'Extensão', normal: 30, unit: '°' },
  { joint: 'Quadril', movement: 'Abdução', normal: 45, unit: '°' },
  { joint: 'Quadril', movement: 'Adução', normal: 30, unit: '°' },
  { joint: 'Joelho', movement: 'Flexão', normal: 135, unit: '°' },
  { joint: 'Joelho', movement: 'Extensão', normal: 0, unit: '°' },
  { joint: 'Tornozelo', movement: 'Dorsiflexão', normal: 20, unit: '°' },
  { joint: 'Tornozelo', movement: 'Plantiflexão', normal: 50, unit: '°' },
  { joint: 'Coluna Cervical', movement: 'Flexão', normal: 45, unit: '°' },
  { joint: 'Coluna Cervical', movement: 'Extensão', normal: 45, unit: '°' },
  { joint: 'Coluna Cervical', movement: 'Rotação', normal: 60, unit: '°' },
  { joint: 'Coluna Lombar', movement: 'Flexão', normal: 90, unit: '°' },
  { joint: 'Coluna Lombar', movement: 'Extensão', normal: 30, unit: '°' },
];

const SPECIAL_TESTS_TEMPLATES = [
  { name: 'Teste de Neer', region: 'Ombro' },
  { name: 'Teste de Hawkins-Kennedy', region: 'Ombro' },
  { name: 'Teste de Jobe', region: 'Ombro' },
  { name: 'Speed Test', region: 'Ombro' },
  { name: 'Teste de Yergason', region: 'Ombro' },
  { name: 'Teste de Apprehension', region: 'Ombro' },
  { name: 'Teste de Lachman', region: 'Joelho' },
  { name: 'Gaveta Anterior', region: 'Joelho' },
  { name: 'Gaveta Posterior', region: 'Joelho' },
  { name: 'McMurray', region: 'Joelho' },
  { name: 'Apley', region: 'Joelho' },
  { name: 'Teste de Varo/Valgo', region: 'Joelho' },
  { name: 'Gaveta Anterior do Tornozelo', region: 'Tornozelo' },
  { name: 'Teste de Inversão Forçada', region: 'Tornozelo' },
  { name: 'Lasègue (SLR)', region: 'Coluna Lombar' },
  { name: 'Slump Test', region: 'Coluna Lombar' },
  { name: 'Patrick/FABER', region: 'Quadril/Sacroilíaca' },
  { name: 'Thomas Test', region: 'Quadril' },
  { name: 'Ober Test', region: 'Quadril' },
  { name: 'Spurling Test', region: 'Coluna Cervical' },
  { name: 'Teste de Compressão Cervical', region: 'Coluna Cervical' },
  { name: 'Phalen Test', region: 'Punho' },
  { name: 'Tinel', region: 'Punho/Cotovelo' },
  { name: 'Finkelstein', region: 'Punho' },
];

const MUSCLE_STRENGTH_GRADES = [
  { value: 0, label: '0 - Ausente', description: 'Sem contração visível' },
  { value: 1, label: '1 - Vestígio', description: 'Contração visível sem movimento' },
  { value: 2, label: '2 - Pobre', description: 'Movimento com gravidade eliminada' },
  { value: 3, label: '3 - Regular', description: 'Movimento contra gravidade' },
  { value: 4, label: '4 - Bom', description: 'Movimento contra resistência moderada' },
  { value: 5, label: '5 - Normal', description: 'Movimento contra resistência máxima' },
];

const FunctionalTestsSection: React.FC<FunctionalTestsSectionProps> = ({ value, onChange, readOnly = false }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['rom', 'special']));
  const [showRomSelector, setShowRomSelector] = useState(false);
  const [showTestSelector, setShowTestSelector] = useState(false);
  const [showMuscleSelector, setShowMuscleSelector] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // ROM Handlers
  const addRom = (template: Omit<RangeOfMotion, 'left' | 'right'>) => {
    onChange({
      ...value,
      rangeOfMotion: [...value.rangeOfMotion, { ...template }]
    });
    setShowRomSelector(false);
  };

  const updateRom = (index: number, field: keyof RangeOfMotion, newValue: any) => {
    const updated = [...value.rangeOfMotion];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange({ ...value, rangeOfMotion: updated });
  };

  const removeRom = (index: number) => {
    onChange({
      ...value,
      rangeOfMotion: value.rangeOfMotion.filter((_, i) => i !== index)
    });
  };

  // Special Test Handlers
  const addSpecialTest = (template: { name: string; region: string }) => {
    onChange({
      ...value,
      specialTests: [...value.specialTests, { ...template, result: 'negative' as const }]
    });
    setShowTestSelector(false);
  };

  const updateSpecialTest = (index: number, field: keyof SpecialTest, newValue: any) => {
    const updated = [...value.specialTests];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange({ ...value, specialTests: updated });
  };

  const removeSpecialTest = (index: number) => {
    onChange({
      ...value,
      specialTests: value.specialTests.filter((_, i) => i !== index)
    });
  };

  // Muscle Strength Handlers
  const addMuscleStrength = () => {
    onChange({
      ...value,
      muscleStrength: [...value.muscleStrength, { muscle: '', side: 'bilateral', grade: 5 }]
    });
  };

  const updateMuscleStrength = (index: number, field: keyof MuscleStrength, newValue: any) => {
    const updated = [...value.muscleStrength];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange({ ...value, muscleStrength: updated });
  };

  const removeMuscleStrength = (index: number) => {
    onChange({
      ...value,
      muscleStrength: value.muscleStrength.filter((_, i) => i !== index)
    });
  };

  const getRomPercentage = (current: number | undefined, normal: number): number | null => {
    if (current === undefined || current === null) return null;
    return Math.round((current / normal) * 100);
  };

  const getRomColor = (percentage: number | null): string => {
    if (percentage === null) return 'bg-slate-200';
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Range of Motion Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => toggleSection('rom')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 hover:from-blue-100 dark:hover:from-blue-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('rom') ? <ChevronDownIcon className="w-5 h-5 text-blue-600" /> : <ChevronRightIcon className="w-5 h-5 text-blue-600" />}
            <span className="font-bold text-slate-800 dark:text-white">Amplitude de Movimento (ADM)</span>
            {value.rangeOfMotion.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-xs font-bold">
                {value.rangeOfMotion.length}
              </span>
            )}
          </div>
          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowRomSelector(true); }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusIcon className="w-3 h-3" /> Adicionar
            </button>
          )}
        </button>

        {expandedSections.has('rom') && (
          <div className="p-4 space-y-3">
            {value.rangeOfMotion.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhuma medição de ADM registrada. {!readOnly && 'Clique em "Adicionar" para começar.'}
              </p>
            ) : (
              <div className="space-y-2">
                {value.rangeOfMotion.map((rom, index) => {
                  const leftPct = getRomPercentage(rom.left, rom.normal);
                  const rightPct = getRomPercentage(rom.right, rom.normal);
                  
                  return (
                    <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white text-sm">{rom.joint}</span>
                          <span className="text-slate-500 text-sm ml-2">• {rom.movement}</span>
                          <span className="text-xs text-slate-400 ml-2">(Normal: {rom.normal}{rom.unit})</span>
                        </div>
                        {!readOnly && (
                          <button onClick={() => removeRom(index)} className="text-red-500 hover:text-red-700 p-1">
                            <XIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Left Side */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Esquerdo</span>
                            {leftPct !== null && (
                              <span className={`text-xs font-bold ${leftPct >= 90 ? 'text-emerald-600' : leftPct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                {leftPct}%
                              </span>
                            )}
                          </div>
                          {readOnly ? (
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {rom.left !== undefined ? `${rom.left}${rom.unit}` : '-'}
                            </p>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={rom.left ?? ''}
                                onChange={(e) => updateRom(index, 'left', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                              />
                              <span className="text-xs text-slate-500">{rom.unit}</span>
                            </div>
                          )}
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${getRomColor(leftPct)} transition-all`}
                              style={{ width: `${Math.min(leftPct || 0, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Right Side */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Direito</span>
                            {rightPct !== null && (
                              <span className={`text-xs font-bold ${rightPct >= 90 ? 'text-emerald-600' : rightPct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                {rightPct}%
                              </span>
                            )}
                          </div>
                          {readOnly ? (
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {rom.right !== undefined ? `${rom.right}${rom.unit}` : '-'}
                            </p>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={rom.right ?? ''}
                                onChange={(e) => updateRom(index, 'right', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                              />
                              <span className="text-xs text-slate-500">{rom.unit}</span>
                            </div>
                          )}
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${getRomColor(rightPct)} transition-all`}
                              style={{ width: `${Math.min(rightPct || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Special Tests Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => toggleSection('special')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 hover:from-purple-100 dark:hover:from-purple-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('special') ? <ChevronDownIcon className="w-5 h-5 text-purple-600" /> : <ChevronRightIcon className="w-5 h-5 text-purple-600" />}
            <span className="font-bold text-slate-800 dark:text-white">Testes Especiais</span>
            {value.specialTests.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-xs font-bold">
                {value.specialTests.length}
              </span>
            )}
          </div>
          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowTestSelector(true); }}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusIcon className="w-3 h-3" /> Adicionar
            </button>
          )}
        </button>

        {expandedSections.has('special') && (
          <div className="p-4">
            {value.specialTests.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum teste especial registrado. {!readOnly && 'Clique em "Adicionar" para começar.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {value.specialTests.map((test, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{test.name}</p>
                      <p className="text-xs text-slate-500">{test.region}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {readOnly ? (
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          test.result === 'positive' ? 'bg-red-100 text-red-600' :
                          test.result === 'negative' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {test.result === 'positive' ? 'Positivo' : test.result === 'negative' ? 'Negativo' : 'Inconclusivo'}
                        </span>
                      ) : (
                        <>
                          <select
                            value={test.result}
                            onChange={(e) => updateSpecialTest(index, 'result', e.target.value as SpecialTest['result'])}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border-0 ${
                              test.result === 'positive' ? 'bg-red-100 text-red-600' :
                              test.result === 'negative' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-amber-100 text-amber-600'
                            }`}
                          >
                            <option value="negative">Negativo</option>
                            <option value="positive">Positivo</option>
                            <option value="inconclusive">Inconclusivo</option>
                          </select>
                          <button onClick={() => removeSpecialTest(index)} className="text-red-500 hover:text-red-700 p-1">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Muscle Strength Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => toggleSection('muscle')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-800 hover:from-emerald-100 dark:hover:from-emerald-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('muscle') ? <ChevronDownIcon className="w-5 h-5 text-emerald-600" /> : <ChevronRightIcon className="w-5 h-5 text-emerald-600" />}
            <span className="font-bold text-slate-800 dark:text-white">Força Muscular (MRC)</span>
            {value.muscleStrength.length > 0 && (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs font-bold">
                {value.muscleStrength.length}
              </span>
            )}
          </div>
          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); addMuscleStrength(); }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusIcon className="w-3 h-3" /> Adicionar
            </button>
          )}
        </button>

        {expandedSections.has('muscle') && (
          <div className="p-4">
            {value.muscleStrength.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhuma avaliação de força registrada. {!readOnly && 'Clique em "Adicionar" para começar.'}
              </p>
            ) : (
              <div className="space-y-3">
                {value.muscleStrength.map((ms, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {readOnly ? (
                        <>
                          <span className="font-bold text-slate-800 dark:text-white flex-1">{ms.muscle || '-'}</span>
                          <span className="text-sm text-slate-500">{ms.side === 'bilateral' ? 'Bilateral' : ms.side === 'left' ? 'Esquerdo' : 'Direito'}</span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            ms.grade >= 4 ? 'bg-emerald-100 text-emerald-600' :
                            ms.grade >= 3 ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            Grau {ms.grade}
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={ms.muscle}
                            onChange={(e) => updateMuscleStrength(index, 'muscle', e.target.value)}
                            placeholder="Nome do músculo/grupo"
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm"
                          />
                          <select
                            value={ms.side}
                            onChange={(e) => updateMuscleStrength(index, 'side', e.target.value as MuscleStrength['side'])}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm"
                          >
                            <option value="bilateral">Bilateral</option>
                            <option value="left">Esquerdo</option>
                            <option value="right">Direito</option>
                          </select>
                          <select
                            value={ms.grade}
                            onChange={(e) => updateMuscleStrength(index, 'grade', Number(e.target.value))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold border-0 ${
                              ms.grade >= 4 ? 'bg-emerald-100 text-emerald-600' :
                              ms.grade >= 3 ? 'bg-amber-100 text-amber-600' :
                              'bg-red-100 text-red-600'
                            }`}
                          >
                            {MUSCLE_STRENGTH_GRADES.map(g => (
                              <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                          </select>
                          <button onClick={() => removeMuscleStrength(index)} className="text-red-500 hover:text-red-700 p-1">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MRC Scale Legend */}
            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Escala MRC (Medical Research Council)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs text-slate-500">
                {MUSCLE_STRENGTH_GRADES.map(g => (
                  <span key={g.value}><strong>{g.value}</strong>: {g.description}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Balance Tests Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => toggleSection('balance')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 hover:from-amber-100 dark:hover:from-amber-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('balance') ? <ChevronDownIcon className="w-5 h-5 text-amber-600" /> : <ChevronRightIcon className="w-5 h-5 text-amber-600" />}
            <span className="font-bold text-slate-800 dark:text-white">Testes de Equilíbrio</span>
          </div>
        </button>

        {expandedSections.has('balance') && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Romberg Test */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Teste de Romberg</span>
              {readOnly ? (
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  value.balance?.rombergTest === 'positive' ? 'bg-red-100 text-red-600' :
                  value.balance?.rombergTest === 'negative' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {value.balance?.rombergTest === 'positive' ? 'Positivo' : 
                   value.balance?.rombergTest === 'negative' ? 'Negativo' : 'Não avaliado'}
                </span>
              ) : (
                <select
                  value={value.balance?.rombergTest || ''}
                  onChange={(e) => onChange({
                    ...value,
                    balance: { ...value.balance, rombergTest: e.target.value as 'positive' | 'negative' || undefined }
                  })}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-full"
                >
                  <option value="">Não avaliado</option>
                  <option value="negative">Negativo</option>
                  <option value="positive">Positivo</option>
                </select>
              )}
            </div>

            {/* Tandem Stance */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Tandem (Pé-Calcanhar)</span>
              {readOnly ? (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {value.balance?.tandemStance !== undefined ? `${value.balance.tandemStance}s` : '-'}
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={value.balance?.tandemStance ?? ''}
                    onChange={(e) => onChange({
                      ...value,
                      balance: { ...value.balance, tandemStance: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="30"
                    className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                  />
                  <span className="text-xs text-slate-500">segundos</span>
                </div>
              )}
            </div>

            {/* Single Leg Stance */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Apoio Unipodal (Esquerdo)</span>
              {readOnly ? (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {value.balance?.singleLegStanceLeft !== undefined ? `${value.balance.singleLegStanceLeft}s` : '-'}
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={value.balance?.singleLegStanceLeft ?? ''}
                    onChange={(e) => onChange({
                      ...value,
                      balance: { ...value.balance, singleLegStanceLeft: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="30"
                    className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                  />
                  <span className="text-xs text-slate-500">segundos</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Apoio Unipodal (Direito)</span>
              {readOnly ? (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {value.balance?.singleLegStanceRight !== undefined ? `${value.balance.singleLegStanceRight}s` : '-'}
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={value.balance?.singleLegStanceRight ?? ''}
                    onChange={(e) => onChange({
                      ...value,
                      balance: { ...value.balance, singleLegStanceRight: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="30"
                    className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                  />
                  <span className="text-xs text-slate-500">segundos</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ROM Selector Modal */}
      {showRomSelector && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Adicionar Medição de ADM</h3>
              <button onClick={() => setShowRomSelector(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {ROM_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addRom(template)}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <span className="font-bold text-slate-800 dark:text-white">{template.joint}</span>
                    <span className="text-slate-500 ml-2">• {template.movement}</span>
                    <span className="text-xs text-slate-400 ml-2">(Normal: {template.normal}{template.unit})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special Test Selector Modal */}
      {showTestSelector && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Adicionar Teste Especial</h3>
              <button onClick={() => setShowTestSelector(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {SPECIAL_TESTS_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSpecialTest(template)}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  >
                    <span className="font-bold text-slate-800 dark:text-white">{template.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({template.region})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalTestsSection;
