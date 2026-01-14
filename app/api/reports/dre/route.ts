import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, accountsReceivable, accountsPayable } from '@/db/schema';
import { eq, gte, lte, and, sql, ne } from 'drizzle-orm';

interface DRELine {
  label: string;
  value: number;
  percentage?: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
}

// GET /api/reports/dre - Demonstração de Resultado do Exercício
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'month':
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
        break;
      case 'quarter':
        const quarter = Math.ceil(month / 3);
        startDate = new Date(year, (quarter - 1) * 3, 1);
        endDate = new Date(year, quarter * 3, 0);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      default:
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
    }

    // Receita Bruta - Serviços Prestados
    const servicesRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'income'),
          eq(transactions.category, 'services'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );

    // Outras Receitas (pacotes, produtos, etc)
    const otherRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'income'),
          ne(transactions.category, 'services'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );

    // Despesas por categoria
    const expenses = await db
      .select({
        category: transactions.category,
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.category);

    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expensesByCategory[e.category || 'other'] = (e.total || 0) / 100;
    });

    // Calculate DRE
    const receitaBruta = ((servicesRevenue[0]?.total || 0) + (otherRevenue[0]?.total || 0)) / 100;
    const receitaServicos = (servicesRevenue[0]?.total || 0) / 100;
    const outrasReceitas = (otherRevenue[0]?.total || 0) / 100;

    // Deduções (impostos assumidos como 5% da receita bruta para simplificação)
    const impostos = receitaBruta * 0.05;
    const deducoes = impostos;

    const receitaLiquida = receitaBruta - deducoes;

    // Custos Operacionais
    const custoMateriais = expensesByCategory['materials'] || 0;
    const custoEquipamentos = expensesByCategory['equipment'] || 0;
    const custosOperacionais = custoMateriais + custoEquipamentos;

    const lucroBruto = receitaLiquida - custosOperacionais;

    // Despesas Operacionais
    const despesasPessoal = expensesByCategory['salary'] || 0;
    const despesasAluguel = expensesByCategory['rent'] || 0;
    const despesasUtilidades = expensesByCategory['utilities'] || 0;
    const despesasMarketing = expensesByCategory['marketing'] || 0;
    const despesasAdministrativas = expensesByCategory['administrative'] || expensesByCategory['other'] || 0;
    const outrasDespesas = Object.entries(expensesByCategory)
      .filter(([k]) => !['materials', 'equipment', 'salary', 'rent', 'utilities', 'marketing', 'administrative', 'other'].includes(k))
      .reduce((sum, [, v]) => sum + v, 0);

    const despesasOperacionais = despesasPessoal + despesasAluguel + despesasUtilidades + despesasMarketing + despesasAdministrativas + outrasDespesas;

    const lucroOperacional = lucroBruto - despesasOperacionais;

    // Resultado Financeiro (simplificado - juros e multas)
    const despesasFinanceiras = expensesByCategory['financial'] || 0;
    const resultadoFinanceiro = -despesasFinanceiras;

    const lucroAntesIR = lucroOperacional + resultadoFinanceiro;

    // Provisão IR (assumido como 0 para simples nacional)
    const provisaoIR = 0;

    const lucroLiquido = lucroAntesIR - provisaoIR;

    // Build DRE lines
    const dreLines: DRELine[] = [
      { label: 'RECEITA BRUTA', value: receitaBruta, isTotal: true },
      { label: '  Receita de Serviços', value: receitaServicos },
      { label: '  Outras Receitas', value: outrasReceitas },
      { label: '(-) Deduções', value: -deducoes },
      { label: '  Impostos sobre receita', value: -impostos },
      { label: '(=) RECEITA LÍQUIDA', value: receitaLiquida, isSubtotal: true, percentage: 100 },
      { label: '(-) Custos Operacionais', value: -custosOperacionais },
      { label: '  Materiais', value: -custoMateriais },
      { label: '  Equipamentos', value: -custoEquipamentos },
      { label: '(=) LUCRO BRUTO', value: lucroBruto, isSubtotal: true, percentage: receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0 },
      { label: '(-) Despesas Operacionais', value: -despesasOperacionais },
      { label: '  Pessoal / Folha', value: -despesasPessoal },
      { label: '  Aluguel', value: -despesasAluguel },
      { label: '  Utilities (água, luz, etc)', value: -despesasUtilidades },
      { label: '  Marketing', value: -despesasMarketing },
      { label: '  Administrativas', value: -despesasAdministrativas },
      { label: '  Outras Despesas', value: -outrasDespesas },
      { label: '(=) LUCRO OPERACIONAL', value: lucroOperacional, isSubtotal: true, percentage: receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0 },
      { label: '(+/-) Resultado Financeiro', value: resultadoFinanceiro },
      { label: '(=) LUCRO ANTES DO IR', value: lucroAntesIR, isSubtotal: true },
      { label: '(-) Provisão para IR', value: -provisaoIR },
      { label: '(=) LUCRO LÍQUIDO', value: lucroLiquido, isTotal: true, percentage: receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0 },
    ];

    return NextResponse.json({
      period: {
        type: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      dre: dreLines,
      summary: {
        receitaBruta,
        receitaLiquida,
        lucroBruto,
        lucroOperacional,
        lucroLiquido,
        margemBruta: receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0,
        margemOperacional: receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0,
        margemLiquida: receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error generating DRE report:', error);
    return NextResponse.json(
      { error: 'Failed to generate DRE report' },
      { status: 500 }
    );
  }
}
