"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ExportButtons from "@/components/ExportButtons";

type Message = {
  role: "ai" | "user";
  content: string;
};


export default function WorkoutPage() {
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("intermediate");
  const [goals, setGoals] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [streamingText, setStreamingText] = useState<string>("");

  const chatRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);


  const goalOptions = [
    'longevity', 'fat_loss', 'muscle_gain', 'endurance', 'strength', 'mobility'
  ];

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];


  const toggleGoal = useCallback((item: string) => {
    setGoals(prev => 
      prev.includes(item) 
        ? prev.filter(g => g !== item)
        : [...prev, item]
    );
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const generateWorkoutPlan = useCallback(async () => {
    if (!age || !fitnessLevel) {
      setError("Please fill in age and fitness level");
      return;
    }

    setIsGenerating(true);
    setError("");
    setStreamingText("");

    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(age),
          gender: gender || undefined,
          heightCm: height ? parseInt(height) : undefined,
          weightKg: weight ? parseInt(weight) : undefined,
          fitnessLevel,
          goals: goals.length > 0 ? goals : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate workout plan');
      }

      const data = await response.json();
      
      // The AI now returns content directly as markdown with table format
             setMessages([{ role: 'ai', content: data.content }]);

    } catch (err: any) {
      setError(err.message || 'Failed to generate workout plan');
    } finally {
      setIsGenerating(false);
    }
  }, [age, gender, height, weight, fitnessLevel, goals]);

  const resetForm = useCallback(() => {
    setAge("");
    setGender("");
    setHeight("");
    setWeight("");
    setFitnessLevel("intermediate");
    setGoals([]);
    setMessages([]);
    setError("");
    setStreamingText("");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6 sticky top-4 self-start h-fit">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Fitness Profile</h2>
                <p className="text-xs sm:text-sm text-slate-600">Tell us about yourself to get your personalized workout plan</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Age *</label>
                    <input
                      type="number"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-slate-900"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="65"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Fitness Level */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Fitness Level *</label>
                  <div className="grid grid-cols-1 gap-2">
                    {fitnessLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFitnessLevel(level.value)}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm border transition-colors ${
                          fitnessLevel === level.value
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>


                {/* Goals */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Fitness Goals</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {goalOptions.map((goal) => (
                      <label
                        key={goal}
                        className={`inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                          goals.includes(goal)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={goals.includes(goal)}
                          onChange={() => toggleGoal(goal)}
                          className="accent-emerald-600"
                        />
                        {goal.replace('_', ' ')}
                      </label>
                    ))}
                  </div>
                </div>


                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="w-full sm:flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors font-medium text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={generateWorkoutPlan}
                    disabled={isGenerating || !age || !fitnessLevel}
                    className="w-full sm:flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Your Workout Plan</h3>
                </div>
                <ExportButtons planRef={planRef} messagesLength={messages.length} />
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-slate-400 mb-2">
                      <svg className="w-12 h-12 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm sm:text-base">Generating your personalized workout plan...</p>
                  </div>
                )}

                {!isGenerating && messages.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-slate-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm sm:text-base">Your workout plan will appear here...</p>
                  </div>
                )}

                <div ref={planRef} className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="prose prose-sm max-w-none">
                      {(() => {
                        const lines = message.content.split('\n');
                        const tableLines = lines.filter(line => line.includes('|') && !line.includes('---'));
                        
                        if (tableLines.length > 0) {
                          // Parse the matrix-style table structure
                          const headers = tableLines[0].split('|');
                          const workoutRows = tableLines.slice(1); // Skip header row
                          
                          // Check if this is a matrix-style table (days on both axes)
                          // Look for the pattern: empty column followed by 7 days
                          const dayHeaders = headers.filter(header => 
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(header.trim())
                          );
                          const isMatrixTable = dayHeaders.length === 7 && headers.length >= 8;
                          
                          if (isMatrixTable) {
                            return (
                              <div className="my-4 h-full">
                                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-full">
                                  <div className="overflow-x-auto h-full">
                                    <table className="w-full h-full">
                                      <thead>
                                        <tr className="bg-slate-100 border-b border-slate-200">
                                          <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 w-24 h-16 bg-slate-200">
                                            Day
                                          </th>
                                          {dayHeaders.map((header, index) => (
                                            <th
                                              key={index}
                                              className="px-3 py-4 text-center text-sm font-bold text-slate-800 w-32 h-16 bg-emerald-50 border-r border-slate-200"
                                            >
                                              {header.trim()}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {workoutRows.map((row, rowIndex) => {
                                          const cells = row.split('|');
                                          if (cells.length === headers.length) {
                                            const dayName = cells[0].replace(/\*\*/g, '').trim();
                                            // Find the day columns (skip empty columns)
                                            const dayCells = cells.filter((cell, index) => {
                                              const header = headers[index];
                                              return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(header.trim());
                                            });
                                            
                                            return (
                                              <tr key={rowIndex} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-100">
                                                <td className="px-3 py-4 text-sm font-bold text-slate-800 bg-emerald-100 w-24 h-24 text-center border-r border-slate-200">
                                                  {dayName}
                                                </td>
                                                {dayCells.map((cell, cellIndex) => (
                                                  <td
                                                    key={cellIndex}
                                                    className="px-3 py-4 text-sm text-slate-800 w-32 h-24 bg-white border-r border-slate-100"
                                                  >
                                                    <div className="break-words leading-relaxed h-full flex items-center text-center font-medium">
                                                      {cell.trim()}
                                                    </div>
                                                  </td>
                                                ))}
                                              </tr>
                                            );
                                          }
                                          return null;
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            // Fallback to regular table format
                            return (
                              <div className="my-4 h-full">
                                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-full">
                                  <div className="overflow-x-auto h-full">
                                    <table className="w-full h-full">
                                      <thead>
                                        <tr className="bg-slate-100 border-b border-slate-200">
                                          {headers.map((header, index) => (
                                            <th
                                              key={index}
                                              className="px-3 py-4 text-left text-xs font-semibold text-slate-700 w-1/8 h-16"
                                            >
                                              {header.trim()}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {workoutRows.map((row, rowIndex) => {
                                          const cells = row.split('|').filter(cell => cell.trim());
                                          if (cells.length === headers.length) {
                                            return (
                                              <tr key={rowIndex} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-100">
                                                {cells.map((cell, cellIndex) => (
                                                  <td
                                                    key={cellIndex}
                                                    className={`px-3 py-4 text-xs text-slate-800 w-1/8 h-20 ${
                                                      cellIndex === 0 ? 'font-medium text-slate-700 bg-slate-100' : 'bg-white'
                                                    }`}
                                                  >
                                                    <div className="break-words leading-relaxed h-full flex items-center">
                                                      {cell.trim()}
                                                    </div>
                                                  </td>
                                                ))}
                                              </tr>
                                            );
                                          }
                                          return null;
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                        
                        // Fallback to regular markdown parsing for non-table content
                        return message.content.split('\n').map((line, lineIndex) => {
                          // Handle other markdown elements
                          if (line.startsWith('###')) {
                            return (
                              <h3 key={lineIndex} className="text-lg font-semibold text-slate-800 mt-4 mb-2">
                                {line.replace('###', '').trim()}
                              </h3>
                            );
                          }
                          
                          if (line.startsWith('##')) {
                            return (
                              <h2 key={lineIndex} className="text-xl font-bold text-slate-800 mt-6 mb-3">
                                {line.replace('##', '').trim()}
                              </h2>
                            );
                          }
                          
                          if (line.startsWith('#')) {
                            return (
                              <h1 key={lineIndex} className="text-2xl font-bold text-slate-800 mt-8 mb-4">
                                {line.replace('#', '').trim()}
                              </h1>
                            );
                          }
                          
                          if (line.startsWith('- ') || line.startsWith('* ')) {
                            return (
                              <div key={lineIndex} className="flex items-start mb-2">
                                <span className="text-emerald-600 mr-2 mt-1">•</span>
                                <span className="text-slate-700">{line.replace(/^[-*] /, '').trim()}</span>
                              </div>
                            );
                          }
                          
                          if (line.trim() === '') {
                            return <br key={lineIndex} />;
                          }
                          
                          return (
                            <p key={lineIndex} className="text-slate-700 leading-relaxed mb-2">
                              {line.trim()}
                            </p>
                          );
                        });
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-600 mb-2">
              <strong>Disclaimer:</strong> This application provides AI-generated workout recommendations for informational purposes only.
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              The information provided is not intended to replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before starting any new exercise program, especially if you have underlying health conditions, are pregnant, nursing, or taking medications. Individual results may vary, and the effectiveness of exercise programs depends on various factors including your overall health, lifestyle, and adherence to recommendations.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              The AI-generated content should be used as a starting point for discussion with healthcare professionals and should not be considered as definitive medical guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
