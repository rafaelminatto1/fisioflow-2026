
'use server';

import { GoogleGenAI } from "@google/genai";
import { KPI } from '../../types';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

/**
 * Gera texto simples via Gemini (Server Side)
 */
export async function generateText(prompt: string, model: string = 'gemini-3-flash-preview') {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return { error: 'Chave de API não configurada no servidor.' };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return { text: response.text };
  } catch (error: any) {
    console.error("AI Text Error:", error);
    return { error: 'Falha ao gerar resposta da IA.' };
  }
}

/**
 * Gera JSON estruturado via Gemini (Server Side)
 */
export async function generateJSON(prompt: string, model: string = 'gemini-3-flash-preview') {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return { error: 'Chave de API não configurada no servidor.' };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text || '{}';
    const cleanJson = text.replace(/```json|```/g, '').trim();
    
    return { data: JSON.parse(cleanJson) };
  } catch (error: any) {
    console.error("AI JSON Error:", error);
    return { error: 'Falha ao processar dados estruturados da IA.' };
  }
}

/**
 * Análise Específica: Relatório Executivo (CFO Virtual)
 */
export async function generateExecutiveAnalysis(context: any) {
  const prompt = `Atue como um CFO e Diretor Clínico Sênior de uma rede de clínicas de fisioterapia. 
  Analise os seguintes dados financeiros e operacionais: ${JSON.stringify(context)}.
  
  Gere um relatório executivo curto (máx 3 parágrafos) contendo:
  1. 💰 **Veredito Financeiro**: Analise a margem de lucro e eficiência das despesas.
  2. ⚙️ **Eficiência Operacional**: Comente sobre a taxa de ocupação ou sucesso clínico.
  3. 🚀 **Ação Tática**: Uma recomendação clara e acionável para a próxima semana.
  
  Use formatação Markdown com negrito para destaques. Mantenha um tom profissional, direto e estratégico.`;

  return generateText(prompt);
}

/**
 * Análise Específica: Insight Rápido do Dashboard
 */
export async function generateDashboardInsight(kpis: KPI[]) {
  const kpiSummary = kpis.map(k => `${k.title}: ${k.value} (${k.trend}% tnd)`).join(', ');
  const prompt = `Atue como um consultor de negócios sênior.
  Dados atuais da clínica: ${kpiSummary}.
  
  Gere UM insight estratégico curto e impactante (máximo 25 palavras) para o dono da clínica ler e agir amanhã.
  Foque em oportunidades de receita ou correção de gargalos.`;

  return generateText(prompt);
}
