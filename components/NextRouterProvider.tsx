
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RouterContext } from '../hooks/useRouter';

export function NextRouterProvider({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  const routerAdapter = {
    push: (path: string) => router.push(path.startsWith('/') ? path : `/${path}`),
    back: () => router.back(),
  };

  return (
    <RouterContext.Provider value={routerAdapter}>
      {children}
    </RouterContext.Provider>
  );
}
