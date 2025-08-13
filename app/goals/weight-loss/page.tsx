import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weight Loss Meal Plan | Calorie Deficit AI Meal Planner",
  description:
    "Build a weight loss meal plan with our AI meal planner. High‑protein, macro‑aware, calorie deficit weekly meal plans.",
  keywords: [
    "weight loss meal plan",
    "calorie deficit meal plan",
    "high protein meal plan",
    "personalized diet plan",
  ],
};

const faqs = [
  { q: "How many calories should I eat to lose weight?", a: "The planner estimates calories from your stats and goal, then builds a weekly plan to match a safe deficit." },
  { q: "Do I need high protein?", a: "Higher protein supports satiety and muscle preservation during weight loss; the plan prioritizes lean protein and fiber." },
  { q: "Can I avoid certain foods?", a: "Yes, apply allergen filters and dietary preferences like vegetarian, vegan or Indian menus." },
];

export default function WeightLossSEOPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Weight Loss Meal Plan</h1>
      <p className="text-slate-600">Create a calorie‑deficit weekly plan with high protein and fiber.</p>
      <nav className="text-sm text-emerald-700 flex gap-4">
        <a href="/generator" className="underline">Generator</a>
        <a href="/blueprint-diet" className="underline">Blueprint Diet</a>
        <a href="/meal-plans" className="underline">Meal Plans</a>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}


