import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blueprint Diet Plan | Bryan Johnson Protocol Meals",
  description:
    "Explore Bryan Johnson's Blueprint diet protocol: super veggie recipe, macros, shopping list and weekly meal plan ideas.",
  keywords: [
    "bryan johnson blueprint diet",
    "blueprint protocol diet plan",
    "blueprint recipes",
    "blueprint super veggie recipe",
    "bryan johnson meal plan",
    "blueprint diet macros",
  ],
};

const faqs = [
  { q: "What is the Blueprint diet?", a: "A structured protocol emphasizing nutrient density, fiber and precise macros popularized by Bryan Johnson." },
  { q: "Is there a shopping list?", a: "Yes, the protocol includes standard produce, legumes, nuts, seeds and olive oil. You can adapt the list for availability." },
  { q: "How do I combine Blueprint with weight loss?", a: "Select a calorie deficit target and keep protein and fiber high while following Blueprint meal patterns." },
];

export default function BlueprintSEOPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Blueprint Diet</h1>
      <p className="text-slate-600">Learn the Blueprint protocol and build a weekly plan.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}


