import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, pointsHistory, pointsRules, badges, achievements } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// Point actions and their default values
const DEFAULT_POINTS: Record<string, number> = {
  session_completed: 50,
  exercise_done: 10,
  streak_7_days: 100,
  streak_30_days: 500,
  assessment_completed: 30,
  referral: 200,
  review_posted: 75,
  early_arrival: 15,
  perfect_attendance_month: 150,
};

// POST /api/gamification/award-points - Award points to a patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, action, points, reason, sourceId, metadata } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    // Calculate points: use provided points or look up by action
    let pointsToAward = points;
    let pointSource = reason || 'manual';

    if (!pointsToAward && action) {
      // Try to get points from rules table
      const rule = await db.query.pointsRules.findFirst({
        where: eq(pointsRules.action, action),
      });

      if (rule) {
        pointsToAward = rule.points;
        pointSource = rule.description || action;
      } else {
        // Use default points
        pointsToAward = DEFAULT_POINTS[action] || 10;
        pointSource = action;
      }
    }

    if (!pointsToAward || pointsToAward <= 0) {
      return NextResponse.json(
        { error: 'Invalid points value' },
        { status: 400 }
      );
    }

    // Get current patient data
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const currentPoints = patient.totalPoints || 0;
    const newPoints = currentPoints + pointsToAward;
    const currentStreak = patient.currentStreak || 0;

    // Calculate new level based on points
    const newLevel = calculateLevel(newPoints);
    const currentLevel = calculateLevel(currentPoints);
    const leveledUp = newLevel > currentLevel;

    // Update patient points and streak
    await db.update(patients)
      .set({
        totalPoints: newPoints,
        lastActiveDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientId));

    // Record in points history
    await db.insert(pointsHistory).values({
      patientId,
      points: pointsToAward,
      source: action || 'manual',
      sourceId: sourceId || null,
      description: pointSource,
      metadata: metadata || null,
    });

    // Check for new achievements/badges
    const newAchievements = await checkAndAwardAchievements(patientId, newPoints, currentStreak, action);

    // Invalidate cache
    await invalidatePattern(`gamification:${patientId}:*`);
    await invalidatePattern('gamification:leaderboard:*');

    return NextResponse.json({
      success: true,
      patientId,
      previousPoints: currentPoints,
      pointsAwarded: pointsToAward,
      newTotalPoints: newPoints,
      reason: pointSource,
      level: newLevel,
      leveledUp,
      newAchievements,
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}

// Calculate level based on points
function calculateLevel(points: number): number {
  // Level thresholds
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Check and award achievements based on actions and milestones
async function checkAndAwardAchievements(
  patientId: string,
  totalPoints: number,
  currentStreak: number,
  action?: string
): Promise<string[]> {
  const awarded: string[] = [];

  // Get all possible badges
  const allBadges = await db.query.badges.findMany({
    where: eq(badges.isActive, true),
  });

  // Get patient's current achievements
  const currentAchievements = await db.query.achievements.findMany({
    where: eq(achievements.patientId, patientId),
  });

  const earnedBadgeIds = new Set(currentAchievements.map(a => a.badgeId));

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let earned = false;

    // Check criteria based on badge type
    if (badge.criteria) {
      const criteria = badge.criteria as any;

      // Points-based badges
      if (criteria.minPoints && totalPoints >= criteria.minPoints) {
        earned = true;
      }

      // Streak-based badges
      if (criteria.minStreak && currentStreak >= criteria.minStreak) {
        earned = true;
      }

      // Action-based badges
      if (criteria.action && action === criteria.action) {
        // Check count if needed
        if (criteria.count) {
          const actionCount = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(pointsHistory)
            .where(eq(pointsHistory.patientId, patientId));
          
          if (actionCount[0]?.count >= criteria.count) {
            earned = true;
          }
        } else {
          earned = true;
        }
      }
    }

    if (earned) {
      // Award the badge
      await db.insert(achievements).values({
        patientId,
        badgeId: badge.id,
        earnedAt: new Date(),
      });

      awarded.push(badge.name);
    }
  }

  return awarded;
}

// GET - Get available point actions and their values
export async function GET() {
  try {
    // Get custom rules from database
    const customRules = await db.query.pointsRules.findMany({
      where: eq(pointsRules.isActive, true),
    });

    // Merge with defaults
    const rules: Record<string, { points: number; description: string }> = {};

    // Add defaults
    for (const [action, points] of Object.entries(DEFAULT_POINTS)) {
      rules[action] = {
        points,
        description: formatActionDescription(action),
      };
    }

    // Override with custom rules
    for (const rule of customRules) {
      rules[rule.action] = {
        points: rule.points,
        description: rule.description || formatActionDescription(rule.action),
      };
    }

    return NextResponse.json({
      rules,
      levelThresholds: [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000],
    });
  } catch (error) {
    console.error('Error fetching point rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch point rules' },
      { status: 500 }
    );
  }
}

function formatActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    session_completed: 'Sessão de fisioterapia concluída',
    exercise_done: 'Exercício domiciliar realizado',
    streak_7_days: 'Sequência de 7 dias consecutivos',
    streak_30_days: 'Sequência de 30 dias consecutivos',
    assessment_completed: 'Avaliação funcional realizada',
    referral: 'Indicação de novo paciente',
    review_posted: 'Avaliação positiva publicada',
    early_arrival: 'Chegou no horário',
    perfect_attendance_month: 'Presença perfeita no mês',
  };

  return descriptions[action] || action.replace(/_/g, ' ');
}
