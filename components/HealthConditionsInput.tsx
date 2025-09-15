'use client';

import { memo, useCallback } from 'react';

interface HealthConditionsInputProps {
  healthConditions: string[];
  healthConditionInput: string;
  setHealthConditionInput: (value: string) => void;
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
}

const HealthConditionsInput = memo(function HealthConditionsInput({
  healthConditions,
  healthConditionInput,
  setHealthConditionInput,
  onAddCondition,
  onRemoveCondition
}: HealthConditionsInputProps) {
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddCondition();
    }
  }, [onAddCondition]);

  return (
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
                  onClick={() => onRemoveCondition(index)}
                  className="text-emerald-600 hover:text-emerald-800 focus:outline-none"
                  aria-label={`Remove ${condition}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default HealthConditionsInput;
