import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const url = 'http://127.0.0.1:4173/';
const server = await preview({
  logLevel: 'error',
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
let chrome;

try {
  chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });

  const result = await lighthouse(url, {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    formFactor: 'mobile',
    throttlingMethod: 'simulate',
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      disabled: false,
    },
  });
  const audits = result?.lhr.audits;
  const lcp = audits?.['largest-contentful-paint']?.numericValue;
  const cls = audits?.['cumulative-layout-shift']?.numericValue;

  if (typeof lcp !== 'number' || typeof cls !== 'number') {
    throw new Error('O Lighthouse não retornou valores numéricos para LCP e CLS.');
  }

  console.log(`LCP: ${Math.round(lcp)} ms (limite: 2500 ms)`);
  console.log(`CLS: ${cls.toFixed(3)} (limite: 0.1)`);

  if (lcp > 2500 || cls > 0.1) {
    process.exitCode = 1;
    console.error('A auditoria excedeu um ou mais limites definidos em NFR-03.');
  }
} finally {
  await chrome?.kill();
  await server.close();
}
