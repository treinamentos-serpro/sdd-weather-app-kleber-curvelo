export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface City {
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface WeatherCondition {
  code: number;
  description: string;
}

export interface CurrentWeather {
  temperatureC: number;
  condition: WeatherCondition;
}

export interface ForecastDay {
  date: string;
  condition: WeatherCondition;
  minTemperatureC: number;
  maxTemperatureC: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];
}

export type RetryContext =
  | { operation: 'geocoding'; query: string }
  | { operation: 'forecast'; query: string; city: City };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading-geocoding'; query: string }
  | { status: 'loading-forecast'; query: string; city: City }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; retry: RetryContext }
  | { status: 'success'; data: WeatherData };
