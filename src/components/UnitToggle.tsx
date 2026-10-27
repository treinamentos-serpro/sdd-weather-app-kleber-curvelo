import type { TemperatureUnit } from '../types/weather';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex gap-1 self-start rounded-xl border border-white/10 bg-night-900/60 p-1"
    >
      {(['celsius', 'fahrenheit'] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-label={value === 'celsius' ? '°C, Celsius' : '°F, Fahrenheit'}
          aria-pressed={unit === value}
          onClick={() => onChange(value)}
          className={`min-h-11 min-w-12 rounded-lg px-3 font-semibold ${
            unit === value ? 'bg-accent-600 text-white' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          {value === 'celsius' ? '°C' : '°F'}
        </button>
      ))}
    </div>
  );
}
