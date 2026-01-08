
'use client';

import React from 'react';
import Waitlist from '../../components/Waitlist';

interface WaitlistPageProps {
    onNewEntry?: () => void;
    lastUpdate?: number;
}

export default function WaitlistPage({ onNewEntry, lastUpdate }: WaitlistPageProps) {
  return (
    <div className="space-y-6">
      <Waitlist onNewEntry={onNewEntry} lastUpdate={lastUpdate} />
    </div>
  );
}
