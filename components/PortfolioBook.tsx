'use client';

/**
 * PortfolioBook — mounts the page-flip engine and owns everything about the
 * physical object: orientation, current spread, keyboard input, preloading.
 *
 * How it fits together:
 *  - The engine runs in `stretch` + `autoSize` mode: page-flip sizes the book
 *    from the width of its host box and switches to a single page on its own
 *    when that width drops below two minimum pages. Responsive behaviour is
 *    therefore plain CSS on `.book-host` — no React resize state, no rebuilds.
 *  - The `.page` elements are created imperatively in a memo (built once, on
 *    the client) so page-flip can move/destroy them freely; it removes its own
 *    DOM on destroy().
 *  - The live book box is published as `--book-w` / `--book-h` on `:root`, so
 *    the floating controls can anchor to the physical book from anywhere.
 *  - The `flip` event reports the LEFT page of the new spread, which is exactly
 *    the `current` index the state helpers in lib/portfolio.ts expect.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PageFlip } from 'page-flip';

import {
  FLIP_DURATION,
  MAX_PAGE_WIDTH,
  MIN_PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PAGES,
  PRELOAD,
  getBookState,
  type BookState,
  type Orientation,
} from '@/lib/portfolio';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface PortfolioBookProps {
  onStateChange: (state: BookState) => void;
  /** Filled with { flipNext, flipPrev } once the engine exists. */
  apiRef?: React.MutableRefObject<PortfolioBookHandle | null>;
  /** Rendered inside the stage, above the book (floating controls). */
  children?: ReactNode;
}

export interface PortfolioBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  /** Jump instantly (no flip animation) to a page index. */
  jumpTo: (page: number) => void;
}

export function PortfolioBook({ onStateChange, apiRef, children }: PortfolioBookProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null); // React-owned anchor; CSS sizes it
  const bookRef = useRef<HTMLDivElement | null>(null); // engine root element
  const engineRef = useRef<PageFlip | null>(null);
  const currentRef = useRef(0);
  /** Latest `report`, so imperative jumps can refresh UI state too. */
  const reportRef = useRef<() => void>(() => {});

  const [ready, setReady] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>('landscape');

  const reducedMotion = usePrefersReducedMotion();

  /* ------------------------------ page DOM ------------------------------ */
  // Built exactly once, on the client. page-flip takes ownership of these nodes.
  const pageEls = useMemo(() => {
    if (typeof document === 'undefined') return [];
    return PAGES.map((page, index) => {
      const el = document.createElement('div');
      el.className = 'page';
      el.dataset.index = String(index);
      if (page.src) {
        const img = document.createElement('img');
        img.alt = page.label;
        img.draggable = false;
        img.decoding = 'async';
        // Distant pages stay lazy; promoteNeighbours() promotes what's near.
        img.loading = index <= PRELOAD.ahead ? 'eager' : 'lazy';
        img.fetchPriority = index <= 1 ? 'high' : 'low';
        img.addEventListener('load', () => el.classList.add('is-loaded'));
        img.addEventListener('error', () => el.classList.add('is-error'));
        img.src = page.src;
        el.appendChild(img);
      } else {
        el.classList.add('page--blank', 'is-loaded');
      }
      return el;
    });
  }, []);

  /* ----------------------------- preloading ----------------------------- */
  // Keep a window of pages around the current position eager + high priority;
  // everything further out stays lazy so the browser never decodes the whole
  // book up front.
  const promoteNeighbours = useCallback(
    (current: number) => {
      currentRef.current = current;
      const from = Math.max(0, current - PRELOAD.behind);
      const to = Math.min(PAGES.length - 1, current + PRELOAD.ahead);
      for (let i = from; i <= to; i += 1) {
        const page = PAGES[i];
        if (!page.src) continue;
        const img = pageEls[i]?.querySelector('img');
        if (!(img instanceof HTMLImageElement)) continue;
        if (!img.complete) {
          img.loading = 'eager';
          img.fetchPriority = 'high';
          if (!img.src) img.src = page.src;
        }
      }
    },
    [pageEls],
  );

  /* ---------------------------- engine mount ---------------------------- */

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const book = document.createElement('div');
    book.className = 'book';
    // Constant gutter shading across the open spread.
    const gutter = document.createElement('div');
    gutter.className = 'book__gutter';
    book.appendChild(gutter);
    host.appendChild(book);
    bookRef.current = book;

    const engine = new PageFlip(book, {
      startPage: 0,
      // Stretch mode: the book follows the host box; page-flip owns the ratio,
      // the single-page switch, and window resizes.
      size: 'stretch',
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      minWidth: MIN_PAGE_WIDTH,
      maxWidth: MAX_PAGE_WIDTH,
      minHeight: 100,
      maxHeight: 2000,
      autoSize: true,
      usePortrait: true,
      drawShadow: true,
      flippingTime: reducedMotion ? 1 : FLIP_DURATION,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: false,
      clickEventForward: false,
      swipeDistance: 25,
      showPageCorners: true,
      disableFlipByClick: false,
      startZIndex: 5,
    });

    const report = () => {
      const nextOrientation = engine.getOrientation();
      setOrientation(nextOrientation);
      book.classList.toggle('book--portrait', nextOrientation === 'portrait');
      const current = engine.getCurrentPageIndex();
      // The stacked-page fore-edges only make sense when real pages are stacked
      // behind them: hide them on the closed-cover and final-page states.
      book.classList.toggle('book--first', current <= 0);
      book.classList.toggle('book--last', current >= PAGES.length - 1);
      promoteNeighbours(current);
      onStateChange(getBookState(current, nextOrientation));
    };

    engine.on('flip', report);
    engine.on('changeOrientation', report);
    reportRef.current = report;

    engine.loadFromHTML(pageEls as unknown as HTMLElement[]);
    engineRef.current = engine;
    setReady(true);

    // Publish the live book box as CSS vars on :root so every control
    // (nav chevrons, CV download, contact icons) can anchor to the physical
    // book instead of guessing viewport positions.
    const root = document.documentElement;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      root.style.setProperty('--book-w', `${Math.round(box.width)}px`);
      root.style.setProperty('--book-h', `${Math.round(box.height)}px`);
    });
    ro.observe(book);

    // Handy for debugging/support: poke at the engine from the console.
    (window as unknown as Record<string, unknown>).__portfolioBook = engine;

    // Second pass once the wrapper has its aspect-ratio padding.
    const settle = window.setTimeout(() => {
      engine.update();
      report();
    }, 60);

    return () => {
      window.clearTimeout(settle);
      ro.disconnect();
      engineRef.current = null;
      engine.destroy();
      book.remove();
      bookRef.current = null;
      delete (window as unknown as Record<string, unknown>).__portfolioBook;
    };
    // pageEls is stable; onStateChange is expected to be stable (useCallback upstream).
  }, [reducedMotion, onStateChange, pageEls, promoteNeighbours]);

  /* ------------------------------- public ------------------------------- */

  const flipNext = useCallback(() => engineRef.current?.flipNext(), []);
  const flipPrev = useCallback(() => engineRef.current?.flipPrev(), []);
  const jumpTo = useCallback((page: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const clamped = Math.max(0, Math.min(page, PAGES.length - 1));
    engine.turnToPage(clamped); // instant, no flip animation
    reportRef.current(); // `flip` may not fire for silent turns — refresh anyway
  }, []);

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = { flipNext, flipPrev, jumpTo };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, flipNext, flipPrev, jumpTo]);

  /* ------------------------------ keyboard ------------------------------ */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        engine.flipNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        engine.flipPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* --------------------------- initial preload --------------------------- */

  useEffect(() => {
    if (!ready) return;
    promoteNeighbours(engineRef.current?.getCurrentPageIndex() ?? 0);
  }, [ready, promoteNeighbours]);

  return (
    <div className="book-stage" ref={stageRef}>
      <div className="book-stage__inner">
        <div className="book-host" ref={hostRef} aria-label="Portfolio book" role="group" />
      </div>
      {children}
    </div>
  );
}
