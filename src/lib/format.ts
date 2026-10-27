import type { TemperatureUnit } from '../types/weather';
import { convertTemperature } from './temperature';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

export function formatTemperature(temperatureC: number, unit: TemperatureUnit): string {
  return `${Math.round(convertTemperature(temperatureC, unit))}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}
