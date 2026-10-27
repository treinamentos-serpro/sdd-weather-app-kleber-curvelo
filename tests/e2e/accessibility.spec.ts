import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const seriousViolations = results.violations.filter(
    ({ impact }) => impact === 'critical' || impact === 'serious',
  );

  expect(
    seriousViolations,
    JSON.stringify(
      seriousViolations.map(({ id, help, nodes }) => ({
        id,
        help,
        elements: nodes.map(({ target }) => target),
      })),
      null,
      2,
    ),
  ).toEqual([]);
}

test('mantém os estados essenciais sem violações graves de acessibilidade', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome', 'Auditoria Axe executada uma vez no Chrome.');

  let failForecast = false;
  await page.route('https://geocoding-api.open-meteo.com/v1/search?**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('name');
    if (query === 'lento') await new Promise((resolve) => setTimeout(resolve, 300));

    await route.fulfill({
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
      json: failForecast
        ? {
            current: { temperature_2m: 24, weather_code: 2 },
            daily: {
              time: ['2026-10-27'],
              weather_code: [2],
              temperature_2m_min: [18],
              temperature_2m_max: [26],
            },
          }
        : {
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

  await page.goto('/');
  await expectNoSeriousViolations(page);

  const searchbox = page.getByRole('searchbox', { name: 'Buscar localidade' });
  await searchbox.fill('lento');
  await searchbox.press('Enter');
  await expect(page.getByRole('status')).toContainText('Carregando dados meteorológicos');
  await expectNoSeriousViolations(page);
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await expectNoSeriousViolations(page);

  failForecast = true;
  await searchbox.fill('Recife');
  await searchbox.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Resposta de clima incompleta');
  await expectNoSeriousViolations(page);

  failForecast = false;
  await searchbox.fill('inexistente');
  await searchbox.press('Enter');
  await expect(page.getByRole('status')).toContainText('Nenhuma localidade encontrada');
  await expectNoSeriousViolations(page);
});
