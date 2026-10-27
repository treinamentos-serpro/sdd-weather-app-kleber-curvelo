import type { City, ForecastDay, WeatherCondition, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

const WEATHER_DESCRIPTIONS = new Map<number, string>([
  [0, 'Céu limpo'],
  [1, 'Predomínio de sol'],
  [2, 'Parcialmente nublado'],
  [3, 'Nublado'],
  [45, 'Névoa'],
  [48, 'Névoa com gelo'],
  [51, 'Garoa leve'],
  [53, 'Garoa moderada'],
  [55, 'Garoa intensa'],
  [56, 'Garoa congelante'],
  [57, 'Garoa congelante intensa'],
  [61, 'Chuva leve'],
  [63, 'Chuva moderada'],
  [65, 'Chuva forte'],
  [66, 'Chuva congelante'],
  [67, 'Chuva congelante forte'],
  [71, 'Neve fraca'],
  [73, 'Neve moderada'],
  [75, 'Neve forte'],
  [77, 'Grãos de neve'],
  [80, 'Pancadas de chuva fracas'],
  [81, 'Pancadas de chuva moderadas'],
  [82, 'Pancadas de chuva fortes'],
  [85, 'Pancadas de neve fracas'],
  [86, 'Pancadas de neve fortes'],
  [95, 'Trovoadas'],
  [96, 'Trovoadas com granizo'],
  [99, 'Trovoadas com granizo forte'],
]);

export class WeatherServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapCity(result: unknown): City {
  if (
    !isRecord(result) ||
    typeof result.name !== 'string' ||
    !result.name.trim() ||
    typeof result.latitude !== 'number' ||
    !Number.isFinite(result.latitude) ||
    Math.abs(result.latitude) > 90 ||
    typeof result.longitude !== 'number' ||
    !Number.isFinite(result.longitude) ||
    Math.abs(result.longitude) > 180 ||
    (result.admin1 !== undefined && typeof result.admin1 !== 'string') ||
    (result.country !== undefined && typeof result.country !== 'string') ||
    (result.timezone !== undefined && typeof result.timezone !== 'string')
  ) {
    throw new WeatherServiceError('Resposta de busca inválida. Tente novamente.');
  }

  return {
    name: result.name,
    region: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const data = await fetchJson(
    `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`,
    'Não foi possível buscar a cidade. Tente novamente.',
  );
  if (!isRecord(data) || (data.results !== undefined && !Array.isArray(data.results))) {
    throw new WeatherServiceError('Resposta de busca inválida. Tente novamente.');
  }

  return data.results === undefined ? [] : data.results.map(mapCity);
}

function isAbortError(error: unknown, signal: AbortSignal): boolean {
  return signal.aborted || (isRecord(error) && error.name === 'AbortError');
}

function requestFailure(error: unknown, signal: AbortSignal): WeatherServiceError {
  if (isAbortError(error, signal)) {
    return new WeatherServiceError('A consulta demorou mais de 10 segundos. Tente novamente.', {
      cause: error,
    });
  }
  return new WeatherServiceError(
    'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    { cause: error },
  );
}

async function fetchJson(url: string, errorMessage: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      throw requestFailure(error, controller.signal);
    }
    if (!response.ok) throw new WeatherServiceError(errorMessage);

    try {
      return await response.json();
    } catch (error) {
      if (isAbortError(error, controller.signal)) {
        throw requestFailure(error, controller.signal);
      }
      if (error instanceof SyntaxError) {
        throw new WeatherServiceError(errorMessage, { cause: error });
      }
      throw requestFailure(error, controller.signal);
    }
  } finally {
    clearTimeout(timeout);
  }
}

function invalidWeather(): WeatherServiceError {
  return new WeatherServiceError('Resposta de clima incompleta ou inválida. Tente novamente.');
}

function mapCondition(code: unknown): WeatherCondition {
  const description = typeof code === 'number' ? WEATHER_DESCRIPTIONS.get(code) : undefined;
  if (typeof code !== 'number' || !description) throw invalidWeather();
  return { code, description };
}

function mapTemperature(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalidWeather();
  return value;
}

function mapForecastDay(date: unknown, code: unknown, min: unknown, max: unknown): ForecastDay {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw invalidWeather();
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    throw invalidWeather();
  }

  const minTemperatureC = mapTemperature(min);
  const maxTemperatureC = mapTemperature(max);
  if (minTemperatureC > maxTemperatureC) throw invalidWeather();

  return { date, condition: mapCondition(code), minTemperatureC, maxTemperatureC };
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  });
  const data = await fetchJson(
    `${FORECAST_URL}?${params}`,
    'Não foi possível carregar o clima. Tente novamente.',
  );
  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw invalidWeather();
  }

  const {
    time,
    weather_code: codes,
    temperature_2m_min: minima,
    temperature_2m_max: maxima,
  } = data.daily;
  if (
    !Array.isArray(time) ||
    time.length !== 5 ||
    !Array.isArray(codes) ||
    codes.length !== 5 ||
    !Array.isArray(minima) ||
    minima.length !== 5 ||
    !Array.isArray(maxima) ||
    maxima.length !== 5
  ) {
    throw invalidWeather();
  }

  const day = (index: number) =>
    mapForecastDay(time[index], codes[index], minima[index], maxima[index]);
  const forecast: WeatherData['forecast'] = [day(0), day(1), day(2), day(3), day(4)];
  for (let index = 1; index < forecast.length; index++) {
    if (Date.parse(forecast[index].date) - Date.parse(forecast[index - 1].date) !== 86_400_000) {
      throw invalidWeather();
    }
  }

  return {
    city,
    current: {
      temperatureC: mapTemperature(data.current.temperature_2m),
      condition: mapCondition(data.current.weather_code),
    },
    forecast,
  };
}
