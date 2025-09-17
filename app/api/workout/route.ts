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

const PROMPT_TEMPLATE = `Create a simple, personalized workout plan based on the user's profile. Use basic exercises that anyone can do at home with no equipment, but adjust the intensity and focus based on their specific profile.

User Profile:
- Age: {{age}}
- Gender: {{gender}}
- Height (cm): {{heightCm}}
- Weight (kg): {{weightKg}}
- Fitness level: {{fitnessLevel}}
- Goals: {{goals}}

PERSONALIZATION RULES:
- **Age**: Younger users (under 30) can handle slightly more reps, older users (50+) should focus more on mobility and lighter intensity
- **Gender**: Consider different body compositions and typical strength levels
- **Height/Weight**: Adjust rep counts based on body size (taller/heavier = fewer reps, shorter/lighter = more reps)
- **Fitness Level**: 
  - Beginner: 3-8 reps, 5-15 min sessions
  - Intermediate: 8-15 reps, 15-25 min sessions  
  - Advanced: 15-25 reps, 25-35 min sessions
- **Goals**: Focus exercises on their specific goals (strength = more push-ups/squats, endurance = more walking, mobility = more stretching)

IMPORTANT: Format the weekly plan as a simple markdown table with days as both column headers and row labels. The table should have:
- Days of the week as column headers (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- Days of the week as row labels on the left side
- Each cell should contain ONLY: Simple exercises with personalized rep counts and durations
- Use ONLY basic bodyweight exercises: Push-ups, Squats, Planks, Walking, Stretching
- Keep descriptions very short and simple
- NO complicated exercises or gym equipment needed

Example table format:
| | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday |
|---|---|---|---|---|---|---|---|
| **Monday** | 8 Push-ups, 12 Squats, 25 sec Plank | 20 min Walk | 10 min Stretching | 8 Push-ups, 12 Squats, 25 sec Plank | 20 min Walk | 10 min Stretching | Rest Day |
| **Tuesday** | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 10 min Stretching | 8 Push-ups, 12 Squats, 25 sec Plank | 20 min Walk | 10 min Stretching | Rest Day |
| **Wednesday** | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 8 Push-ups, 12 Squats, 25 sec Plank | 20 min Walk | 10 min Stretching | Rest Day |
| **Thursday** | 8 Push-ups, 12 Squats, 25 sec Plank | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 20 min Walk | 10 min Stretching | Rest Day |
| **Friday** | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 10 min Stretching | Rest Day |
| **Saturday** | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | Rest Day |
| **Sunday** | Rest Day | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank | 10 min Stretching | 20 min Walk | 8 Push-ups, 12 Squats, 25 sec Plank |

PERSONALIZATION EXAMPLES:
- **Beginner + Young**: 5-8 reps, 10-15 min sessions
- **Beginner + Older**: 3-5 reps, 5-10 min sessions, more stretching
- **Intermediate + Male**: 10-15 reps, 15-25 min sessions
- **Intermediate + Female**: 8-12 reps, 15-20 min sessions
- **Advanced + Young**: 15-25 reps, 25-35 min sessions
- **Goals**: longevity = more walking/stretching, strength = more push-ups/squats, fat_loss = more walking, muscle_gain = more push-ups/squats

Please provide a simple but personalized workout plan that matches their profile.`;

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
