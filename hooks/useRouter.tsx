
import React from 'react';

export interface RouterContextType {
  push: (path: string) => void;
  back: () => void;
}

export const RouterContext = React.createContext<RouterContextType | null>(null);

export const useRouter = () => {
  const context = React.useContext(RouterContext);
  if (!context) {
    console.warn('RouterContext not found. Ensure the component is wrapped in a RouterContext.Provider.');
    return { 
        push: (path: string) => console.log('Mock push:', path), 
        back: () => console.log('Mock back') 
    };
  }
  return context;
};
