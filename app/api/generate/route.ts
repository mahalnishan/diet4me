import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

type GenerateBody = {
  age: number;
  height: number;
  weight: number;
  bmi: string | null;
  bmiCategory: string | null;
  activityLevel: string;
  healthConditions: string[];
  dietPreference: string;
  fileUploaded: boolean;
  fileName: string | null;
  goal: string;
  allergens: string[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateBody;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const prompt = [
      `You are a certified nutritionist generating a personalized, safe, and practical 7-day diet plan.`,
      `User inputs:`,
      `- Age: ${body.age}`,
      `- Height: ${body.height} cm`,
      `- Weight: ${body.weight} kg`,
      [
        `- BMI: ${body.bmi ?? "N/A"}`,
        `- BMI Cat: ${body.bmiCategory ?? "N/A"}`,
        `- Act. Level: ${body.activityLevel ?? "moderate"}`,
        `- Health Cond.: ${body.healthConditions?.length ? body.healthConditions.join(", ") : "None"}`,
        `- Diet: ${body.dietPreference ?? "None"}`,
        `- Goal: ${body.goal ?? "General fitness"}`,
        `- Allergens: ${body.allergens?.length ? body.allergens.join(", ") : "None"}`,
        `- File: ${body.fileUploaded ? `Yes (${body.fileName ?? "unknown"})` : "No"}`,
        `\nRequirements:`,
        `- Create a 7-day meal plan as ONLY a markdown table (see format below).`,
        `- Each full day must total ~2250 kcal (±5%).`,
        `- Split calories realistically: Breakfast ~25%, Lunch ~30%, Dinner ~30%, Snacks ~15%.`,
        `- Tailor to activity level, goal, health conditions, allergens, and diet preference.`,
        `- Each table cell: meal name + short note (max 12 words).`,
        `- Include daily hydration guidance (volume or simple rule).`,
        `${body.dietPreference === "Blueprint" ? `\nBlueprint Guidelines: plant-forward, nutrient-dense; use veg (broccoli, spinach, sweet potato, zucchini), legumes (lentils, chickpeas), healthy fats (olive oil, nuts, seeds), berries, spices (turmeric, ginger), plant milks. Emphasize anti-inflammatory choices.` : ""}`,
        `${body.dietPreference === "Indian" ? `\nIndian Guidelines: prefer Indian meal patterns; include legumes, whole grains (millets, brown rice), paneer/tofu, seasonal fruits; keep spice moderate and portions balanced.` : ""}`,
        `\nFormat your response as ONLY this table structure:`,
        `| Meal | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |`,
        `|------|-------|-------|-------|-------|-------|-------|-------|`,
        `| Breakfast | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] |`,
        `| Lunch | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] |`,
        `| Dinner | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] |`,
        `| Snack | [snack] | [snack] | [snack] | [snack] | [snack] | [snack] | [snack] |`,
        `| Hydration | [hydration] | [hydration] | [hydration] | [hydration] | [hydration] | [hydration] | [hydration] |`,
        `\nDo not include any other text, headers, or sections. Just the table.`
      ]         
    ].join("\n");

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const model = google('gemini-2.0-flash');

    const result = await streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}




