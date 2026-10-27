import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockWeatherData } from '../../src/mocks/weather';
import { searchMockWeather } from '../../src/services/mockWeatherService';

afterEach(() => vi.unstubAllGlobals());

describe('Busca mock', () => {
  it.each([
    'São Paulo',
    '  SAO PAULO  ',
    'são paulo',
  ])('encontra o exemplo com "%s"', async (query) => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await searchMockWeather(query)).toEqual(mockWeatherData);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('não atribui os dados de São Paulo a outra cidade', async () => {
    expect(await searchMockWeather('Recife')).toBeNull();
  });
});
