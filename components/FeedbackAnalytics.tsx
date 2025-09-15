'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  difficultyDistribution: Record<string, number>;
  tasteDistribution: Record<string, number>;
  prepTimeAccuracy: Record<string, number>;
}

interface PopularRecipe {
  recipe_name: string;
  total_ratings: number;
  average_rating: number;
  success_rate: number;
}

export default function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [popularRecipes, setPopularRecipes] = useState<PopularRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchPopularRecipes();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/feedback?type=analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularRecipes = async () => {
    try {
      const response = await fetch('/api/feedback?type=popular_recipes');
      const data = await response.json();
      setPopularRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching popular recipes:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-slate-500">
        No feedback data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Feedback</h3>
          <p className="text-3xl font-bold text-emerald-600">{analytics.totalFeedback}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-emerald-600">{analytics.averageRating}/5</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-emerald-600">
            {Math.round((analytics.averageRating / 5) * 100)}%
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = analytics.ratingDistribution[rating] || 0;
            const percentage = analytics.totalFeedback > 0 ? (count / analytics.totalFeedback) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="w-8 text-slate-600 font-medium">{rating}★</div>
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                  <div
                    className="bg-emerald-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-slate-600 text-right">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty & Taste Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Difficulty Distribution</h3>
          <div className="space-y-2">
            {Object.entries(analytics.difficultyDistribution).map(([difficulty, count]) => {
              const percentage = analytics.totalFeedback > 0 ? (count / analytics.totalFeedback) * 100 : 0;
              return (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className="capitalize text-slate-600">{difficulty}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Taste Distribution</h3>
          <div className="space-y-2">
            {Object.entries(analytics.tasteDistribution).map(([taste, count]) => {
              const percentage = analytics.totalFeedback > 0 ? (count / analytics.totalFeedback) * 100 : 0;
              return (
                <div key={taste} className="flex items-center justify-between">
                  <span className="capitalize text-slate-600">{taste}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Recipes */}
      {popularRecipes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Most Popular Recipes</h3>
          <div className="space-y-3">
            {popularRecipes.map((recipe, index) => (
              <div key={recipe.recipe_name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900">{recipe.recipe_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>{recipe.average_rating.toFixed(1)}★</span>
                  <span>{recipe.total_ratings} ratings</span>
                  <span className="text-emerald-600 font-semibold">
                    {Math.round(recipe.success_rate * 100)}% success
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
