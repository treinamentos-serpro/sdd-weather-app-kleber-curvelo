import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search?**', (route) => {
    const query = new URL(route.request().url()).searchParams.get('name');
    return route.fulfill({
      json: {
        results:
          query === 'inexistente'
            ? []
            : [
                {
                  name: 'Recife',
                  admin1: 'Pernambuco',
                  country: 'Brasil',
                  latitude: -8.05,
                  longitude: -34.88,
                  timezone: 'America/Recife',
                },
              ],
      },
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?**', (route) =>
    route.fulfill({
      json: {
        current: { temperature_2m: 24, weather_code: 2 },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [2, 0, 3, 61, 0],
          temperature_2m_min: [18, 19, 17, 16, 18],
          temperature_2m_max: [26, 28, 25, 22, 27],
        },
      },
    }),
  );
});

for (const width of [320, 768, 1280]) {
  test(`consulta via API sem rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const apiRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('open-meteo.com/')) apiRequests.push(request.url());
    });
    await page.goto('/');
    await expect(page.getByRole('status')).toContainText('Informe uma localidade');
    await expect(page.getByRole('listitem')).toHaveCount(0);
    expect(apiRequests).toEqual([]);
    await page.getByRole('searchbox').fill('Recife');
    await page.getByRole('searchbox').press('Enter');
    await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recife' })).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Recife' })).toHaveCSS('outline-style', 'solid');
    await expect(page.getByRole('listitem')).toHaveCount(5);
    expect(apiRequests).toHaveLength(2);
    const forecastUrl = new URL(apiRequests[1]);
    expect(forecastUrl.searchParams.get('latitude')).toBe('-8.05');
    expect(forecastUrl.searchParams.get('longitude')).toBe('-34.88');
    expect(forecastUrl.searchParams.get('current')).toBe('temperature_2m,weather_code');
    expect(forecastUrl.searchParams.get('forecast_days')).toBe('5');
    await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    await page.getByRole('button', { name: 'Fahrenheit' }).click();
    await expect(page.getByRole('button', { name: 'Fahrenheit' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByText('75°F', { exact: true })).toBeVisible();
    await expect(page.getByText('Mín. 64°F', { exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Celsius' }).click();
    await expect(page.getByText('24°C', { exact: true })).toBeVisible();
    expect(apiRequests).toHaveLength(2);

    await page.getByRole('searchbox').fill('inexistente');
    await page.getByRole('searchbox').press('Enter');
    await expect(page.getByRole('status')).toContainText('Nenhuma localidade encontrada');
    await expect(page.getByRole('heading', { name: 'Recife' })).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('searchbox').fill('Recife');
    await page.getByRole('searchbox').press('Enter');
    await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
    expect(apiRequests).toHaveLength(5);
  });
}

test('navega por teclado com foco visível e valida busca vazia', async ({ page }) => {
  await page.goto('/');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo principal' });
  // Eventos de teclado não aguardam a montagem da interface React.
  await expect(skipLink).toBeAttached();
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveCSS(
    'outline-style',
    'solid',
  );
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Celsius' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.press('Tab');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Informe uma localidade');
});

test('entrada vazia ou só com espaços não inicia uma consulta', async ({ page }) => {
  const geocodingRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('geocoding-api.open-meteo.com')) {
      geocodingRequests.push(request.url());
    }
  });
  await page.goto('/');

  const searchbox = page.getByRole('searchbox', { name: 'Buscar localidade' });
  await searchbox.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Informe uma localidade');

  await page.keyboard.type('   ');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Informe uma localidade');
  expect(geocodingRequests).toHaveLength(0);
});

test('envia caracteres especiais na consulta de geocodificação', async ({ page }) => {
  const geocodingRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('geocoding-api.open-meteo.com')) {
      geocodingRequests.push(request.url());
    }
  });
  await page.goto('/');

  const query = 'São Paulo & região?';
  const searchbox = page.getByRole('searchbox', { name: 'Buscar localidade' });
  await searchbox.fill(query);
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  expect(geocodingRequests).toHaveLength(1);
  expect(new URL(geocodingRequests[0]).searchParams.get('name')).toBe(query);
});

test('forecast incompleto anuncia erro e permite retry por teclado', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://api.open-meteo.com/v1/forecast?**', async (route) => {
    forecastRequests++;
    if (forecastRequests === 1) {
      await route.fulfill({
        json: {
          current: { temperature_2m: 24, weather_code: 2 },
          daily: {
            time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
            weather_code: [2, 0, 3, 61, 0],
            temperature_2m_min: [18, 19, 17, 16, 18],
            temperature_2m_max: [26, 28, 25, 22],
          },
        },
      });
    } else {
      await route.fallback();
    }
  });
  await page.goto('/');

  const searchbox = page.getByRole('searchbox', { name: 'Buscar localidade' });
  await searchbox.fill('Recife');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Resposta de clima incompleta ou inválida');
  await expect(page.getByRole('heading', { name: 'Recife' })).toHaveCount(0);

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  expect(forecastRequests).toBe(2);
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeFocused();
});

test('retry de previsão repete somente o forecast da cidade escolhida', async ({ page }) => {
  let forecastRequests = 0;
  let geocodingRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('geocoding-api.open-meteo.com')) geocodingRequests++;
  });
  await page.route('https://api.open-meteo.com/v1/forecast?**', async (route) => {
    forecastRequests++;
    if (forecastRequests === 1) {
      await route.fulfill({ status: 503, json: { error: true } });
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.fallback();
    }
  });
  await page.goto('/');
  await page.getByRole('searchbox').fill('Recife');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('alert')).toContainText('Não foi possível obter os dados');
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  await expect(page.getByRole('status')).toContainText('Carregando');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  expect(geocodingRequests).toBe(1);
  expect(forecastRequests).toBe(2);
});
