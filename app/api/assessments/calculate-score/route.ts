import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface ScoreResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  interpretation: string;
  breakdown: {
    section: string;
    score: number;
    maxScore: number;
  }[];
}

// Standard scoring interpretations
function interpretScore(percentage: number, templateName?: string): string {
  // Special interpretations for known assessment types
  if (templateName?.toLowerCase().includes('eva') || templateName?.toLowerCase().includes('dor')) {
    if (percentage <= 30) return 'Dor leve';
    if (percentage <= 60) return 'Dor moderada';
    if (percentage <= 80) return 'Dor intensa';
    return 'Dor muito intensa';
  }

  if (templateName?.toLowerCase().includes('funcional')) {
    if (percentage >= 90) return 'Excelente capacidade funcional';
    if (percentage >= 70) return 'Boa capacidade funcional';
    if (percentage >= 50) return 'Capacidade funcional moderada';
    if (percentage >= 30) return 'Capacidade funcional limitada';
    return 'Capacidade funcional muito limitada';
  }

  if (templateName?.toLowerCase().includes('qualidade')) {
    if (percentage >= 80) return 'Alta qualidade de vida';
    if (percentage >= 60) return 'Qualidade de vida moderada';
    if (percentage >= 40) return 'Qualidade de vida baixa';
    return 'Qualidade de vida muito baixa';
  }

  // Generic interpretation
  if (percentage >= 80) return 'Resultado excelente';
  if (percentage >= 60) return 'Resultado bom';
  if (percentage >= 40) return 'Resultado moderado';
  if (percentage >= 20) return 'Resultado abaixo do esperado';
  return 'Resultado requer atenção';
}

// POST /api/assessments/calculate-score - Calculate score for assessment answers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { templateId, answers } = body;

    if (!templateId || !answers) {
      return NextResponse.json(
        { error: 'templateId and answers are required' },
        { status: 400 }
      );
    }

    // Get template details
    const template = await db.query.assessmentTemplates.findFirst({
      where: eq(assessmentTemplates.id, templateId),
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse questions from template
    const questions = template.questions as any[];
    const scoringMethod = template.scoringMethod || 'sum';
    const maxScore = template.maxScore || 100;

    // Calculate scores by section/step
    const breakdown: { section: string; score: number; maxScore: number }[] = [];
    let totalScore = 0;
    let totalMaxScore = 0;
    let numericAnswerCount = 0;

    // Process each question
    for (const question of questions) {
      const answer = answers[question.id];
      let questionScore = 0;
      let questionMaxScore = question.maxScore || 10;

      if (answer !== undefined && answer !== null) {
        if (typeof answer === 'number') {
          questionScore = answer;
          numericAnswerCount++;
        } else if (typeof answer === 'string' && question.options) {
          // For select questions, find the option index as score
          const optionIndex = question.options.indexOf(answer);
          if (optionIndex !== -1) {
            questionScore = optionIndex;
            questionMaxScore = question.options.length - 1;
          }
        } else if (typeof answer === 'boolean') {
          questionScore = answer ? 1 : 0;
          questionMaxScore = 1;
        }
      }

      // Group by step/section if available
      const section = question.step || question.section || 'Geral';
      const existingSection = breakdown.find(b => b.section === section);
      
      if (existingSection) {
        existingSection.score += questionScore;
        existingSection.maxScore += questionMaxScore;
      } else {
        breakdown.push({
          section,
          score: questionScore,
          maxScore: questionMaxScore,
        });
      }

      totalScore += questionScore;
      totalMaxScore += questionMaxScore;
    }

    // Apply scoring method
    let finalScore = totalScore;
    
    if (scoringMethod === 'average' && numericAnswerCount > 0) {
      finalScore = Math.round(totalScore / numericAnswerCount);
    } else if (scoringMethod === 'percentage') {
      finalScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    } else if (scoringMethod === 'normalized') {
      // Normalize to maxScore
      finalScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * maxScore) : 0;
    }

    // Calculate percentage
    const percentage = totalMaxScore > 0 
      ? Math.round((totalScore / totalMaxScore) * 100) 
      : 0;

    const result: ScoreResult = {
      totalScore: finalScore,
      maxPossibleScore: maxScore,
      percentage,
      interpretation: interpretScore(percentage, template.name),
      breakdown,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating assessment score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
