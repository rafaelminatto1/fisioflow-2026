
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DocumentsManager = dynamic(
  () => import('../../components/DocumentsManager'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    )
  }
);

export default function DocumentsPage() {
  return (
    <div className="h-full">
      <DocumentsManager />
    </div>
  );
}
