'use client';

import { useState } from 'react';
import blueprintData from '../blueprint.json';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-6">
            {diet_plan.name}
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">{diet_plan.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Plant-Based</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Nutrient-Dense</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Longevity-Focused</span>
            </div>
          </div>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {diet_plan.meals.map((meal, index) => (
            <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
              {/* Meal Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-semibold rounded-full">
                    {(diet_plan.customization_options.caloric_intake as any)[meal.name] || 'N/A'} kcal
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{meal.name}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-slate-600 mb-6 leading-relaxed">{meal.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-slate-500">Prep: 15-30 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-sm text-slate-500">Difficulty: Easy</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedMeal(selectedMeal === meal.name ? null : meal.name)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {selectedMeal === meal.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Hide Recipe
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Recipe
                    </span>
                  )}
                </button>
              </div>
              
              {selectedMeal === meal.name && (
                <div className="border-t border-slate-200 p-6 bg-gradient-to-br from-slate-50 to-emerald-50/30">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Ingredients
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {meal.ingredients.map((ingredient, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-white/50">
                            <span className="text-slate-700 font-medium">{ingredient.item}</span>
                            <span className="text-slate-500 text-sm font-semibold bg-slate-100 px-2 py-1 rounded-full">{ingredient.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Preparation
                      </h4>
                      <div className="p-4 bg-white/70 rounded-lg border border-white/50">
                        <p className="text-slate-700 leading-relaxed">{meal.preparation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ingredients Categories */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Complete Ingredient Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Explore our comprehensive collection of nutrient-dense ingredients organized by category</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(diet_plan.ingredient_categories).map(([category, ingredients], categoryIndex) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{categoryIndex + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 capitalize">
                    {category.replace('_', ' ')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-gradient-to-r from-slate-100 to-emerald-50 text-slate-700 rounded-full text-sm font-medium border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Recommended Supplements</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Support your Blueprint journey with these scientifically-backed supplements</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {diet_plan.supplements.map((supplement, index) => (
              <div key={index} className="group text-center p-6 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{supplement.name}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{supplement.description}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {supplement.dosage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Options */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Customization Options</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Personalize your Blueprint experience with flexible meal options and dietary accommodations</p>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                Meal Substitutions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(diet_plan.customization_options.meal_substitutions).map(([meal, substitutions]) => (
                  <div key={meal} className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-white/50">
                    <h4 className="font-bold text-slate-900 mb-4 text-lg">{meal}</h4>
                    <div className="flex flex-wrap gap-2">
                      {substitutions.map((sub, idx) => (
                        <span key={idx} className="px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Dietary Restrictions Supported
              </h3>
              <div className="flex flex-wrap gap-3">
                {diet_plan.customization_options.dietary_restrictions.map((restriction, idx) => (
                  <span key={idx} className="px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold border border-green-200 hover:border-green-300 transition-colors cursor-pointer flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Get answers to common questions about the Blueprint protocol</p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-r from-white to-slate-50/50 rounded-xl p-6 border border-slate-200 hover:border-emerald-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-3 text-lg flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  {faq.q}
                </h3>
                <p className="text-slate-600 leading-relaxed ml-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </div>
    </div>
  );
}


