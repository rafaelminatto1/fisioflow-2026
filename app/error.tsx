'use client';

import React, { useEffect } from 'react';
import { AlertCircleIcon } from '../components/Icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = React.useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
        <AlertCircleIcon className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Algo não saiu como esperado</h2>
      <p className="text-slate-500 max-w-md">
        Encontramos um erro ao carregar os dados do Dashboard Executivo. Por favor, verifique sua conexão ou tente novamente.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Recarregar Página
        </button>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-sky-600 shadow-sm transition-colors"
        >
          Tentar Novamente
        </button>
      </div>

      <div className="mt-8 w-full max-w-md">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center w-full gap-1"
        >
          {showDetails ? 'Ocultar detalhes técnicos' : 'Mostrar detalhes técnicos'}
        </button>

        {showDetails && (
          <div className="mt-2 p-4 bg-slate-50 rounded-lg text-left overflow-auto max-h-64 border border-slate-100">
            <p className="text-xs font-mono text-slate-600 font-semibold mb-1">Erro:</p>
            <p className="text-xs font-mono text-slate-500 mb-2 whitespace-pre-wrap">{error.message}</p>

            {error.digest && (
              <>
                <p className="text-xs font-mono text-slate-600 font-semibold mb-1">Digest:</p>
                <p className="text-xs font-mono text-slate-500 mb-2 select-all">{error.digest}</p>
              </>
            )}

            {error.stack && (
              <>
                <p className="text-xs font-mono text-slate-600 font-semibold mb-1">Stack:</p>
                <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap">{error.stack}</pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}