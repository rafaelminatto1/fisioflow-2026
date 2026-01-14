'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircleIcon,
  CopyIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '../components/Icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleCopy = () => {
    const errorDetails = `
Error: ${error.message}
Digest: ${error.digest || 'N/A'}
Stack: ${error.stack || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-red-100">
        <AlertCircleIcon className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Algo não saiu como esperado</h2>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        Encontramos um erro ao carregar os dados. Por favor, verifique sua conexão ou tente novamente.
      </p>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
        >
          Recarregar Página
        </button>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-slate-200 transition-all duration-200 active:scale-[0.98]"
        >
          Tentar Novamente
        </button>
      </div>

      <div className="w-full max-w-lg">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="group flex items-center justify-center w-full gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          {showDetails ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              <span>Ocultar detalhes técnicos</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              <span>Mostrar detalhes técnicos</span>
            </>
          )}
        </button>

        {showDetails && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Debug Info</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 hover:border-slate-300 shadow-sm"
              >
                {copied ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Copiar Erro</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 text-left overflow-auto max-h-[300px] bg-slate-50/50">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Mensagem</label>
                  <p className="text-sm font-mono text-red-600 break-words bg-red-50/50 p-2 rounded border border-red-100">
                    {error.message}
                  </p>
                </div>

                {error.digest && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Digest ID</label>
                    <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block select-all">
                      {error.digest}
                    </code>
                  </div>
                )}

                {error.stack && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Stack Trace</label>
                    <pre className="text-[10px] leading-relaxed font-mono text-slate-500 whitespace-pre-wrap overflow-x-auto p-2 bg-slate-100 rounded border border-slate-200/60">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}