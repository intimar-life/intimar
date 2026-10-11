## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Light and dark mode

Every new feature must work in both themes (the toggle adds `.app-dark` to `<html>`), and be tested in both:

- **New pages** are covered automatically: `e2e/accessibility.spec.ts` discovers every page from the built sitemap and runs axe in light mode, then again after switching to dark with the real `#theme-toggle`. A page deliberately left out of the sitemap (noindexed) must be added to its `UNLISTED` list.
- **Components with their own palette** (fixed colours instead of the `ink-*` tokens, which already flip with the theme), like `TeamCard.astro`, need a test in `e2e/dark-mode.spec.ts` asserting that toggling the theme switches them to their dark palette.
