
'use client';

import React from 'react';
import PackagesList from '../../components/PackagesList';

interface PackagesPageProps {
    onNewPackage?: () => void;
    lastUpdate?: number;
}

export default function PackagesPage({ onNewPackage, lastUpdate }: PackagesPageProps) {
  return (
    <div className="space-y-6">
      <PackagesList onNewPackage={onNewPackage} lastUpdate={lastUpdate} />
    </div>
  );
}
