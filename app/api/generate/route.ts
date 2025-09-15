import { NextRequest, NextResponse } from "next/server";

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
      `- BMI: ${body.bmi || "N/A"}`,
      `- BMI Category: ${body.bmiCategory || "N/A"}`,
      `- Activity Level: ${body.activityLevel}`,
      `- Health Conditions: ${body.healthConditions.join(", ")}`,
      `- Diet Preference: ${body.dietPreference}`,
      `- File Uploaded: ${body.fileUploaded ? `Yes (${body.fileName ?? "unknown"})` : "No"}`,
      `\nRequirements:`,
      `- Create a comprehensive 7-day meal plan.`,
      `- Return ONLY a markdown table with the meal plan.`,
      `- Tailor meals to activity level.`,
      `- Respect health conditions and diet preference.`,
      `- Include hydration guidance for each day.`,
      `${body.dietPreference === "Blueprint" ? `\nBlueprint Diet Guidelines:` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Focus on plant-based, nutrient-dense foods with comprehensive ingredient variety` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Use vegetables: broccoli, cauliflower, shiitake mushrooms, red cabbage, zucchini, sweet potatoes, spinach, carrots, sugar snap peas, mung bean sprouts` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Include legumes: black lentils, red lentils, chickpeas, cooked lentils` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Use healthy fats: extra virgin olive oil, hemp seeds, walnuts, macadamia nuts, almonds` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Incorporate fruits: blueberries, strawberries, pomegranate arils, dark cherries, lime juice` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Add seeds: chia seeds, ground flax, hemp seeds` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Use spices: turmeric, cumin, ginger, garlic, cinnamon, paprika, black pepper, salt` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Include herbs: fresh mint, cilantro, parsley, rosemary, thyme` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Add condiments: balsamic vinegar, apple cider vinegar, maple syrup, vanilla extract` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Use plant milks: almond milk, macadamia nut milk, coconut milk` : ""}`,
      `${body.dietPreference === "Blueprint" ? `- Emphasize anti-inflammatory and longevity-promoting ingredients` : ""}`,
        `${body.dietPreference === "Indian" ? `\nIndian Plan Guidelines:` : ""}`,
        `${body.dietPreference === "Indian" ? `- Prefer Indian meal patterns (breakfast, lunch, dinner, snack) with regional variety and commonly available dishes.` : ""}`,
        `${body.dietPreference === "Indian" ? `- Keep dishes balanced and practical (e.g., poha/upma/chilla, dal-roti, rajma/chole, khichdi, idli/dosa, curd/chaas, seasonal fruits).` : ""}`,
        `${body.dietPreference === "Indian" ? `- Keep spice levels moderate and note whole grains (millets, brown rice), legumes, paneer/tofu, and healthy oils.` : ""}`,
        `${body.dietPreference === "Indian" ? `- For inspiration, align with reputable Indian recipe collections (e.g., Fitelo recipes) while keeping nutrition-first and portion-aware.` : ""}`,
      `\nFormat your response as ONLY this table structure:`,
      `| Meal | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |`,
      `|------|-------|-------|-------|-------|-------|-------|-------|`,
      `| Breakfast | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] |`,
      `| Lunch | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] |`,
      `| Dinner | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] | [meal] |`,
      `| Snack | [snack] | [snack] | [snack] | [snack] | [snack] | [snack] | [snack] |`,
      `| Hydration | [hydration] | [hydration] | [hydration] | [hydration] | [hydration] | [hydration] | [hydration] |`,
      `\nDo not include any other text, headers, or sections. Just the table.`,
    ].join("\n");

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${text}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const contentText = extractGeminiText(data) ?? "";

    // Note: Analytics tracking removed temporarily to fix 500 errors
    // TODO: Implement proper analytics tracking without blocking the main request

    return NextResponse.json({ content: contentText });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

function extractGeminiText(data: any): string | null {
  // Gemini generateContent typical structure:
  // {
  //   candidates: [
  //     { content: { parts: [{ text: "..." }] } }
  //   ]
  // }
  try {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      const joined = parts
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .filter(Boolean)
        .join("\n");
      return joined || null;
    }
    return null;
  } catch {
    return null;
  }
}


