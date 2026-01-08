
import React from 'react';
import { api } from '../../../services/api';
import ExecutiveReport from '../../../components/ExecutiveReport';

// Next.js 16: searchParams é uma Promise
interface PageProps {
  searchParams?: Promise<{ period?: string }>;
}

export default async function ExecutiveReportPage(props: PageProps) {
  // 1. Resolver os parâmetros de busca (Next.js 15/16)
  const searchParams = await props.searchParams;
  const period = searchParams?.period || 'month';

  // 2. Buscar dados no servidor (Server-side Data Fetching)
  // Isso roda no servidor, reduzindo o JS enviado ao cliente
  const data = await api.reports.executive(period);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-700 mb-2">Falha ao carregar relatório</h2>
        <p>Não foi possível obter os dados para o período selecionado.</p>
      </div>
    );
  }

  // 3. Renderizar o Client Component passando os dados iniciais
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <ExecutiveReport initialData={data} currentPeriod={period} />
    </div>
  );
}
