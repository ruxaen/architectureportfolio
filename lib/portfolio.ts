/**
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH
 * ---------------------------------------------------------------------------
 * Everything that describes the portfolio lives here:
 *   - the page list (order, files, special pages)
 *   - the book geometry (page ratio + on-screen size limits)
 *   - preloading distances
 *   - the /cv.pdf download target
 *   - the contact links
 *
 * To use your own portfolio:
 *   1. Drop your page images into /public/portfolio (WebP or AVIF, one image per page).
 *   2. Update PAGES below — keep one entry per image, in reading order.
 *      `kind` marks special pages ('cover', 'cv', 'contact', ...); everything else
 *      defaults to a normal page. Blank pages simply omit `src` — they render as
 *      empty paper and help place the CV on its own spread.
 *   3. Replace CV_URL and CONTACTS.
 *
 * Nothing else in the project needs to change. The CV download control and the
 * contact icons react automatically to which pages are currently visible.
 * ---------------------------------------------------------------------------
 */

/** Book orientation, as reported by the layout engine. */
export type Orientation = 'portrait' | 'landscape';

/** Special behaviour attached to a page. Ordinary portfolio pages use 'page'. */
export type PageKind = 'cover' | 'blank' | 'page' | 'cv' | 'contact' | 'colophon' | 'back';

/** Visual recipe for the placeholder artwork (only used by scripts/generate-pages.mjs). */
export type PageLayout =
  | 'cover'
  | 'contents'
  | 'title'
  | 'render'
  | 'drawing'
  | 'photo'
  | 'text'
  | 'cv'
  | 'contact'
  | 'colophon'
  | 'back';

export interface PortfolioPage {
  /** Image inside /public, e.g. "/portfolio/page-01.webp". Omit for a blank page. */
  src?: string;
  /** Accessible description; also used as the image alt text. */
  label: string;
  /** Special pages only. Defaults to a normal page. */
  kind?: PageKind;
  /** Placeholder artwork recipe. Safe to remove once real artwork is in place. */
  layout?: PageLayout;
}

/* -------------------------------------------------------------------------- */
/* Book geometry                                                              */
/* -------------------------------------------------------------------------- */

/** Size of ONE portfolio page — defines the aspect ratio for every page. */
export const PAGE_WIDTH = 420;
export const PAGE_HEIGHT = 594;

/** width / height of a single page (A4-ish portrait). */
export const PAGE_RATIO = PAGE_WIDTH / PAGE_HEIGHT;

/** Smallest / largest a single on-screen page is allowed to become (px). */
export const MIN_PAGE_WIDTH = 200;
export const MAX_PAGE_WIDTH = 600;

/** How many pages to keep decoded around the current position. */
export const PRELOAD = { behind: 2, ahead: 5 } as const;

/** Flip animation duration (ms). */
export const FLIP_DURATION = 720;

/* -------------------------------------------------------------------------- */
/* The book                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Reading order. Page indexes matter: with `showCover` the book opens as
 * [cover] alone, then two-page spreads, and ends with the back cover alone.
 */
export const PAGES: PortfolioPage[] = [
  { src: '/portfolio/cover.webp', label: 'Portfolio cover', kind: 'cover', layout: 'cover' },

  // Real pages — split from the provided spread mockups (scripts/split-spread.mjs).
  { src: '/portfolio/page-01.webp', label: 'I am Madiha Samar — portrait title' },
  { src: '/portfolio/page-02.webp', label: 'Introduction — observation, education, experience' },
  { src: '/portfolio/page-03.webp', label: 'Art of Noticing — collage' },
  { src: '/portfolio/page-04.webp', label: 'List of Contents' },

  { src: '/portfolio/page-05.webp', label: '01 Business School Design — title', layout: 'title' },
  { src: '/portfolio/page-06.webp', label: '01 Business School Design — view', layout: 'render' },
  { src: '/portfolio/page-07.webp', label: '01 Business School Design — drawings', layout: 'drawing' },
  { src: '/portfolio/page-08.webp', label: '01 Business School Design — detail', layout: 'photo' },

  { src: '/portfolio/page-09.webp', label: '02 Riverside Housing — title', layout: 'title' },
  { src: '/portfolio/page-10.webp', label: '02 Riverside Housing — view', layout: 'render' },
  { src: '/portfolio/page-11.webp', label: '02 Riverside Housing — drawings', layout: 'drawing' },
  { src: '/portfolio/page-12.webp', label: '02 Riverside Housing — detail', layout: 'photo' },

  { src: '/portfolio/page-13.webp', label: '03 Museum of Light — title', layout: 'title' },
  { src: '/portfolio/page-14.webp', label: '03 Museum of Light — view', layout: 'render' },
  { src: '/portfolio/page-15.webp', label: '03 Museum of Light — drawings', layout: 'drawing' },
  { src: '/portfolio/page-16.webp', label: '03 Museum of Light — detail', layout: 'photo' },

  { src: '/portfolio/page-17.webp', label: '04 Urban Market Hall — title', layout: 'title' },
  { src: '/portfolio/page-18.webp', label: '04 Urban Market Hall — view', layout: 'render' },
  { src: '/portfolio/page-19.webp', label: '04 Urban Market Hall — drawings', layout: 'drawing' },
  { src: '/portfolio/page-20.webp', label: '04 Urban Market Hall — detail', layout: 'photo' },

  { src: '/portfolio/page-21.webp', label: '05 Hilltop Retreat — title', layout: 'title' },
  { src: '/portfolio/page-22.webp', label: '05 Hilltop Retreat — view', layout: 'render' },
  { src: '/portfolio/page-23.webp', label: '05 Hilltop Retreat — drawings', layout: 'drawing' },
  { src: '/portfolio/page-24.webp', label: '05 Hilltop Retreat — detail', layout: 'photo' },

  { src: '/portfolio/page-25.webp', label: '06 Transit Interchange — title', layout: 'title' },
  { src: '/portfolio/page-26.webp', label: '06 Transit Interchange — view', layout: 'render' },
  { src: '/portfolio/page-27.webp', label: '06 Transit Interchange — drawings', layout: 'drawing' },
  { src: '/portfolio/page-28.webp', label: '06 Transit Interchange — detail', layout: 'photo' },

  { src: '/portfolio/page-29.webp', label: 'Process — notes', layout: 'text' },
  { src: '/portfolio/page-30.webp', label: 'Process — studies', layout: 'photo' },

  { label: 'Blank', kind: 'blank' },
  { src: '/portfolio/cv.webp', label: 'Curriculum vitae', kind: 'cv', layout: 'cv' },

  { src: '/portfolio/contact.webp', label: 'Contact', kind: 'contact', layout: 'contact' },
  { src: '/portfolio/colophon.webp', label: 'Colophon', kind: 'colophon', layout: 'colophon' },

  { src: '/portfolio/back.webp', label: 'Back cover', kind: 'back', layout: 'back' },
];

/* -------------------------------------------------------------------------- */
/* Download & contact                                                         */
/* -------------------------------------------------------------------------- */

/** Place cv.pdf in /public. */
export const CV_URL = '/cv.pdf';
/** Suggested file name when the visitor downloads the CV. */
export const CV_FILENAME = 'Madiha-Samar-CV.pdf';

export type ContactIcon = 'mail' | 'linkedin' | 'github' | 'behance' | 'instagram' | 'link';

export interface ContactLink {
  id: string;
  label: string;
  href: string;
  icon: ContactIcon;
}

/** Replace these handles with the real ones. */
export const CONTACTS: ContactLink[] = [
  { id: 'email', label: 'Email', href: 'mailto:studio@example.com', icon: 'mail' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle', icon: 'linkedin' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/your-handle', icon: 'github' },
  { id: 'behance', label: 'Behance', href: 'https://www.behance.net/your-handle', icon: 'behance' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/your-handle', icon: 'instagram' },
];

export const SITE = {
  name: 'Madiha Samar',
  tagline: 'Architectural Portfolio',
  label: 'Portfolio',
  description: 'A collection of spaces, ideas and possibilities — an architectural portfolio presented as a book.',
} as const;

/* -------------------------------------------------------------------------- */
/* Scene chrome (the quiet text around the book)                              */
/* -------------------------------------------------------------------------- */

/** Stacked list, bottom-left of the scene. Purely environmental. */
export const SCENE_CHAPTERS = ['Architecture', 'Urbanism', 'People', 'Nature'] as const;

/** Bottom-right hint. */
export const SCENE_HINT = 'Scroll or use arrows';

/** Top-right section links. `page` jumps straight to that book page. */
export function indexOfKind(kind: PageKind): number {
  return PAGES.findIndex((p) => p.kind === kind);
}

export const SCENE_NAV = [
  { id: 'portfolio', label: 'Portfolio', page: 0 },
  { id: 'cv', label: 'CV', page: indexOfKind('cv') },
  { id: 'contact', label: 'Contact', page: indexOfKind('contact') },
] as const;

/* -------------------------------------------------------------------------- */
/* Derived book state                                                         */
/* -------------------------------------------------------------------------- */

export interface BookState {
  /** Index (from 0) of the page the engine reports as current. */
  current: number;
  total: number;
  orientation: Orientation;
  /** 1-based page number shown in the counter (rightmost visible page). */
  pageNumber: number;
  /** Page indexes currently on screen (2 in landscape, 1 in portrait). */
  indexes: number[];
  /** The CV page is part of the visible spread. */
  showCv: boolean;
  showContact: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

export function pageKind(page: PortfolioPage | undefined): PageKind {
  return page?.kind ?? 'page';
}

/** Index of the first page with `kind` (or -1). Used by the scene nav links. */
export { indexOfKind as firstIndexOfKind };

const clampIndex = (index: number) => Math.max(0, Math.min(index, PAGES.length - 1));

/** Which page indexes are on screen for a given engine position. */
export function visibleIndexes(current: number, orientation: Orientation): number[] {
  const total = PAGES.length;
  const c = clampIndex(current);
  if (orientation === 'portrait') return [c];
  if (c <= 0) return [0]; // closed cover, shown alone
  if (c >= total - 1) return [total - 1]; // back cover, shown alone
  return [c, c + 1];
}

/**
 * Everything the UI needs for a given page index, in one place, so the CV and
 * contact controls stay in sync automatically.
 */
export function getBookState(current: number, orientation: Orientation = 'landscape'): BookState {
  const total = PAGES.length;
  const safeCurrent = clampIndex(current);
  const indexes = visibleIndexes(safeCurrent, orientation);
  const kinds = indexes.map((i) => pageKind(PAGES[i]));

  return {
    current: safeCurrent,
    total,
    orientation,
    pageNumber: indexes[indexes.length - 1] + 1,
    indexes,
    showCv: kinds.includes('cv'),
    showContact: kinds.includes('contact'),
    hasPrev: safeCurrent > 0,
    hasNext: safeCurrent < total - 1,
  };
}
