
'use client';

import React from 'react';
import PreRegisterForm from '../../components/PreRegisterForm';

export default function PreRegisterPage() {
  return (
    // This page intentionally has no layout/sidebar wrapper as it's meant for kiosk mode
    <div className="absolute inset-0 z-50 bg-white">
      <PreRegisterForm />
    </div>
  );
}
