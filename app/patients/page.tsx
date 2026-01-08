
'use client';

import React from 'react';
import PatientsList from '../../components/PatientsList';

interface PatientsPageProps {
    onViewPatient?: (id: string) => void;
    onNewPatient?: () => void;
    initialStatus?: 'all' | 'active' | 'inactive';
    lastUpdate?: number;
}

export default function PatientsPage({ onViewPatient, onNewPatient, initialStatus, lastUpdate }: PatientsPageProps) {
  return (
    <div className="space-y-6">
      <PatientsList 
        onViewPatient={onViewPatient} 
        onNewPatient={onNewPatient}
        initialStatus={initialStatus}
        lastUpdate={lastUpdate}
      />
    </div>
  );
}
