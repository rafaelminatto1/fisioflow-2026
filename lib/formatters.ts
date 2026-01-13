/**
 * Formata uma data no formato DD/MM/YYYY para o formato estendido em português
 * @param dateStr - Data no formato DD/MM/YYYY
 * @returns Data formatada (ex: "12 de janeiro de 2026")
 */
export function formatDateBr(dateStr: string | Date): string {
  try {
    if (dateStr instanceof Date) {
      return dateStr.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }

    // Handle DD/MM/YYYY format
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) {
      return dateStr;
    }

    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Formata uma data no formato abreviado DD/MM
 * @param dateStr - Data no formato DD/MM/YYYY
 * @returns Data abreviada (ex: "12/01")
 */
export function formatDateShort(dateStr: string): string {
  try {
    const parts = dateStr.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Retorna a cor da classe CSS baseada na intensidade da dor EVA
 * @param score - Pontuação EVA (0-10)
 * @returns Classes CSS para cor
 */
export function getEvaColorClasses(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'text-slate-400 bg-slate-50 dark:bg-slate-900/20';
  }
  if (score >= 8) {
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  }
  if (score >= 5) {
    return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
  }
  if (score >= 3) {
    return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
  }
  return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
}

/**
 * Retorna a cor do texto baseada na intensidade da dor EVA
 * @param score - Pontuação EVA (0-10)
 * @returns Classe CSS para cor do texto
 */
export function getEvaTextColor(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'text-slate-400';
  }
  if (score >= 8) {
    return 'text-red-600';
  }
  if (score >= 5) {
    return 'text-amber-600';
  }
  if (score >= 3) {
    return 'text-yellow-600';
  }
  return 'text-emerald-600';
}

/**
 * Retorna a descrição do tipo de tendência da dor
 * @param current - Pontuação atual
 * @param previous - Pontuação anterior
 * @returns Tipo de tendência
 */
export function getEvaTrend(current: number | null | undefined, previous: number | null | undefined): 'improved' | 'worsened' | 'stable' | null {
  if (previous === null || previous === undefined || current === null || current === undefined) {
    return null;
  }
  if (current < previous) return 'improved';
  if (current > previous) return 'worsened';
  return 'stable';
}

/**
 * Calcula a média dos valores EVA, ignorando valores nulos
 * @param sessions - Array de sessões com evaScore
 * @returns Média arredondada para 1 casa decimal ou null
 */
export function calculateAvgEva(sessions: Array<{ evaScore?: number | null }>): number | null {
  const validScores = sessions.filter(s => s.evaScore !== null && s.evaScore !== undefined);
  if (validScores.length === 0) return null;

  const sum = validScores.reduce((acc, s) => acc + (s.evaScore || 0), 0);
  return Math.round((sum / validScores.length) * 10) / 10;
}

/**
 * Formata o tamanho do arquivo em KB/MB
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formata duração em minutos para formato legível
 * @param minutes - Duração em minutos
 * @returns String formatada (ex: "1h 30min")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

/**
 * Trunca texto com reticências
 * @param text - Texto original
 * @param maxLength - Comprimento máximo
 * @returns Texto truncado
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formata número de telefone brasileiro
 * @param phone - Telefone (com ou sem formatação)
 * @returns Telefone formatado
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

/**
 * Valida CPF
 * @param cpf - CPF (com ou sem formatação)
 * @returns True se CPF válido
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;

  return digit === parseInt(cleaned.charAt(10));
}
