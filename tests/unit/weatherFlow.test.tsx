import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

const city = {
  name: 'Recife',
  admin1: 'Pernambuco',
  country: 'Brasil',
  latitude: -8.05,
  longitude: -34.88,
};

const validForecast = {
  current: { temperature_2m: 24, weather_code: 2 },
  daily: {
    time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
    weather_code: [2, 0, 3, 61, 0],
    temperature_2m_min: [18, 19, 17, 16, 18],
    temperature_2m_max: [26, 28, 25, 22, 27],
  },
};

afterEach(() => vi.unstubAllGlobals());

describe('Consulta com respostas parciais da API', () => {
  it('informa falha de conexão e permite retry por teclado da operação de busca', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
      .mockResolvedValueOnce(new Response(JSON.stringify(validForecast)));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<App />);
    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'Recife{Enter}');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    );
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'Recife' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0][0])).toContain('geocoding-api.open-meteo.com');
    expect(String(fetchMock.mock.calls[1][0])).toContain('geocoding-api.open-meteo.com');
    expect(String(fetchMock.mock.calls[2][0])).toContain('api.open-meteo.com/v1/forecast');
    expect(screen.getByRole('heading', { name: 'Recife' })).toHaveFocus();
  });

  it('repete apenas a previsão após falha offline na segunda etapa', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify(validForecast)));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'Recife{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    );
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'Recife' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0][0])).toContain('geocoding-api.open-meteo.com');
    expect(String(fetchMock.mock.calls[1][0])).toContain('api.open-meteo.com/v1/forecast');
    expect(String(fetchMock.mock.calls[2][0])).toContain('api.open-meteo.com/v1/forecast');
  });

  it.each([
    [
      'temperatura atual sem condição',
      {
        ...validForecast,
        current: { temperature_2m: validForecast.current.temperature_2m },
      },
    ],
    [
      'previsão sem a máxima do quinto dia',
      {
        ...validForecast,
        daily: {
          ...validForecast.daily,
          temperature_2m_max: validForecast.daily.temperature_2m_max.slice(0, 4),
        },
      },
    ],
  ])('não apresenta dados parciais quando falta %s e permite tentar novamente', async (_case, partial) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
      .mockResolvedValueOnce(new Response(JSON.stringify(partial)))
      .mockResolvedValueOnce(new Response(JSON.stringify(validForecast)));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'Recife{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível obter os dados');
    expect(screen.queryByText('24°C')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Recife' })).toBeInTheDocument();
    expect(screen.getByText('24°C')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0][0])).toContain('geocoding-api.open-meteo.com');
    expect(String(fetchMock.mock.calls[1][0])).toContain('api.open-meteo.com/v1/forecast');
    expect(String(fetchMock.mock.calls[2][0])).toContain('api.open-meteo.com/v1/forecast');
  });
});
