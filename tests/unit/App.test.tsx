import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));
const searchMock = vi.mocked(searchCities);
const weatherMock = vi.mocked(getWeather);

beforeEach(() => {
  vi.resetAllMocks();
  searchMock.mockResolvedValue([mockWeatherData.city]);
  weatherMock.mockResolvedValue(mockWeatherData);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Interface conectada ao serviço meteorológico', () => {
  it('inicia sem mocks nem requisições e orienta a busca', () => {
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Informe uma localidade');
    expect(screen.getByRole('region', { name: 'Resultados da busca' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).not.toHaveBeenCalled();
  });

  it('busca e apresenta cidade, região, país e cinco dias completos', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('searchbox'), 'São Paulo{Enter}');
    await screen.findByRole('heading', { name: 'São Paulo' });
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveAttribute('tabindex', '-1');
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('São Paulo');
    expect(weatherMock).toHaveBeenCalledExactlyOnceWith(mockWeatherData.city);
    const current = screen.getByRole('region', { name: 'São Paulo' });
    expect(within(current).getByText('São Paulo · Brasil')).toBeInTheDocument();
    expect(within(current).getByText('24°C')).toBeInTheDocument();
    expect(within(current).getByText('Parcialmente nublado')).toBeInTheDocument();
    const days = within(screen.getByRole('region', { name: 'Previsão de 5 dias' })).getAllByRole(
      'listitem',
    );
    expect(days).toHaveLength(5);
    days.forEach((day, index) => {
      const forecast = mockWeatherData.forecast[index];
      expect(day.querySelector('time')).toHaveAttribute('datetime', forecast.date);
      expect(within(day).getByText(forecast.condition.description)).toBeInTheDocument();
      expect(within(day).getByText(`Mín. ${forecast.minTemperatureC}°C`)).toBeInTheDocument();
      expect(within(day).getByText(`${forecast.maxTemperatureC}°C`)).toBeInTheDocument();
    });
  });

  it('não exige metadados opcionais da cidade', () => {
    render(
      <CurrentWeather
        data={{
          ...mockWeatherData,
          city: { name: 'São Paulo', latitude: -23.55, longitude: -46.63 },
        }}
        unit="celsius"
      />,
    );
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('24°C')).toBeInTheDocument();
  });

  it('converte todos os valores e volta a Celsius sem consultas ou mutação', async () => {
    const user = userEvent.setup();
    const snapshot = structuredClone(mockWeatherData);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'São Paulo{Enter}');
    await screen.findByText('24°C');
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('75°F')).toBeInTheDocument();
    expect(screen.queryByText(/\d+°C/)).not.toBeInTheDocument();
    const days = screen.getAllByRole('listitem');
    const expected = [
      [64, 79],
      [66, 82],
      [63, 77],
      [61, 72],
      [64, 81],
    ];
    days.forEach((day, index) => {
      expect(within(day).getByText(`Mín. ${expected[index][0]}°F`)).toBeInTheDocument();
      expect(within(day).getByText(`${expected[index][1]}°F`)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();
    expect(screen.getByText('24°C')).toBeInTheDocument();
    expect(mockWeatherData).toEqual(snapshot);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(weatherMock).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('remove dados antigos durante loading, bloqueia reenvio e permite nova busca após vazio', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'São Paulo{Enter}');
    await screen.findByRole('heading', { name: 'São Paulo' });
    let resolveSearch: (cities: City[]) => void = () => {
      throw new Error('A busca ainda não começou.');
    };
    searchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
    );
    await user.clear(input);
    await user.type(input, 'Recife{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    const results = screen.getByRole('region', { name: 'Resultados da busca' });
    expect(results).toHaveAttribute('aria-busy', 'true');
    expect(results).not.toContainElement(screen.getByRole('status'));
    expect(input).toHaveFocus();
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscando…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.keyboard('{Enter}');
    expect(searchMock).toHaveBeenCalledTimes(2);
    await act(async () => resolveSearch([]));
    expect(results).toHaveAttribute('aria-busy', 'false');
    expect(input).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma localidade encontrada');
    await user.clear(input);
    await user.type(input, 'São Paulo{Enter}');
    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveFocus();
  });

  it('mantém busy até terminar a previsão e só então foca o resultado', async () => {
    const user = userEvent.setup();
    let resolveWeather: (data: WeatherData) => void = () => {
      throw new Error('A consulta de previsão ainda não começou.');
    };
    weatherMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveWeather = resolve;
      }),
    );
    render(<App />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'São Paulo{Enter}');
    const results = screen.getByRole('region', { name: 'Resultados da busca' });
    expect(weatherMock).toHaveBeenCalledOnce();
    expect(results).toHaveAttribute('aria-busy', 'true');
    expect(input).toHaveFocus();
    await act(async () => resolveWeather(mockWeatherData));
    expect(results).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveFocus();
  });

  it('comunica falha e repete a mesma busca sem redigitação', async () => {
    const error = new WeatherServiceError(
      'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    );
    searchMock.mockRejectedValueOnce(error);
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'São Paulo{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível obter os dados');
    expect(screen.getByRole('region', { name: 'Resultados da busca' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.queryByText('24°C')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('24°C')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toHaveFocus();
    expect(searchMock.mock.calls).toEqual([['São Paulo'], ['São Paulo']]);
  });

  it('mostra outra cidade e retry de forecast não repete geocodificação', async () => {
    const city: City = { name: 'Recife', latitude: -8.05, longitude: -34.88 };
    searchMock.mockResolvedValue([city]);
    weatherMock.mockRejectedValueOnce(
      new WeatherServiceError(
        'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
      ),
    );
    weatherMock.mockResolvedValue({ ...mockWeatherData, city });
    render(<App />);
    await userEvent.type(screen.getByRole('searchbox'), 'Recife{Enter}');
    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'Recife' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('Recife');
    expect(weatherMock.mock.calls).toEqual([[city], [city]]);
  });
});
