import type { App } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// Aura's default "primary" is emerald green, which clashes with the site's
// warm terracotta palette (visible on Carousel dots and focus rings).
// Swapping in a terracotta ramp keeps PrimeVue's own interactive chrome
// consistent with the buttons we style by hand.
const TantraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf6ef',
      100: '#f8e8d6',
      200: '#f0cca3',
      300: '#e3a86e',
      400: '#d0824a',
      500: '#c2703d',
      600: '#a85a30',
      700: '#8a4726',
      800: '#6b371f',
      900: '#4a2717',
      950: '#2e180e',
    },
    // Aura's default light-mode placeholder color ({surface.500}, slate-500)
    // only clears 4.43:1 against our warm brand-50 page background —
    // just under the 4.5:1 AA minimum (surfaced by the events search
    // input's "Buscar retiros o ubicaciones" placeholder). Darkening it
    // one step gives real headroom instead of resting on a fractional
    // pass/fail margin.
    //
    // formField.background/borderColor: Aura's own defaults here are its
    // generic slate/zinc surface scale (slate-300 border on white in light,
    // zinc-600 border on zinc-950 in dark) — completely untouched by the
    // brand's ink/surface tokens above, and measured at only 1.48:1 (light)
    // / 2.57:1 (dark) against the input's own background, well under the
    // 3:1 WCAG 1.4.11 non-text-contrast minimum for an input's boundary.
    // `--color-ink-500` is the ramp's documented border-safe rung (see its
    // definition in global.css) and clears 3:1 in both themes since it
    // flips automatically with `.app-dark`; `--color-surface` matches every
    // other card/panel on the site instead of Aura's unrelated zinc scale.
    colorScheme: {
      light: {
        formField: {
          placeholderColor: '{surface.600}',
          background: 'var(--color-surface)',
          borderColor: 'var(--color-ink-500)',
          hoverBorderColor: 'var(--color-ink-600)',
        },
      },
      dark: {
        formField: {
          background: 'var(--color-surface)',
          borderColor: 'var(--color-ink-500)',
          hoverBorderColor: 'var(--color-ink-400)',
        },
      },
    },
  },
});

// PrimeVue's own internal strings (filter/search messages, ARIA labels)
// default to English and don't follow the page's own copy — the site is
// es-CL only, so these need to be set explicitly.
const localeEsCl = {
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sem',
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy',
  weak: 'Débil',
  medium: 'Media',
  strong: 'Fuerte',
  passwordPrompt: 'Ingresa una contraseña',
  emptyFilterMessage: 'No se encontraron resultados',
  searchMessage: '{0} resultados disponibles',
  selectionMessage: '{0} elementos seleccionados',
  emptySelectionMessage: 'Ningún elemento seleccionado',
  emptySearchMessage: 'No se encontraron resultados',
  emptyMessage: 'No hay opciones disponibles',
  choose: 'Elegir',
  upload: 'Subir',
  cancel: 'Cancelar',
  completed: 'Completado',
  pending: 'Pendiente',
  fileChosenMessage: '{0} archivos',
  noFileChosenMessage: 'Ningún archivo seleccionado',
  fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
  dayNames: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthNamesShort: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ],
  aria: {
    close: 'Cerrar',
    previous: 'Anterior',
    next: 'Siguiente',
    navigation: 'Navegación',
    selectAll: 'Seleccionar todo',
    unselectAll: 'Deseleccionar todo',
    slide: 'Diapositiva',
    slideNumber: '{slideNumber}',
    // Carousel's prev/next nav buttons and page-indicator dots read these
    // three keys directly (see primevue/carousel's ariaPageLabel/
    // prevPageLabel/nextPageLabel) rather than the generic previous/next
    // above — without them PrimeVue falls back to its English defaults
    // ("Previous Page", "Next Page", "Page 1"), the one place on the site
    // a screen-reader user hit un-translated strings (Testimonials.vue).
    prevPageLabel: 'Página anterior',
    nextPageLabel: 'Página siguiente',
    pageLabel: 'Página {page}',
  },
};

// Runs once per Vue island Astro hydrates. Registers PrimeVue on
// every component tree so imported components (Dialog, Carousel, etc.)
// work without repeating this setup in each island.
export default (app: App) => {
  app.use(PrimeVue, {
    theme: {
      preset: TantraPreset,
      options: {
        darkModeSelector: '.app-dark',
      },
    },
    locale: localeEsCl,
    license: import.meta.env.PUBLIC_PRIMEVUE_LICENSE_KEY,
  });
};
