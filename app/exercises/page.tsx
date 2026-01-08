
'use client';

import React from 'react';
import ExercisesLibrary from '../../components/ExercisesLibrary';

interface ExercisesPageProps {
    onNewExercise?: () => void;
    lastUpdate?: number;
}

export default function ExercisesPage({ onNewExercise, lastUpdate }: ExercisesPageProps) {
  return (
    <div className="space-y-6">
      <ExercisesLibrary onNewExercise={onNewExercise} lastUpdate={lastUpdate} />
    </div>
  );
}
