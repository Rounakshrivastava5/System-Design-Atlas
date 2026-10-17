import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  description?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-slate-700 dark:text-gray-300">
          {label}
        </label>
        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
          {value}
          {unit && <span className="ml-0.5 text-slate-500 font-normal">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {description && (
        <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-tight">
          {description}
        </p>
      )}
    </div>
  );
};
