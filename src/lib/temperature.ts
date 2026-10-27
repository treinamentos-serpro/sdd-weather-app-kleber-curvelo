import type { TemperatureUnit } from '../types/weather';

export function convertTemperature(temperatureC: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}
