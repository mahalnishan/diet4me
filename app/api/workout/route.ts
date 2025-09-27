import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

type WorkoutInputs = {
  age: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  fitnessLevel: FitnessLevel;
  equipment?: string[];
  goals?: string[];
  preferredDaysPerWeek?: number;
  timePerSessionMinutes?: number;
};

const PROMPT_TEMPLATE = `
Generate a 7-day, equipment-free workout plan aligned with Bryan Johnson’s Blueprint. Output ONLY a single markdown table sized 8×8 (header row + 7 day columns; left column = 7 row labels). No text outside the table.

Input fields (must use exact keys):
- age (integer; default 35)
- gender (male/female/other/unspecified; default unspecified)
- heightCm (integer; default 175)
- weightKg (integer; default 75)
- fitnessLevel (beginner / intermediate / advanced; default intermediate)
- goals (comma-separated: longevity, strength, fat_loss, endurance, mobility)
- healthFlags (optional comma-separated: pregnancy, cardiac_issue, recent_injury)

Hard rules:
1) Permitted exercise vocabulary: Push-ups, Squats, Plank, Walk, Stretch, HIIT.
2) Table structure:
   - Columns: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
   - Rows: Monday..Sunday as leftmost labels in bold (e.g., | **Monday** | ... )
   - Each cell = one line, entries comma-separated, format like "10 Push-ups, 15 Squats, 30s Plank, 20 min Walk, 10 min Stretch".
   - No "Rest" cells. Every day must include activity.
3) Daily Walk rule:
   - Every cell must include Walk.
   - Weekly Walk total ≥150 min unless mobility-first applies.
4) Scaling algorithm:
   - base_reps = beginner:5, intermediate:12, advanced:20
   - size_factor = clamp(1 - ((heightCm-175)/200) - ((weightKg-75)/300), 0.7, 1.2)
   - goal_modifier: strength=1.15, longevity=0.85, fat_loss=1.0, mobility=0.8, endurance=1.0
   - age_factor: <30=1.1, 30–50=1.0, 50–74=0.8, ≥75=0.6
   - reps = round(base_reps * size_factor * goal_modifier * age_factor)
   - plank_seconds = round({beginner:20, intermediate:30, advanced:45}[fitnessLevel] * age_factor)
   - walk_minutes/day target by goal: longevity 30–45, strength 20–30, fat_loss 30–45, endurance 30–45, mobility 20–30. Allocate across all days.
5) HIIT protocol (every day):
   - Add "HIIT 20s Work / 20s Rest × 8 rounds (4 min)" to every cell.
   - Beginners may use "20s Work / 40s Rest × 8 rounds (4 min)" if scaling down.
   - Modality: cycle ergometer, treadmill, track, bodyweight moves, or resistance exercises.
   - Walk must still be present in each cell.
6) Health overrides:
   - If age ≥75 OR healthFlags include pregnancy, cardiac_issue, recent_injury → mobility-first mode:
     • Only Walk (≤15 min), Plank (≤15s), Stretch  
     • No HIIT  
     • Weekly Walk ≤100 min
7) Output constraints:
   - Table only, no commentary, no extra rows/columns, no code fences around output.
   - Units: "s" for seconds (e.g., "30s Plank"), "min" for minutes (e.g., "20 min Walk").
   - Round all numbers to integers.
8) Defaults: If input missing, apply defaults and still produce table.

Return the plan as a valid 8×8 markdown table.
`;






function clampDays(preferred?: number, fitnessLevel: FitnessLevel = 'intermediate') {
  if (preferred && preferred >= 1 && preferred <= 7) return preferred;
  switch (fitnessLevel) {
    case 'beginner': return 3;
    case 'intermediate': return 5;
    case 'advanced': return 6;
  }
}

function pickExercises(equipment: string[] = [], useBodyweightFallback = true) {
  const has = (name: string) => equipment.map(e => e.toLowerCase()).includes(name);
  return {
    squat: has('barbell') ? 'Back Squat' : has('dumbbell') ? 'Goblet Squat' : (useBodyweightFallback ? 'Bodyweight Squat' : 'Goblet Squat'),
    hinge: has('barbell') ? 'Deadlift' : has('dumbbell') ? 'Romanian Deadlift (DB)' : 'Hip Hinge / Glute Bridge',
    press: has('barbell') ? 'Overhead Press' : has('dumbbell') ? 'Dumbbell Shoulder Press' : 'Pike Push-up/Incline Push-up',
    row: has('barbell') ? 'Barbell Row' : has('dumbbell') ? 'Single-arm DB Row' : 'Inverted Row/Seated Band Row',
    core: 'Plank variations',
    carry: has('kettlebell') ? 'Farmer Carry (KB)' : has('dumbbell') ? 'Farmer Carry (DB)' : 'Suitcase Carry (bag)'
  };
}

function buildPlan(inputs: WorkoutInputs) {
  const days = clampDays(inputs.preferredDaysPerWeek, inputs.fitnessLevel);
  const time = inputs.timePerSessionMinutes ?? (days >= 6 ? 60 : 45);
  const equip = inputs.equipment ?? [];
  const ex = pickExercises(equip);

  const weeklyPlan: Array<any> = [];
  const goalSet = (inputs.goals || []).map(g => g.toLowerCase());
  const focusLongevity = goalSet.includes('longevity') || goalSet.length === 0;

  // simple scheduling logic (Bryan-style) – strength + zone2 + HIIT + mobility
  const templateDays = [
    { name: 'Strength + Zone 2', type: 'strength+cardio' },
    { name: 'HIIT + Short Cardio', type: 'hiit' },
    { name: 'Strength + Mobility', type: 'strength+mobility' },
    { name: 'Conditioning Intervals', type: 'intervals' },
    { name: 'Full Body Strength + Stability', type: 'strength' },
    { name: 'Long Cardio / Mixed Modality', type: 'longcardio' },
    { name: 'Active Recovery / Mobility', type: 'recovery' }
  ];

  for (let i = 0; i < days; i++) {
    const td = templateDays[i % templateDays.length];
    let session: any = { dayIndex: i+1, title: td.name, estimatedMinutes: time };

    if (td.type === 'strength' || td.type === 'strength+cardio' || td.type === 'strength+mobility') {
      const sets = inputs.fitnessLevel === 'beginner' ? 2 : inputs.fitnessLevel === 'intermediate' ? 3 : 4;
      const repRange = inputs.fitnessLevel === 'beginner' ? '8-12' : '6-10';
      session.exercises = [
        { name: ex.squat, sets, reps: repRange },
        { name: ex.hinge, sets, reps: repRange },
        { name: ex.press, sets, reps: '6-12' },
        { name: ex.row, sets, reps: '6-12' },
        { name: ex.core, sets: 3, reps: '45-90s' }
      ];
      if (td.type === 'strength+cardio') {
        session.cardio = { type: focusLongevity ? 'Zone 2 steady state' : 'Moderate steady state', durationMinutes: Math.max(20, Math.floor(time/3)) };
      }
      if (td.type === 'strength+mobility') session.mobility = ['hips: 5-10 min', 'shoulders: 5-10 min', 'thoracic rotation'];
    } else if (td.type === 'hiit' || td.type === 'intervals') {
      session.warmup = '10 min general warmup & mobility';
      session.hiit = td.type === 'hiit' ? { format: '20s on / 40s off', rounds: inputs.fitnessLevel === 'beginner' ? 6 : 8 } : { format: '60s on / 60s off', rounds: 8 };
      session.extras = ['cooldown 10 min easy cardio & stretching'];
    } else if (td.type === 'longcardio') {
      session.activity = 'Long lower-intensity cardio (walk/bike/swim/hike)';
      session.durationMinutes = Math.min(120, Math.max(45, time + 30));
      session.notes = ['Keep effort conversational (Zone 2) — focus on duration and movement quality'];
    } else if (td.type === 'recovery') {
      session.activity = 'Active recovery: gentle yoga, mobility, short walk';
      session.durationMinutes = Math.min(60, time);
      session.notes = ['Prioritize sleep, hydration, and nutrition today'];
    }

    weeklyPlan.push(session);
  }

  // progress & scaling guidance
  const progressGuidelines = {
    progressiveOverload: 'Increase load, reps, or rounds every 1–3 weeks depending on recovery. Prefer small weekly increments (2.5–10%).',
    recovery: 'If sleep <6.5h or excessive soreness, convert a session to active recovery. Older athletes should bias toward extra mobility & lower-impact cardio.',
    sampleProgression: 'Beginner: build to consistent 3x/week strength for 6 weeks → add 1 HIIT and 1 longer cardio day. Intermediate/Advanced: increase sets, reduce rest, add technical lifts or tempo work.'
  };

  const mobilityAndRecovery = {
    daily: ['10 min joint mobility (shoulders/hips/spine)', 'Post-workout stretching 5–10 min', '1x weekly longer mobility session 20–40 min'],
    sleepRecommendation: '7–9 hours nightly if possible',
  };

  const scalingNotes = {
    forOlderAdults: 'Reduce HIIT volume, prefer low-impact intervals (bike/row). Emphasize balance and joint-friendly strength (single-leg, controlled tempo).',
    forHigherBodyWeight: 'Reduce impact; prioritize cycling/rowing/swimming and controlled strength. Use easier plyometrics or skip them initially.',
    forTallerIndividuals: 'Be mindful of range of motion on squats/deadlifts — cue hips-back and consider variations to protect lumbar spine.'
  };

  const summary = {
    description: 'Bryan Johnson–inspired balanced weekly plan emphasizing consistency, strength, cardio variety, mobility, and recovery. Scalable by fitness level and equipment.',
    daysPerWeek: days,
    minutesPerSession: time
  };

  return { summary, weeklyPlan, progressGuidelines, mobilityAndRecovery, scalingNotes };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<WorkoutInputs>;
    
    if (!body || typeof body.fitnessLevel !== 'string' || typeof body.age !== 'number') {
      return NextResponse.json(
        { error: 'Invalid body. Required: age (number), fitnessLevel ("beginner"|"intermediate"|"advanced"). Optional: gender, heightCm, weightKg, equipment (string[]), goals (string[]), preferredDaysPerWeek, timePerSessionMinutes.' },
        { status: 400 }
      );
    }

    const inputs: WorkoutInputs = {
      age: body.age,
      gender: body.gender,
      heightCm: body.heightCm,
      weightKg: body.weightKg,
      fitnessLevel: body.fitnessLevel as FitnessLevel,
      equipment: body.equipment ?? [],
      goals: body.goals ?? [],
      preferredDaysPerWeek: body.preferredDaysPerWeek,
      timePerSessionMinutes: body.timePerSessionMinutes
    };

    // Build human-readable prompt
          const prompt = PROMPT_TEMPLATE
            .replace('{{age}}', String(inputs.age))
            .replace('{{gender}}', String(inputs.gender ?? 'unspecified'))
            .replace('{{heightCm}}', String(inputs.heightCm ?? 'unspecified'))
            .replace('{{weightKg}}', String(inputs.weightKg ?? 'unspecified'))
            .replace('{{fitnessLevel}}', inputs.fitnessLevel)
            .replace('{{goals}}', JSON.stringify(inputs.goals));

    // Generate workout plan using Gemini
    const model = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const { text } = await generateText({
      model: model('gemini-2.0-flash'),
      prompt: prompt,
      temperature: 0.7,
    });

    return NextResponse.json({ 
      content: text 
    });

  } catch (error: any) {
    console.error('Workout generation error:', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}
