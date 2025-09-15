"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "ai" | "user";
  content: string;
};

export default function Home() {
  const [age, setAge] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("Sedentary");
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [healthConditionInput, setHealthConditionInput] = useState<string>("");
  const [goal, setGoal] = useState<string>("Maintain");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [dietPreference, setDietPreference] = useState<string>("Blueprint");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const chatRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);

  // Calculate BMI and get status
  const calculateBMI = () => {
    const heightNum = Number(height);
    const weightNum = Number(weight);
    
    if (heightNum > 0 && weightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmi = weightNum / (heightInMeters * heightInMeters);
      return { bmi: bmi.toFixed(1), status: getBMIStatus(bmi) };
    }
    return null;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", message: "Consider gaining weight" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", message: "Healthy weight range" };
    if (bmi < 30) return { category: "Overweight", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", message: "Consider weight management" };
    return { category: "Obese", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", message: "Focus on weight reduction" };
  };

  const bmiData = calculateBMI();

  const addHealthCondition = () => {
    if (healthConditionInput.trim() && !healthConditions.includes(healthConditionInput.trim())) {
      setHealthConditions([...healthConditions, healthConditionInput.trim()]);
      setHealthConditionInput("");
    }
  };

  const removeHealthCondition = (index: number) => {
    setHealthConditions(healthConditions.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHealthCondition();
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // removed fullscreen feature

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleReset = () => {
    setAge("");
    setHeight("");
    setWeight("");
    setActivityLevel("Sedentary");
    setHealthConditions([]);
    setHealthConditionInput("");
    setGoal("Maintain");
    setAllergens([]);
    setDietPreference("Blueprint");
    setFile(null);
    setMessages([]);
    setError("");
  };

  const handleGenerate = async () => {
    // Validate required fields
    if (!age || !height || !weight) {
      setError('Please fill in all required fields (Age, Height, Weight)');
      return;
    }

    setError('');
    setIsGenerating(true);

    // Clear existing diet plan
    setMessages([]);

    try {
      const payload = {
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        bmi: bmiData?.bmi || null,
        bmiCategory: bmiData?.status.category || null,
        activityLevel,
        healthConditions,
        goal,
        allergens,
        dietPreference,
        fileUploaded: !!file,
        fileName: file?.name || null,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const data: { content?: string } = await response.json();
      const content = data.content ?? generateMockPlan();
      setMessages((prev) => [
        ...prev,
        { role: "ai", content },
      ]);
    } catch (err) {
      const fallback = generateMockPlan();
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: fallback },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockPlan = () => {
    if (dietPreference === "Indian") {
      return `| Meal | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
|------|-------|-------|-------|-------|-------|-------|-------|
| Breakfast | Poha with peanuts | Vegetable upma | Masala oats | Besan chilla with mint chutney | Idli with sambar | Paneer bhurji with multigrain toast | Moong dal cheela |
| Lunch | Rajma chawal + salad | Grilled paneer tikka + roti + curd | Dal tadka + jeera rice + kachumber | Chole + brown rice | Mixed veg sabzi + roti + curd | Palak paneer + roti | Sambar + brown rice |
| Dinner | Grilled chicken/Paneer + sautéed veg | Khichdi + curd | Tawa fish/Tofu + salad | Veg pulao + raita | Chicken curry/Chickpea curry + roti | Egg bhurji/Tofu bhurji + salad | Veg stew + millet roti |
| Snack | Buttermilk (chaas) | Fruit bowl | Roasted chana | Coconut water + peanuts | Greek curd/yogurt | Handful of nuts | Masala corn |
| Hydration | 8–10 glasses water | 8–10 glasses water | 8–10 glasses water | 8–10 glasses water | 8–10 glasses water | 8–10 glasses water | 8–10 glasses water |`;
    }
    return `| Meal | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
|------|-------|-------|-------|-------|-------|-------|-------|
| Breakfast | Oatmeal with berries & nuts | Protein smoothie bowl | Greek yogurt parfait | Whole grain toast with avocado | Chia pudding with fruits | Smoothie with spinach | Eggs with whole grain bread |
| Lunch | Grilled chicken salad | Turkey wrap with veggies | Lentil soup with bread | Quinoa bowl with vegetables | Grilled fish with rice | Mediterranean salad | Chicken stir-fry |
| Dinner | Salmon with quinoa | Lean beef stir-fry | Grilled fish with rice | Vegetarian pasta | Grilled chicken with sweet potato | Tofu curry with rice | Lean pork with vegetables |
| Snack | Greek yogurt | Mixed nuts | Apple with peanut butter | Hummus with carrots | Protein bar | Trail mix | Cottage cheese with berries |
| Hydration | 8-10 glasses water | 8-10 glasses water | 8-10 glasses water | 8-10 glasses water | 8-10 glasses water | 8-10 glasses water | 8-10 glasses water |`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO for home */}
      <head>
        <title>AI Diet Plan Generator | Personalized Weekly Meal Planner</title>
        <meta name="description" content="Diet4Me is a free AI diet plan generator that builds a personalized weekly meal plan. Custom meal plan generator and AI meal planner." />
        <meta name="keywords" content="ai diet plan generator, free diet plan generator, personalized diet plan, custom meal plan generator, ai meal planner, weekly meal plan generator" />
      </head>
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-start">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Diet4Me</h1>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">AI-Powered Personalized Nutrition</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6 sticky top-4 self-start h-fit">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Personal Profile</h2>
                <p className="text-xs sm:text-sm text-slate-600">Tell us about yourself to get your personalized diet plan</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Weight + Activity Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="65"
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Activity Level</label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-slate-900"
                    >
                      <option value="Sedentary">Sedentary</option>
                      <option value="Lightly Active">Lightly Active</option>
                      <option value="Active">Active</option>
                      <option value="Very Active">Very Active</option>
                    </select>
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Health Conditions
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={healthConditionInput}
                      onChange={(e) => setHealthConditionInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add health condition"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
                    />
                    {healthConditions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {healthConditions.map((condition, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200"
                          >
                            {condition}
                            <button
                              type="button"
                              onClick={() => removeHealthCondition(index)}
                              className="text-emerald-600 hover:text-emerald-800 focus:outline-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
        </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Diet Preference</label>
                  <select
                    value={dietPreference}
                    onChange={(e) => setDietPreference(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-slate-900"
                  >
                    <option>Blueprint</option>
                    <option>No Preference</option>
                    <option>Vegetarian</option>
                    <option>Vegan</option>
                    <option>Keto</option>
                    <option>Paleo</option>
                    <option>Indian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Upload Medical Test</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 bg-white file:mr-3 sm:file:mr-4 file:py-1 sm:file:py-1.5 file:px-2 sm:file:px-3 file:border-0 file:rounded-md file:bg-emerald-50 file:text-emerald-700 file:text-xs sm:file:text-sm file:font-medium hover:file:bg-emerald-100"
                    />
                    {file && (
                      <div className="mt-2 flex items-center space-x-2 text-xs sm:text-sm text-emerald-600">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="truncate">{file.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Allergens */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Allergen Filters</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Nuts", "Dairy", "Soy", "Gluten", "Eggs", "Seafood"].map((item) => (
                      <label key={item} className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-2">
                        <input
                          type="checkbox"
                          checked={allergens.includes(item)}
                          onChange={(e) => {
                            setAllergens((prev) =>
                              e.target.checked ? [...prev, item] : prev.filter((a) => a !== item)
                            );
                          }}
                          className="accent-emerald-600"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Lose Weight", "Gain Muscle", "Maintain"].map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm border transition-colors ${
                          goal === g
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BMI Calculator */}
                {bmiData && (
                  <div className={`p-3 sm:p-4 rounded-lg border ${bmiData.status.bgColor} ${bmiData.status.borderColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Your BMI:</span>
                      <span className={`text-base sm:text-lg font-bold ${bmiData.status.color}`}>
                        {bmiData.bmi}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-medium ${bmiData.status.color}`}>
                        {bmiData.status.category}
                      </span>
                      <span className="text-xs text-slate-600">
                        {bmiData.status.message}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={handleReset}
                    className="w-full sm:flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors font-medium text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full sm:flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      "Generate Plan"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Your Diet Plan</h3>
                    <p className="text-xs sm:text-sm text-slate-600">AI-generated personalized recommendations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={messages.length === 0}
                      onClick={async () => {
                        if (!planRef.current) return;
                        const { toPng } = await import("html-to-image");
                        const dataUrl = await toPng(planRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
                        const link = document.createElement("a");
                        link.download = "diet4me-plan.png";
                        link.href = dataUrl;
                        link.click();
                      }}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Export PNG
                    </button>
                    <button
                      type="button"
                      disabled={messages.length === 0}
                      onClick={async () => {
                        if (!planRef.current) return;
                        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                          import("html2canvas"),
                          import("jspdf"),
                        ]);
                        const canvas = await html2canvas(planRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
                        const imgData = canvas.toDataURL("image/png");
                        const pdf = new jsPDF({
                          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
                          unit: "pt",
                          format: [canvas.width, canvas.height],
                        });
                        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
                        pdf.save("diet4me-plan.pdf");
                      }}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4" ref={chatRef}>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-slate-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm sm:text-base">Your diet plan will appear here...</p>
                    </div>
                  ) : (
                    <div ref={planRef} className="prose prose-sm max-w-none">
                      {messages.map((message, index) => (
                        <div key={index}>
                          {(() => {
                            const lines = message.content.split('\n');
                            const tableLines = lines.filter(line => line.includes('|') && !line.includes('---'));
                            
                            if (tableLines.length > 0) {
                              // Parse the table structure
                              const headers = tableLines[0].split('|').filter(cell => cell.trim());
                              const mealRows = tableLines.slice(1); // Skip header row
                              
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
                                          {mealRows.map((row, rowIndex) => {
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
                                  <div key={lineIndex} className="flex items-center gap-2 my-1">
                                    <span className="text-emerald-500 mt-1.5">•</span>
                                    <span className="text-slate-700">{line.replace(/^[-*]\s*/, '')}</span>
                                  </div>
                                );
                              }
                              
                              if (line.trim() === '') {
                                return <div key={lineIndex} className="h-2" />;
                              }
                              
                              return (
                                <p key={lineIndex} className="text-slate-700 leading-relaxed mb-2">
                                  {line}
                                </p>
                              );
                            });
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border-t border-slate-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-600 mb-2">
              <strong>Disclaimer:</strong> This application provides AI-generated diet recommendations for informational purposes only.
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              The information provided is not intended to replace professional medical advice, diagnosis, or treatment. 
              Always consult with a qualified healthcare provider before making significant changes to your diet, 
              especially if you have underlying health conditions, are pregnant, nursing, or taking medications. 
              Individual results may vary, and the effectiveness of dietary changes depends on various factors 
              including your overall health, lifestyle, and adherence to recommendations.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              The AI-generated content should be used as a starting point for discussion with healthcare professionals 
              and should not be considered as definitive medical guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
