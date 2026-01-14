'use client';

import React from 'react';
import { HeartIcon, ThermometerIcon, ActivityIcon, WindIcon, DropletIcon } from './Icons';

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
}

interface VitalSignsSectionProps {
  value: VitalSigns;
  onChange: (value: VitalSigns) => void;
  readOnly?: boolean;
}

const VitalSignsSection: React.FC<VitalSignsSectionProps> = ({ value, onChange, readOnly = false }) => {
  const handleChange = (field: keyof VitalSigns, newValue: number | string | undefined) => {
    const updated = { ...value, [field]: newValue };
    
    // Auto-calculate BMI when weight and height are provided
    if ((field === 'weight' || field === 'height') && updated.weight && updated.height) {
      const heightInMeters = updated.height / 100;
      updated.bmi = Math.round((updated.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }
    
    onChange(updated);
  };

  const getBpStatus = () => {
    if (!value.bloodPressureSystolic || !value.bloodPressureDiastolic) return null;
    const sys = value.bloodPressureSystolic;
    const dia = value.bloodPressureDiastolic;
    
    if (sys < 90 || dia < 60) return { label: 'Hipotensão', color: 'text-blue-600 bg-blue-100' };
    if (sys <= 120 && dia <= 80) return { label: 'Normal', color: 'text-emerald-600 bg-emerald-100' };
    if (sys <= 139 || dia <= 89) return { label: 'Pré-Hipertensão', color: 'text-amber-600 bg-amber-100' };
    return { label: 'Hipertensão', color: 'text-red-600 bg-red-100' };
  };

  const getHrStatus = () => {
    if (!value.heartRate) return null;
    const hr = value.heartRate;
    
    if (hr < 60) return { label: 'Bradicardia', color: 'text-blue-600 bg-blue-100' };
    if (hr <= 100) return { label: 'Normal', color: 'text-emerald-600 bg-emerald-100' };
    return { label: 'Taquicardia', color: 'text-red-600 bg-red-100' };
  };

  const getSpO2Status = () => {
    if (!value.oxygenSaturation) return null;
    const spo2 = value.oxygenSaturation;
    
    if (spo2 >= 95) return { label: 'Normal', color: 'text-emerald-600 bg-emerald-100' };
    if (spo2 >= 90) return { label: 'Atenção', color: 'text-amber-600 bg-amber-100' };
    return { label: 'Crítico', color: 'text-red-600 bg-red-100' };
  };

  const getTempStatus = () => {
    if (!value.temperature) return null;
    const temp = value.temperature;
    
    if (temp < 35) return { label: 'Hipotermia', color: 'text-blue-600 bg-blue-100' };
    if (temp <= 37.5) return { label: 'Normal', color: 'text-emerald-600 bg-emerald-100' };
    if (temp <= 38.5) return { label: 'Febre Baixa', color: 'text-amber-600 bg-amber-100' };
    return { label: 'Febre Alta', color: 'text-red-600 bg-red-100' };
  };

  const getBmiStatus = () => {
    if (!value.bmi) return null;
    const bmi = value.bmi;
    
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600 bg-blue-100' };
    if (bmi < 25) return { label: 'Peso Normal', color: 'text-emerald-600 bg-emerald-100' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-600 bg-amber-100' };
    return { label: 'Obesidade', color: 'text-red-600 bg-red-100' };
  };

  const bpStatus = getBpStatus();
  const hrStatus = getHrStatus();
  const spo2Status = getSpO2Status();
  const tempStatus = getTempStatus();
  const bmiStatus = getBmiStatus();

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Blood Pressure */}
        <div className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/20 dark:to-slate-800 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <HeartIcon className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Pressão Arterial</span>
          </div>
          {readOnly ? (
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {value.bloodPressureSystolic || '-'}/{value.bloodPressureDiastolic || '-'}
              </p>
              <p className="text-xs text-slate-500">mmHg</p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.bloodPressureSystolic || ''}
                onChange={(e) => handleChange('bloodPressureSystolic', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="120"
                className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center text-lg font-bold"
              />
              <span className="text-slate-400 font-bold">/</span>
              <input
                type="number"
                value={value.bloodPressureDiastolic || ''}
                onChange={(e) => handleChange('bloodPressureDiastolic', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="80"
                className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center text-lg font-bold"
              />
            </div>
          )}
          {bpStatus && (
            <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${bpStatus.color}`}>
              {bpStatus.label}
            </span>
          )}
        </div>

        {/* Heart Rate */}
        <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-800 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ActivityIcon className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Freq. Cardíaca</span>
          </div>
          {readOnly ? (
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.heartRate || '-'}</p>
              <p className="text-xs text-slate-500">bpm</p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.heartRate || ''}
                onChange={(e) => handleChange('heartRate', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="72"
                className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center text-lg font-bold"
              />
              <span className="text-xs text-slate-500">bpm</span>
            </div>
          )}
          {hrStatus && (
            <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${hrStatus.color}`}>
              {hrStatus.label}
            </span>
          )}
        </div>

        {/* SpO2 */}
        <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-800 rounded-xl p-4 border border-cyan-100 dark:border-cyan-900/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <DropletIcon className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">SpO₂</span>
          </div>
          {readOnly ? (
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.oxygenSaturation || '-'}</p>
              <p className="text-xs text-slate-500">%</p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.oxygenSaturation || ''}
                onChange={(e) => handleChange('oxygenSaturation', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="98"
                min="0"
                max="100"
                className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center text-lg font-bold"
              />
              <span className="text-xs text-slate-500">%</span>
            </div>
          )}
          {spo2Status && (
            <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${spo2Status.color}`}>
              {spo2Status.label}
            </span>
          )}
        </div>

        {/* Temperature */}
        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ThermometerIcon className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Temperatura</span>
          </div>
          {readOnly ? (
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.temperature || '-'}</p>
              <p className="text-xs text-slate-500">°C</p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.temperature || ''}
                onChange={(e) => handleChange('temperature', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="36.5"
                step="0.1"
                className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center text-lg font-bold"
              />
              <span className="text-xs text-slate-500">°C</span>
            </div>
          )}
          {tempStatus && (
            <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${tempStatus.color}`}>
              {tempStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Respiratory Rate */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <WindIcon className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Freq. Respiratória</span>
          </div>
          {readOnly ? (
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {value.respiratoryRate || '-'} <span className="text-xs font-normal text-slate-500">irpm</span>
            </p>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.respiratoryRate || ''}
                onChange={(e) => handleChange('respiratoryRate', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="16"
                className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
              />
              <span className="text-xs text-slate-500">irpm</span>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Peso</span>
          {readOnly ? (
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {value.weight || '-'} <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.weight || ''}
                onChange={(e) => handleChange('weight', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="70"
                step="0.1"
                className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
              />
              <span className="text-xs text-slate-500">kg</span>
            </div>
          )}
        </div>

        {/* Height */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Altura</span>
          {readOnly ? (
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {value.height || '-'} <span className="text-xs font-normal text-slate-500">cm</span>
            </p>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={value.height || ''}
                onChange={(e) => handleChange('height', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="170"
                className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
              />
              <span className="text-xs text-slate-500">cm</span>
            </div>
          )}
        </div>

        {/* BMI - Auto Calculated */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">IMC (Calculado)</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {value.bmi ? value.bmi.toFixed(1) : '-'} <span className="text-xs font-normal text-slate-500">kg/m²</span>
          </p>
          {bmiStatus && (
            <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${bmiStatus.color}`}>
              {bmiStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      {!readOnly && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
            Observações sobre Sinais Vitais
          </span>
          <textarea
            value={value.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Observações sobre os sinais vitais, medicamentos em uso, etc..."
            className="w-full h-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      )}

      {readOnly && value.notes && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Observações</span>
          <p className="text-sm text-slate-700 dark:text-slate-300">{value.notes}</p>
        </div>
      )}
    </div>
  );
};

export default VitalSignsSection;
