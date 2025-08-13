import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Diet Plan Generator | Free Personalized Meal Planner",
  description:
    "Use our free AI diet plan generator to create a personalized weekly meal plan. Custom meal plan generator and AI meal planner for better nutrition.",
  keywords: [
    "ai diet plan generator",
    "free diet plan generator",
    "personalized diet plan",
    "custom meal plan generator",
    "ai meal planner",
    "weekly meal plan generator",
  ],
};

const faqs = [
  {
    q: "How does the AI diet plan generator work?",
    a: "It combines your inputs (age, height, weight, activity) with nutrition rules to build a personalized weekly meal plan in minutes.",
  },
  {
    q: "Is the meal plan generator free?",
    a: "Yes, you can generate a free diet plan and export it. You can refine it with preferences like vegetarian, vegan, or Indian meals.",
  },
  {
    q: "Can I customize macros or calories?",
    a: "You can target goals such as weight loss or muscle gain; the planner adjusts calories, protein and fiber to match your goal.",
  },
];

export default function GeneratorSEOPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">AI Diet Plan Generator</h1>
      <p className="text-slate-600">Create a personalized weekly meal plan with our AI meal planner.</p>
      <nav className="text-sm text-emerald-700 flex gap-4">
        <a href="/goals/weight-loss" className="underline">Weight Loss</a>
        <a href="/blueprint-diet" className="underline">Blueprint Diet</a>
        <a href="/meal-plans" className="underline">Weekly Meal Plans</a>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}


