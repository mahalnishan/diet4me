'use client';

import { useState } from 'react';
import type { Metadata } from "next";
import blueprintData from '../blueprint.json';

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
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showIngredients, setShowIngredients] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const { diet_plan } = blueprintData;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{diet_plan.name}</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">{diet_plan.description}</p>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {diet_plan.meals.map((meal, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{meal.name}</h3>
                <p className="text-slate-600 mb-4">{meal.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600">
                    {diet_plan.customization_options.caloric_intake[meal.name] || 'N/A'} kcal
                  </span>
                  <button
                    onClick={() => setSelectedMeal(selectedMeal === meal.name ? null : meal.name)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  >
                    {selectedMeal === meal.name ? 'Hide Details' : 'View Recipe'}
                  </button>
                </div>
              </div>
              
              {selectedMeal === meal.name && (
                <div className="border-t border-slate-200 p-6 bg-slate-50">
                  <h4 className="font-semibold text-slate-900 mb-3">Ingredients:</h4>
                  <ul className="space-y-2 mb-4">
                    {meal.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-700">{ingredient.item}</span>
                        <span className="text-slate-500 font-medium">{ingredient.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <h4 className="font-semibold text-slate-900 mb-2">Preparation:</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{meal.preparation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ingredients Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete Ingredient Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(diet_plan.ingredient_categories).map(([category, ingredients]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 capitalize">
                  {category.replace('_', ' ')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplements */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommended Supplements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {diet_plan.supplements.map((supplement, index) => (
              <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{supplement.name}</h3>
                <p className="text-sm text-slate-600 mb-2">{supplement.description}</p>
                <span className="text-sm font-medium text-emerald-600">{supplement.dosage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Options */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Customization Options</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Meal Substitutions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(diet_plan.customization_options.meal_substitutions).map(([meal, substitutions]) => (
                  <div key={meal} className="space-y-2">
                    <h4 className="font-medium text-slate-900">{meal}</h4>
                    <div className="flex flex-wrap gap-1">
                      {substitutions.map((sub, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Dietary Restrictions Supported</h3>
              <div className="flex flex-wrap gap-2">
                {diet_plan.customization_options.dietary_restrictions.map((restriction, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </div>
    </div>
  );
}


