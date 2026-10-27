import { mockWeatherData } from '../mocks/weather';
import type { WeatherData } from '../types/weather';

export async function searchMockWeather(query: string): Promise<WeatherData | null> {
  const normalizedQuery = query
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

  return normalizedQuery === 'sao paulo' ? mockWeatherData : null;
}
