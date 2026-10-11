import { test, expect } from '@playwright/test';
import { hasPublishedBlogPosts } from '../src/lib/blog-files.mjs';
import { CONTACT_PAGE_ENABLED } from '../src/lib/site';

const blogPublished = hasPublishedBlogPosts();

test('homepage renders the hero and featured events', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/Vuelve a tu cuerpo/);
  await expect(page.locator('main img').first()).toBeVisible();
});

test('events listing renders real card images, not [object Object]', async ({
  page,
}) => {
  await page.goto('/events');
  const images = page.locator('a[href^="/events/"] img');
  await expect(images.first()).toBeVisible();

  const srcs = await images.evaluateAll((imgs) =>
    imgs.map((img) => (img as HTMLImageElement).getAttribute('src')),
  );
  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) {
    expect(src).not.toContain('object');
    expect(src).toMatch(/^\/_astro\/.+\.(webp|jpg|jpeg|png)/);
  }
});

test('event detail page renders content, hosts, and a valid Event schema', async ({
  page,
}) => {
  await page.goto('/events/un-portal-al-erotismo-consciente');

  // Sign-up goes to the WhatsApp Business short link (no phone number),
  // and Umami counts each click as an inscription for this event.
  const signUp = page.getByRole('link', { name: 'Quiero Inscribirme' });
  await expect(signUp).toHaveAttribute('href', /^https:\/\/wa\.me\/message\//);
  await expect(signUp).toHaveAttribute(
    'data-umami-event',
    'inscripcion_whatsapp',
  );
  await expect(signUp).toHaveAttribute(
    'data-umami-event-evento',
    'un-portal-al-erotismo-consciente',
  );
  await expect(page.locator('h1')).toHaveText(
    'Un Portal al Erotismo Consciente',
  );
  await expect(page.getByRole('link', { name: 'Klaus Hott' })).toBeVisible();

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const data = JSON.parse(jsonLd ?? '{}');
  expect(data['@type']).toBe('Event');
  expect(data.name).toBe('Un Portal al Erotismo Consciente');
  // One offer per person, plus one per couple when the event has it.
  const offers = [data.offers].flat();
  expect(offers.map((o: { name: string }) => o.name)).toEqual([
    'Por persona',
    'Por pareja',
  ]);
  expect(
    offers.every((o: { price: unknown }) => typeof o.price === 'number'),
  ).toBe(true);
  expect(data.image[0]).toMatch(/^https:\/\//);
});

test('header shows the Blog link only while a post is published', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav.getByRole('link', { name: 'Blog' })).toHaveCount(
    blogPublished ? 1 : 0,
  );
});

test('header and footer link to the contact page only while it is enabled', async ({
  page,
}) => {
  await page.goto('/');
  const expected = CONTACT_PAGE_ENABLED ? 1 : 0;
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav.getByRole('link', { name: 'Contacto' })).toHaveCount(
    expected,
  );
  await expect(page.getByRole('link', { name: 'Escríbenos' })).toHaveCount(
    expected,
  );
});

test('blog listing renders real card images, not [object Object]', async ({
  page,
}) => {
  test.skip(!blogPublished, 'No blog posts are published');
  await page.goto('/blog');
  const images = page.locator('a[href^="/blog/"] img');
  await expect(images.first()).toBeVisible();

  const srcs = await images.evaluateAll((imgs) =>
    imgs.map((img) => (img as HTMLImageElement).getAttribute('src')),
  );
  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) {
    expect(src).not.toContain('object');
    expect(src).toMatch(/^\/_astro\/.+\.(webp|jpg|jpeg|png)/);
  }
});

test('blog post renders content, author, adjacent post, and a valid BlogPosting schema', async ({
  page,
}) => {
  test.skip(!blogPublished, 'No blog posts are published');
  await page.goto('/blog/volver-a-la-respiracion');
  await expect(page.locator('h1')).toHaveText('Volver a la respiración');
  await expect(
    page.getByRole('link', { name: 'Fernanda Pinochet' }),
  ).toBeVisible();

  // This is the newer of the two example posts, so only "previous" (the
  // older one) should appear in the adjacent-post section — not "next".
  await expect(
    page.getByRole('link', { name: 'Una mirada desde afuera' }),
  ).toBeVisible();

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const data = JSON.parse(jsonLd ?? '{}');
  expect(data['@type']).toBe('BlogPosting');
  expect(data.headline).toBe('Volver a la respiración');
  expect(data.author.name).toBe('Fernanda Pinochet');
  expect(data.publisher.name).toBe('Intimar');
});

test('team listing renders photos and homepage cards link into facilitator sections', async ({
  page,
}) => {
  await page.goto('/team');
  await expect(page.locator('img').first()).toBeVisible();

  await page.goto('/');
  await page
    .getByRole('link', { name: /Antoine Lacoste/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/team#antoine-lacoste/);
  await expect(page.locator('#antoine-lacoste h2')).toHaveText(
    'Antoine Lacoste',
  );
});

test('facilitator bios start collapsed and expand on "Ver más"', async ({
  page,
}) => {
  await page.goto('/team');
  const section = page.locator('#klaus-hott');
  const bio = section.locator('[data-bio-content]');
  const toggle = section.getByRole('button', { name: 'Ver más' });

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const collapsedHeight = (await bio.boundingBox())!.height;

  await toggle.click();
  const expanded = section.getByRole('button', { name: 'Ver menos' });
  await expect(expanded).toHaveAttribute('aria-expanded', 'true');
  expect((await bio.boundingBox())!.height).toBeGreaterThan(collapsedHeight);

  await expanded.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('faq answers open and the page carries FAQPage structured data', async ({
  page,
}) => {
  await page.goto('/faq');
  const question = page.getByText('¿Es para parejas o para personas solas?');
  const answer = page.getByText('Para ambas.');
  await expect(answer).toBeHidden();
  await question.click();
  await expect(answer).toBeVisible();

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const data = JSON.parse(jsonLd ?? '{}');
  expect(data['@type']).toBe('FAQPage');
  expect(data.mainEntity.length).toBeGreaterThan(0);
});

test('admin panel is noindexed and offers the GitHub login', async ({
  page,
}) => {
  await page.goto('/admin');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex',
  );
  await expect(
    page.getByRole('button', { name: 'Entrar con GitHub' }),
  ).toBeVisible();
});

test('unknown routes render the custom 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText(/Esta página no existe/);
  await expect(
    page.getByRole('link', { name: 'Ver Próximos Retiros' }),
  ).toBeVisible();
});
