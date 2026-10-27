import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const searchMock = vi.mocked(searchCities);
const weatherMock = vi.mocked(getWeather);
const city = mockWeatherData.city;
const otherCity: City = { name: 'Recife', latitude: -8.05, longitude: -34.88 };

beforeEach(() => {
  vi.resetAllMocks();
  searchMock.mockResolvedValue([city, otherCity]);
  weatherMock.mockImplementation(async (selected) => ({ ...mockWeatherData, city: selected }));
});

describe('useWeather', () => {
  it('começa idle e retry inicial não consulta serviços', async () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.retry());
    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).not.toHaveBeenCalled();
  });

  it('orienta sobre entrada vazia sem chamar serviços', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(' \t '));
    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      query: '',
      error: 'Informe uma localidade para começar.',
    });
    await act(() => result.current.retry());
    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).not.toHaveBeenCalled();
  });

  it('apara a consulta, mantém cidades e carrega a primeira', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('  São Paulo  '));
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('São Paulo');
    expect(weatherMock).toHaveBeenCalledExactlyOnceWith(city);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'São Paulo',
      cities: [city, otherCity],
      data: mockWeatherData,
      error: null,
    });
  });

  it('retorna empty sem consultar previsão quando não há cidades', async () => {
    searchMock.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('inexistente'));
    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      error: null,
      query: 'inexistente',
    });
    expect(weatherMock).not.toHaveBeenCalled();
    await act(() => result.current.retry());
    expect(searchMock.mock.calls).toEqual([['inexistente'], ['inexistente']]);
    expect(result.current.status).toBe('success');
  });

  it('retry de geocodificação repete a consulta, não a cidade de uma busca anterior', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    searchMock.mockRejectedValueOnce(
      new WeatherServiceError(
        'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
      ),
    );
    await act(() => result.current.search('Recife'));
    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      cities: [],
      query: 'Recife',
      error:
        'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    });
    searchMock.mockResolvedValueOnce([otherCity]);
    await act(() => result.current.retry());
    expect(searchMock.mock.calls).toEqual([['São Paulo'], ['Recife'], ['Recife']]);
    expect(result.current.data?.city).toEqual(otherCity);
    expect(result.current.error).toBeNull();
  });

  it('retry de previsão mantém cidade e lista sem repetir geocodificação', async () => {
    weatherMock.mockRejectedValueOnce(
      new WeatherServiceError('A consulta demorou mais de 10 segundos. Tente novamente.'),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      cities: [city, otherCity],
      error: 'A consulta demorou mais de 10 segundos. Tente novamente.',
    });
    await act(() => result.current.retry());
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(weatherMock.mock.calls).toEqual([[city], [city]]);
    expect(result.current.status).toBe('success');
  });

  it('selectCity carrega a cidade escolhida e retry repete essa seleção', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    weatherMock.mockRejectedValueOnce(
      new WeatherServiceError(
        'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
      ),
    );
    await act(() => result.current.selectCity(otherCity));
    expect(result.current.status).toBe('error');
    await act(() => result.current.retry());
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(weatherMock.mock.calls).toEqual([[city], [otherCity], [otherCity]]);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'São Paulo',
      cities: [city, otherCity],
      data: { city: otherCity },
    });
  });

  it('selectCity funciona sem busca prévia', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.selectCity(otherCity));
    expect(searchMock).not.toHaveBeenCalled();
    expect(result.current.data?.city).toEqual(otherCity);
  });

  it('mantém loading nas duas etapas, limpa dados e bloqueia operações concorrentes', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    let resolveCities!: (cities: City[]) => void;
    let resolveWeather!: (data: typeof mockWeatherData) => void;
    searchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCities = resolve;
        }),
    );
    weatherMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveWeather = resolve;
        }),
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('Recife');
      void result.current.search('ignorada');
      void result.current.selectCity(city);
      void result.current.retry();
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      cities: [],
      error: null,
      query: 'Recife',
    });
    expect(searchMock).toHaveBeenCalledTimes(2);
    await act(async () => resolveCities([otherCity]));
    expect(result.current.status).toBe('loading');
    expect(result.current.cities).toEqual([otherCity]);
    await act(() => result.current.search('também ignorada'));
    expect(searchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      resolveWeather({ ...mockWeatherData, city: otherCity });
      await pending;
    });
    expect(weatherMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('registra erros inesperados e permite recuperação', async () => {
    const cause = new Error('Falha inesperada');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      searchMock.mockRejectedValueOnce(cause);
      const { result } = renderHook(() => useWeather());
      await act(() => result.current.search('São Paulo'));
      expect(result.current).toMatchObject({
        status: 'error',
        data: null,
        error: 'Ocorreu um erro inesperado. Tente novamente.',
      });
      expect(log).toHaveBeenCalledWith('Falha inesperada ao consultar o clima.', cause);
      await act(() => result.current.retry());
      expect(result.current.status).toBe('success');
    } finally {
      log.mockRestore();
    }
  });
});
