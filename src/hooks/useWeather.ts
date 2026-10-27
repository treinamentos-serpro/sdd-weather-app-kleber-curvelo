import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, RetryContext, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherSnapshot {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

interface UseWeatherResult extends WeatherSnapshot {
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherSnapshot>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const pending = useRef(false);
  const lastOperation = useRef<RetryContext | null>(null);

  const execute = useCallback(async (operation: RetryContext) => {
    if (pending.current) return;
    pending.current = true;
    lastOperation.current = operation;
    setState((previous) => ({
      status: 'loading',
      data: null,
      cities: operation.operation === 'geocoding' ? [] : previous.cities,
      error: null,
      query: operation.query,
    }));

    try {
      let city: City;
      if (operation.operation === 'geocoding') {
        const cities = await searchCities(operation.query);
        setState((previous) => ({ ...previous, cities }));
        const firstCity = cities[0];
        if (!firstCity) {
          setState((previous) => ({ ...previous, status: 'empty' }));
          return;
        }
        city = firstCity;
        lastOperation.current = { operation: 'forecast', query: operation.query, city };
      } else {
        city = operation.city;
      }

      const data = await getWeather(city);
      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (!(error instanceof WeatherServiceError)) {
        console.error('Falha inesperada ao consultar o clima.', error);
      }
      setState((previous) => ({
        ...previous,
        status: 'error',
        data: null,
        error:
          error instanceof WeatherServiceError
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente.',
      }));
    } finally {
      pending.current = false;
    }
  }, []);

  const search = useCallback(
    async (name: string) => {
      if (pending.current) return;
      const query = name.trim();
      if (!query) {
        lastOperation.current = null;
        setState({
          status: 'idle',
          query: '',
          data: null,
          cities: [],
          error: 'Informe uma localidade para começar.',
        });
        return;
      }
      await execute({ operation: 'geocoding', query });
    },
    [execute],
  );

  const selectCity = useCallback(
    async (city: City) => {
      await execute({
        operation: 'forecast',
        query: lastOperation.current?.query ?? '',
        city,
      });
    },
    [execute],
  );

  const retry = useCallback(async () => {
    if (lastOperation.current) await execute(lastOperation.current);
  }, [execute]);

  return { ...state, search, selectCity, retry };
}
