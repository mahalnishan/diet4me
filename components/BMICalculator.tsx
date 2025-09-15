'use client';

import { memo, useMemo } from 'react';

interface BMICalculatorProps {
  height: string;
  weight: string;
}

const BMICalculator = memo(function BMICalculator({ height, weight }: BMICalculatorProps) {
  const bmiData = useMemo(() => {
    const heightNum = Number(height);
    const weightNum = Number(weight);
    
    if (heightNum > 0 && weightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmi = weightNum / (heightInMeters * heightInMeters);
      return { bmi: bmi.toFixed(1), status: getBMIStatus(bmi) };
    }
    return null;
  }, [height, weight]);

  if (!bmiData) return null;

  return (
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
  );
});

function getBMIStatus(bmi: number) {
  if (bmi < 18.5) return { category: "Underweight", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", message: "Consider gaining weight" };
  if (bmi < 25) return { category: "Normal", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", message: "Healthy weight range" };
  if (bmi < 30) return { category: "Overweight", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", message: "Consider weight management" };
  return { category: "Obese", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", message: "Focus on weight reduction" };
}

export default BMICalculator;
