import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { hasPublishedBlogPosts } from '../src/lib/blog-files.mjs';

const pages = [
  '/',
  '/events',
  '/events/un-portal-al-erotismo-consciente',
  '/team',
  '/about',
  '/faq',
  '/privacy',
  '/contact',
  // Blog pages only exist (meaningfully) while a post is published.
  ...(hasPublishedBlogPosts()
    ? ['/blog', '/blog/volver-a-la-respiracion']
    : []),
];

for (const path of pages) {
  test(`${path} has no automatically detectable a11y violations (light mode)`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${path} has no automatically detectable a11y violations (dark mode)`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.click('#theme-toggle');
    // PrimeVue form fields/buttons animate color over 0.2s; scanning
    // immediately after the click can catch axe mid-transition on a
    // washed-out intermediate color that was never actually shown to a
    // user for more than a couple of frames.
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
