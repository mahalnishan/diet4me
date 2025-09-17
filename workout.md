// route.workout.ts
// Next.js-style API route (TypeScript) that accepts inputs needed to create a Bryan Johnson–style workout plan
// and returns a structured workout plan JSON. Also contains a reusable prompt template string that summarizes
// the inputs for use with an LLM or logging.

import { NextApiRequest, NextApiResponse } from 'next'

type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

type WorkoutInputs = {
  age: number
  gender?: string
  heightCm?: number
  weightKg?: number
  fitnessLevel: FitnessLevel
  equipment?: string[] // e.g. ['barbell','dumbbell','kettlebell','bike','rower'] or []
  goals?: string[] // e.g. ['longevity','fat_loss','muscle_gain','endurance']
  preferredDaysPerWeek?: number // 1-7, recommended based on fitnessLevel if omitted
  timePerSessionMinutes?: number // target session length
}

const PROMPT_TEMPLATE = `Create a Bryan Johnson–style workout plan. Use the inputs below and produce a weekly plan with daily sessions, intensity, exercises (with sets/reps or durations), recovery guidance, mobility work, and progressive overload suggestions. Also include scaling notes for age, weight, and equipment availability.

Inputs:
- Age: {{age}}
- Gender: {{gender}}
- Height (cm): {{heightCm}}
- Weight (kg): {{weightKg}}
- Fitness level: {{fitnessLevel}}
- Equipment: {{equipment}}
- Goals: {{goals}}
- Preferred days/week: {{preferredDaysPerWeek}}
- Time per session (min): {{timePerSessionMinutes}}

Output format: JSON with keys: summary, weeklyPlan (array of 7 day objects or N days), progressGuidelines, mobilityAndRecovery, scalingNotes.
`

function clampDays(preferred?: number, fitnessLevel: FitnessLevel = 'intermediate') {
  if (preferred && preferred >= 1 && preferred <= 7) return preferred
  switch (fitnessLevel) {
    case 'beginner': return 3
    case 'intermediate': return 5
    case 'advanced': return 6
  }
}

function pickExercises(equipment: string[] = [], useBodyweightFallback = true) {
  const has = (name: string) => equipment.map(e => e.toLowerCase()).includes(name)
  return {
    squat: has('barbell') ? 'Back Squat' : has('dumbbell') ? 'Goblet Squat' : (useBodyweightFallback ? 'Bodyweight Squat' : 'Goblet Squat'),
    hinge: has('barbell') ? 'Deadlift' : has('dumbbell') ? 'Romanian Deadlift (DB)' : 'Hip Hinge / Glute Bridge',
    press: has('barbell') ? 'Overhead Press' : has('dumbbell') ? 'Dumbbell Shoulder Press' : 'Pike Push-up/Incline Push-up',
    row: has('barbell') ? 'Barbell Row' : has('dumbbell') ? 'Single-arm DB Row' : 'Inverted Row/Seated Band Row',
    core: 'Plank variations',
    carry: has('kettlebell') ? 'Farmer Carry (KB)' : has('dumbbell') ? 'Farmer Carry (DB)' : 'Suitcase Carry (bag)'
  }
}

function buildPlan(inputs: WorkoutInputs) {
  const days = clampDays(inputs.preferredDaysPerWeek, inputs.fitnessLevel)
  const time = inputs.timePerSessionMinutes ?? (days >= 6 ? 60 : 45)
  const equip = inputs.equipment ?? []
  const ex = pickExercises(equip)

  const weeklyPlan: Array<any> = []
  const goalSet = (inputs.goals || []).map(g => g.toLowerCase())
  const focusLongevity = goalSet.includes('longevity') || goalSet.length === 0

  // simple scheduling logic (Bryan-style) – strength + zone2 + HIIT + mobility
  const templateDays = [
    { name: 'Strength + Zone 2', type: 'strength+cardio' },
    { name: 'HIIT + Short Cardio', type: 'hiit' },
    { name: 'Strength + Mobility', type: 'strength+mobility' },
    { name: 'Conditioning Intervals', type: 'intervals' },
    { name: 'Full Body Strength + Stability', type: 'strength' },
    { name: 'Long Cardio / Mixed Modality', type: 'longcardio' },
    { name: 'Active Recovery / Mobility', type: 'recovery' }
  ]

  for (let i = 0; i < days; i++) {
    const td = templateDays[i % templateDays.length]
    let session: any = { dayIndex: i+1, title: td.name, estimatedMinutes: time }

    if (td.type === 'strength' || td.type === 'strength+cardio' || td.type === 'strength+mobility') {
      const sets = inputs.fitnessLevel === 'beginner' ? 2 : inputs.fitnessLevel === 'intermediate' ? 3 : 4
      const repRange = inputs.fitnessLevel === 'beginner' ? '8-12' : '6-10'
      session.exercises = [
        { name: ex.squat, sets, reps: repRange },
        { name: ex.hinge, sets, reps: repRange },
        { name: ex.press, sets, reps: '6-12' },
        { name: ex.row, sets, reps: '6-12' },
        { name: ex.core, sets: 3, reps: '45-90s' }
      ]
      if (td.type === 'strength+cardio') {
        session.cardio = { type: focusLongevity ? 'Zone 2 steady state' : 'Moderate steady state', durationMinutes: Math.max(20, Math.floor(time/3)) }
      }
      if (td.type === 'strength+mobility') session.mobility = ['hips: 5-10 min', 'shoulders: 5-10 min', 'thoracic rotation']
    } else if (td.type === 'hiit' || td.type === 'intervals') {
      session.warmup = '10 min general warmup & mobility'
      session.hiit = td.type === 'hiit' ? { format: '20s on / 40s off', rounds: inputs.fitnessLevel === 'beginner' ? 6 : 8 } : { format: '60s on / 60s off', rounds: 8 }
      session.extras = ['cooldown 10 min easy cardio & stretching']
    } else if (td.type === 'longcardio') {
      session.activity = 'Long lower-intensity cardio (walk/bike/swim/hike)'
      session.durationMinutes = Math.min(120, Math.max(45, time + 30))
      session.notes = ['Keep effort conversational (Zone 2) — focus on duration and movement quality']
    } else if (td.type === 'recovery') {
      session.activity = 'Active recovery: gentle yoga, mobility, short walk'
      session.durationMinutes = Math.min(60, time)
      session.notes = ['Prioritize sleep, hydration, and nutrition today']
    }

    weeklyPlan.push(session)
  }

  // progress & scaling guidance
  const progressGuidelines = {
    progressiveOverload: 'Increase load, reps, or rounds every 1–3 weeks depending on recovery. Prefer small weekly increments (2.5–10%).',
    recovery: 'If sleep <6.5h or excessive soreness, convert a session to active recovery. Older athletes should bias toward extra mobility & lower-impact cardio.',
    sampleProgression: 'Beginner: build to consistent 3x/week strength for 6 weeks → add 1 HIIT and 1 longer cardio day. Intermediate/Advanced: increase sets, reduce rest, add technical lifts or tempo work.'
  }

  const mobilityAndRecovery = {
    daily: ['10 min joint mobility (shoulders/hips/spine)', 'Post-workout stretching 5–10 min', '1x weekly longer mobility session 20–40 min'],
    sleepRecommendation: '7–9 hours nightly if possible',
  }

  const scalingNotes = {
    forOlderAdults: 'Reduce HIIT volume, prefer low-impact intervals (bike/row). Emphasize balance and joint-friendly strength (single-leg, controlled tempo).',
    forHigherBodyWeight: 'Reduce impact; prioritize cycling/rowing/swimming and controlled strength. Use easier plyometrics or skip them initially.',
    forTallerIndividuals: 'Be mindful of range of motion on squats/deadlifts — cue hips-back and consider variations to protect lumbar spine.'
  }

  const summary = {
    description: 'Bryan Johnson–inspired balanced weekly plan emphasizing consistency, strength, cardio variety, mobility, and recovery. Scalable by fitness level and equipment.',
    daysPerWeek: days,
    minutesPerSession: time
  }

  return { summary, weeklyPlan, progressGuidelines, mobilityAndRecovery, scalingNotes }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' })

  try {
    const body = req.body as Partial<WorkoutInputs>
    if (!body || typeof body.fitnessLevel !== 'string' || typeof body.age !== 'number') {
      return res.status(400).json({ error: 'Invalid body. Required: age (number), fitnessLevel ("beginner"|"intermediate"|"advanced"). Optional: gender, heightCm, weightKg, equipment (string[]), goals (string[]), preferredDaysPerWeek, timePerSessionMinutes.' })
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
    }

    // Build human-readable prompt (useful if you plan to send to an LLM)
    const prompt = PROMPT_TEMPLATE
      .replace('{{age}}', String(inputs.age))
      .replace('{{gender}}', String(inputs.gender ?? 'unspecified'))
      .replace('{{heightCm}}', String(inputs.heightCm ?? 'unspecified'))
      .replace('{{weightKg}}', String(inputs.weightKg ?? 'unspecified'))
      .replace('{{fitnessLevel}}', inputs.fitnessLevel)
      .replace('{{equipment}}', JSON.stringify(inputs.equipment))
      .replace('{{goals}}', JSON.stringify(inputs.goals))
      .replace('{{preferredDaysPerWeek}}', String(inputs.preferredDaysPerWeek ?? 'auto'))
      .replace('{{timePerSessionMinutes}}', String(inputs.timePerSessionMinutes ?? 'auto'))

    const plan = buildPlan(inputs)

    return res.status(200).json({ prompt, plan })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? String(err) })
  }
}
