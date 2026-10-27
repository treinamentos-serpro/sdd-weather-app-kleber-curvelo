import type { WeatherCondition } from '../types/weather';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export default function WeatherIcon({ condition, className = 'h-12 w-12' }: WeatherIconProps) {
  const sunny = condition.code === 0;
  const partlyCloudy = condition.code === 1 || condition.code === 2;
  const rainy =
    (condition.code >= 51 && condition.code <= 67) ||
    (condition.code >= 80 && condition.code <= 82) ||
    (condition.code >= 95 && condition.code <= 99);

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {(sunny || partlyCloudy) && (
        <g className="text-sun">
          <circle cx="27" cy="26" r="11" fill="currentColor" fillOpacity=".15" />
          <path d="M27 5v4m0 34v4M6 26h4m34 0h4M12 11l3 3m24 24 3 3M12 41l3-3m24-24 3-3" />
        </g>
      )}
      {!sunny && (
        <path
          className="text-slate-200"
          fill="#1a2138"
          d="M18 45a9 9 0 0 1 0-18 13 13 0 0 1 25-2 10 10 0 1 1 3 20Z"
        />
      )}
      {rainy && <path className="text-accent-400" d="m23 51-2 5m13-5-2 5m13-5-2 5" />}
    </svg>
  );
}
