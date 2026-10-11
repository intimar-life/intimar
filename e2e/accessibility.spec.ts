import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Every page is scanned in BOTH themes, and the page list is discovered
// rather than hand-written: every public page comes from the built sitemap,
// so a new page (or a feature on one) gets light/dark coverage without
// anyone remembering to add it here. The build runs before these tests
// (CI's Build step; locally the Playwright webServer command), so
// dist/sitemap-0.xml is current.
function sitemapPaths(): string[] {
  const xml = readFileSync(
    new URL('../dist/sitemap-0.xml', import.meta.url),
    'utf8',
  );
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => new URL(url).pathname,
  );
}

// Built and reachable, but deliberately left out of the sitemap (noindexed):
// still shown to people who land on them, so still checked.
const UNLISTED = [
  '/admin/',
  '/contact/',
  '/blog/',
  '/this-page-does-not-exist',
];

const pages = [...new Set([...sitemapPaths(), ...UNLISTED])];

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}

test('the page list covers the whole site', () => {
  // Guards the discovery itself: an empty or tiny sitemap would make every
  // test below pass vacuously.
  expect(pages.length).toBeGreaterThan(5);
  expect(pages).toContain('/');
});

for (const path of pages) {
  test(`${path} has no automatically detectable a11y violations (light mode)`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator('html')).not.toHaveClass(/app-dark/);
    await expectNoViolations(page);
  });

  test(`${path} switches to dark mode with no a11y violations`, async ({
    page,
  }) => {
    await page.goto(path);
    // Through the real toggle, so every page also proves it has one and
    // that it works there.
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveClass(/app-dark/);
    // PrimeVue form fields/buttons animate color over 0.2s; scanning
    // immediately after the click can catch axe mid-transition on a
    // washed-out intermediate color that was never actually shown to a
    // user for more than a couple of frames.
    await page.waitForTimeout(300);
    await expectNoViolations(page);
  });
}
