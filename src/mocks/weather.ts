import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    name: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    temperatureC: 24,
    condition: { code: 2, description: 'Parcialmente nublado' },
  },
  forecast: [
    {
      date: '2026-10-27',
      condition: { code: 2, description: 'Parcialmente nublado' },
      minTemperatureC: 18,
      maxTemperatureC: 26,
    },
    {
      date: '2026-10-28',
      condition: { code: 0, description: 'Céu limpo' },
      minTemperatureC: 19,
      maxTemperatureC: 28,
    },
    {
      date: '2026-10-29',
      condition: { code: 3, description: 'Nublado' },
      minTemperatureC: 17,
      maxTemperatureC: 25,
    },
    {
      date: '2026-10-30',
      condition: { code: 61, description: 'Chuva leve' },
      minTemperatureC: 16,
      maxTemperatureC: 22,
    },
    {
      date: '2026-10-31',
      condition: { code: 0, description: 'Céu limpo' },
      minTemperatureC: 18,
      maxTemperatureC: 27,
    },
  ],
};
