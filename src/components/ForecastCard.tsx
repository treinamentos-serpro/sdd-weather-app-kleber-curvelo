import { formatDate, formatTemperature } from '../lib/format';
import type { ForecastDay, TemperatureUnit } from '../types/weather';
import WeatherIcon from './WeatherIcon';

interface ForecastCardProps {
  day: ForecastDay;
  unit: TemperatureUnit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  return (
    <li className="glass flex min-w-0 flex-col items-center gap-3 p-4 text-center">
      <time dateTime={day.date} className="text-sm font-medium text-slate-200">
        {formatDate(day.date)}
      </time>
      <WeatherIcon condition={day.condition} />
      <p className="flex-1 text-sm text-slate-300">{day.condition.description}</p>
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-slate-300">Máx. </span>
          <strong>{formatTemperature(day.maxTemperatureC, unit)}</strong>
        </p>
        <p className="text-slate-300">Mín. {formatTemperature(day.minTemperatureC, unit)}</p>
      </div>
    </li>
  );
}
