import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it.each(['', '   ', '\t\n'])('retorna [] sem rede para input vazio %j', async (name) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await searchCities(name)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  const CITY: City = { name: 'São Paulo', latitude: -23.55, longitude: -46.63 };

  function forecastResponse() {
    return {
      current: { temperature_2m: 24, weather_code: 2 },
      daily: {
        time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
        weather_code: [0, 3, 61, 71, 95],
        temperature_2m_min: [0, -2, 17, 18, 19],
        temperature_2m_max: [20, 21, 22, 23, 24],
      },
    };
  }

  describe('getWeather', () => {
    it('solicita coordenadas, Celsius, timezone automático e cinco dias', async () => {
      const fetchMock = mockResponse(forecastResponse());
      await getWeather(CITY);
      const url = new URL(fetchMock.mock.calls[0][0]);

      expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
      expect(Object.fromEntries(url.searchParams)).toEqual({
        latitude: '-23.55',
        longitude: '-46.63',
        current: 'temperature_2m,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        temperature_unit: 'celsius',
        timezone: 'auto',
        forecast_days: '5',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('mapeia current e exatamente cinco dias consecutivos, inclusive na virada do mês', async () => {
      const body = forecastResponse();
      mockResponse(body);
      const result = await getWeather(CITY);

      expect(result.city).toBe(CITY);
      expect(result.current).toEqual({
        temperatureC: 24,
        condition: { code: 2, description: 'Parcialmente nublado' },
      });
      expect(result.forecast).toEqual(
        ['Céu limpo', 'Nublado', 'Chuva leve', 'Neve fraca', 'Trovoadas'].map(
          (description, index) => ({
            date: body.daily.time[index],
            condition: { code: body.daily.weather_code[index], description },
            minTemperatureC: body.daily.temperature_2m_min[index],
            maxTemperatureC: body.daily.temperature_2m_max[index],
          }),
        ),
      );
      expect(result.forecast).toHaveLength(5);
    });

    it.each([
      null,
      {},
      { current: {} },
      { daily: {} },
    ])('rejeita resposta incompleta %j', async (body) => {
      mockResponse(body);
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it.each([
      'current',
      'daily',
    ])('rejeita %s ausente ou inválido mesmo quando o outro bloco está completo', async (field) => {
      for (const value of [undefined, null, {}, []]) {
        mockResponse({ ...forecastResponse(), [field]: value });
        await expect(getWeather(CITY)).rejects.toMatchObject({
          name: 'WeatherServiceError',
          message: 'Resposta de clima incompleta ou inválida. Tente novamente.',
        });
      }
    });

    it.each(['temperature_2m', 'weather_code'])('exige current.%s', async (field) => {
      const body = forecastResponse();
      const current: Record<string, unknown> = { ...body.current };
      delete current[field];
      mockResponse({ ...body, current });
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it.each([
      'time',
      'weather_code',
      'temperature_2m_min',
      'temperature_2m_max',
    ])('rejeita daily.%s ausente, inválido ou com quantidade diferente de cinco', async (field) => {
      for (const value of [undefined, null, {}, [], [1, 2, 3, 4], [1, 2, 3, 4, 5, 6]]) {
        const body = forecastResponse();
        mockResponse({ ...body, daily: { ...body.daily, [field]: value } });
        await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
      }
    });

    it.each([
      null,
      '24',
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])('rejeita temperatura atual inválida %j', async (temperature) => {
      const body = forecastResponse();
      mockResponse({ ...body, current: { ...body.current, temperature_2m: temperature } });
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it.each([
      'time',
      'weather_code',
      'temperature_2m_min',
      'temperature_2m_max',
    ])('rejeita valor ausente em qualquer um dos cinco dias de %s', async (field) => {
      for (let index = 0; index < 5; index++) {
        const body = forecastResponse();
        const values: unknown[] = [...body.daily[field as keyof typeof body.daily]];
        values[index] = null;
        mockResponse({ ...body, daily: { ...body.daily, [field]: values } });
        await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
      }
    });

    it.each([4, 100, -1, 2.5, '2', null])('rejeita código WMO desconhecido %j', async (code) => {
      const body = forecastResponse();
      mockResponse({ ...body, current: { ...body.current, weather_code: code } });
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
      mockResponse({ ...body, daily: { ...body.daily, weather_code: [0, 3, 61, 71, code] } });
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it.each([
      '2026-02-30',
      'inválida',
      '2026-10-29',
      '2026-11-03',
    ])('rejeita data inválida, repetida ou não consecutiva: %s', async (date) => {
      const body = forecastResponse();
      body.daily.time[4] = date;
      mockResponse(body);
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('rejeita mínima maior que máxima', async () => {
      const body = forecastResponse();
      body.daily.temperature_2m_min[4] = 30;
      mockResponse(body);
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it.each([400, 429, 500])('rejeita HTTP %i sem retry', async (status) => {
      const fetchMock = mockResponse({}, status);
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('encapsula falha de rede e JSON inválido em WeatherServiceError', async () => {
      const cause = new TypeError('Failed to fetch');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));
      await expect(getWeather(CITY)).rejects.toMatchObject({ name: 'WeatherServiceError', cause });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{')));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('aborta após dez segundos e libera o timer sem retry', async () => {
      vi.useFakeTimers();
      let requestSignal: AbortSignal | undefined;
      const fetchMock = vi.fn(
        (_url: string, { signal }: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            if (!signal) throw new Error('AbortSignal ausente');
            requestSignal = signal;
            signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      );
      vi.stubGlobal('fetch', fetchMock);
      const result = expect(getWeather(CITY)).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'A consulta demorou mais de 10 segundos. Tente novamente.',
      });
      await vi.advanceTimersByTimeAsync(9_999);
      expect(requestSignal?.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await result;
      expect(requestSignal?.aborted).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('libera o timer após sucesso e resposta incompleta', async () => {
      vi.useFakeTimers();
      mockResponse(forecastResponse());
      await getWeather(CITY);
      expect(vi.getTimerCount()).toBe(0);
      mockResponse({});
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  it('envia o nome aparado e codificado com os parâmetros de geocodificação', async () => {
    const fetchMock = mockResponse({});

    await searchCities('  São Paulo & região?  ');

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o%3F&count=5&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it('mapeia todos os resultados para City na ordem recebida', async () => {
    mockResponse({
      results: [
        {
          id: 3448439,
          name: 'São Paulo',
          admin1: 'São Paulo',
          country: 'Brasil',
          latitude: -23.55,
          longitude: -46.63,
          timezone: 'America/Sao_Paulo',
        },
        { name: 'Outra cidade', latitude: 10, longitude: 20 },
      ],
    });

    expect(await searchCities('São Paulo')).toEqual([
      {
        name: 'São Paulo',
        region: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
      { name: 'Outra cidade', latitude: 10, longitude: 20 },
    ]);
  });

  it.each([{}, { results: [] }])('retorna [] quando não há resultados: %j', async (body) => {
    mockResponse(body);
    expect(await searchCities('inexistente')).toEqual([]);
  });

  it.each([400, 429, 500])('lança WeatherServiceError para HTTP %i', async (status) => {
    const fetchMock = mockResponse({}, status);

    await expect(searchCities('Recife')).rejects.toBeInstanceOf(WeatherServiceError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('propaga falha de rede como erro tipado, preservando a causa', async () => {
    const cause = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));

    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      cause,
      message:
        'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    });
  });

  it.each([
    null,
    [],
    { results: null },
    { results: {} },
    { results: [null] },
    { results: [{ name: 'Recife' }] },
    { results: [{ name: '', latitude: 0, longitude: 0 }] },
    { results: [{ name: 'Recife', latitude: 91, longitude: 0 }] },
    { results: [{ name: 'Recife', latitude: 0, longitude: 181 }] },
    { results: [{ name: 'Recife', latitude: 0, longitude: 0, admin1: 123 }] },
  ])('rejeita payload inválido: %j', async (body) => {
    mockResponse(body);
    await expect(searchCities('Recife')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('rejeita JSON inválido como erro tipado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{')));
    await expect(searchCities('Recife')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('aborta após dez segundos sem retry e libera o timer', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn(
      (_url: string, { signal }: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          if (!signal) throw new Error('AbortSignal ausente');
          requestSignal = signal;
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const result = expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A consulta demorou mais de 10 segundos. Tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(requestSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await result;
    expect(requestSignal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('libera o timer após sucesso ou falha HTTP', async () => {
    vi.useFakeTimers();
    mockResponse({});
    await searchCities('Recife');
    expect(vi.getTimerCount()).toBe(0);

    mockResponse({}, 500);
    await expect(searchCities('Recife')).rejects.toBeInstanceOf(WeatherServiceError);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe.each([
  { operation: 'searchCities', request: () => searchCities('Recife') },
  {
    operation: 'getWeather',
    request: () => getWeather({ name: 'Recife', latitude: -8.05, longitude: -34.88 }),
  },
])('fetchWithTimeout via $operation', ({ request }) => {
  it('mantém o timeout ativo até terminar a leitura do JSON', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const response = new Response('{}');
    vi.spyOn(response, 'json').mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          requestSignal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    const fetchMock = vi.fn((_url: string, { signal }: RequestInit) => {
      requestSignal = signal ?? undefined;
      return Promise.resolve(response);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = expect(request()).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A consulta demorou mais de 10 segundos. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await result;
    expect(requestSignal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    {
      cause: new DOMException('Aborted', 'AbortError'),
      message: 'A consulta demorou mais de 10 segundos. Tente novamente.',
    },
    {
      cause: Object.assign(new Error('Aborted'), { name: 'AbortError' }),
      message: 'A consulta demorou mais de 10 segundos. Tente novamente.',
    },
    {
      cause: new TypeError('Failed to fetch'),
      message:
        'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    },
  ])('converte a rejeição em "$message" e libera o timer', async ({ cause, message }) => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(cause);
    vi.stubGlobal('fetch', fetchMock);

    const result = request();
    await expect(result).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(result).rejects.toMatchObject({ message, cause });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
