'use client';

import { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  onFeedbackSubmitted: () => void;
}

export default function FeedbackModal({ isOpen, onClose, planId, onFeedbackSubmitted }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState({
    overallRating: 0,
    mealRatings: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    },
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    prepTimeAccuracy: 'accurate' as 'accurate' | 'too-long' | 'too-short',
    tasteRating: 'neutral' as 'loved' | 'liked' | 'neutral' | 'disliked',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const feedbackData = {
        plan_id: planId,
        ...feedback
      };
      
      console.log('Submitting feedback:', feedbackData);
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meal_plan',
          data: feedbackData
        })
      });

      const result = await response.json();
      console.log('Feedback response:', result);

      if (response.ok) {
        onFeedbackSubmitted();
        onClose();
        // Reset form
        setFeedback({
          overallRating: 0,
          mealRatings: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
          difficulty: 'medium',
          prepTimeAccuracy: 'accurate',
          tasteRating: 'neutral',
          comments: ''
        });
      } else {
        console.error('Feedback submission failed:', result);
        alert('Failed to submit feedback: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Rate Your Meal Plan</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Overall Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFeedback({ ...feedback, overallRating: rating })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      feedback.overallRating >= rating
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Meal Ratings */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Rate Individual Meals
              </label>
              <div className="space-y-3">
                {Object.entries(feedback.mealRatings).map(([meal, rating]) => (
                  <div key={meal} className="flex items-center justify-between">
                    <span className="capitalize text-slate-600">{meal}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback({
                            ...feedback,
                            mealRatings: { ...feedback.mealRatings, [meal]: star }
                          })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                            rating >= star
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Difficulty Level
              </label>
              <div className="flex gap-3">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFeedback({ ...feedback, difficulty: level as any })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      feedback.difficulty === level
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Prep Time Accuracy */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Prep Time Accuracy
              </label>
              <div className="flex gap-3">
                {['accurate', 'too-long', 'too-short'].map((accuracy) => (
                  <button
                    key={accuracy}
                    onClick={() => setFeedback({ ...feedback, prepTimeAccuracy: accuracy as any })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      feedback.prepTimeAccuracy === accuracy
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {accuracy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Taste Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Taste Rating
              </label>
              <div className="flex gap-3">
                {['loved', 'liked', 'neutral', 'disliked'].map((taste) => (
                  <button
                    key={taste}
                    onClick={() => setFeedback({ ...feedback, tasteRating: taste as any })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      feedback.tasteRating === taste
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {taste.charAt(0).toUpperCase() + taste.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Additional Comments
              </label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                placeholder="Any suggestions for improvement?"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || feedback.overallRating === 0}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
