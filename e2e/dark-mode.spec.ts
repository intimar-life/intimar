import { test, expect } from '@playwright/test';

// Read the color a canvas resolves a CSS color string to, so oklch()
// values (which getComputedStyle can return as-is in Chromium) compare
// the same way a browser actually paints them.
async function toRgb(page: import('@playwright/test').Page, color: string) {
  return page.evaluate((c) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, color);
}

function contrastRatio([r1, g1, b1]: number[], [r2, g2, b2]: number[]) {
  const luminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test('theme toggle switches to dark mode and persists across reload', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/app-dark/);

  await page.click('#theme-toggle');
  await expect(page.locator('html')).toHaveClass(/app-dark/);
  await expect(page.locator('#theme-toggle')).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/app-dark/);
});

test('hero heading stays readable against its fixed-dark background in dark mode', async ({
  page,
}) => {
  await page.goto('/');
  await page.click('#theme-toggle');

  const h1 = page.locator('h1');
  const heroSection = page.locator('.hero-candlelit');
  const [textColor, bgColor] = await Promise.all([
    h1.evaluate((el) => getComputedStyle(el).color),
    heroSection.evaluate((el) => getComputedStyle(el).backgroundColor),
  ]);
  const [textRgb, bgRgb] = await Promise.all([
    toRgb(page, textColor),
    toRgb(page, bgColor),
  ]);

  expect(contrastRatio(textRgb, bgRgb)).toBeGreaterThanOrEqual(4.5);
});

test('card surfaces switch away from a literal white background in dark mode', async ({
  page,
}) => {
  await page.goto('/events');
  await page.click('#theme-toggle');

  // The card has a `transition` utility on background-color, so it animates
  // from white to the dark surface color rather than switching instantly —
  // a one-shot evaluate() right after the click can catch it mid-transition.
  // toHaveCSS polls until it settles instead of asserting on a single frame.
  const card = page.locator('a[href^="/events/"]').first();
  await expect(card).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('facilitator cards use the light palette, and the maroon one in dark mode', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('.team-card').first();

  // --tc-bg in TeamCard.astro: paper in light mode, the hero maroon in dark.
  await expect(card).toHaveCSS('background-color', 'rgb(251, 245, 238)');
  await page.click('#theme-toggle');
  await expect(card).toHaveCSS('background-color', 'rgb(60, 10, 13)');
});
