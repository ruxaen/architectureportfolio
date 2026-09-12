'use client';

/**
 * BookExperience — the whole scene: book, counter, navigation, fullscreen and
 * the context-aware floating controls. Owns the single piece of shared state
 * (the BookState) that drives every UI reaction.
 *
 * Phase system:
 *   'closed'  — ClosedBook visible, PortfolioBook mounted but hidden
 *   'opening' — CSS animation plays on ClosedBook; at the end the StPageFlip
 *               book cross-fades in
 *   'open'    — ClosedBook unmounted, PortfolioBook fully visible
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { PortfolioBook } from '@/components/PortfolioBook';
import type { PortfolioBookHandle } from '@/components/PortfolioBook';
import { BookControls } from '@/components/BookControls';
import { PageCounter } from '@/components/PageCounter';
import { CVDownloadButton } from '@/components/CVDownloadButton';
import { ContactLinks } from '@/components/ContactLinks';
import { FullscreenButton } from '@/components/FullscreenButton';
import { ClosedBook } from '@/components/ClosedBook';
import { SceneUI } from '@/components/SceneUI';
import { getBookState, type BookState, PAGES } from '@/lib/portfolio';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function BookExperience() {
  const apiRef = useRef<PortfolioBookHandle | null>(null);
  const [state, setState] = useState<BookState>(() => getBookState(0, 'landscape'));
  const [bookPhase, setBookPhase] = useState<'closed' | 'opening' | 'open'>('closed');

  const reducedMotion = usePrefersReducedMotion();

  const handleStateChange = useCallback((next: BookState) => setState(next), []);

  const { flipNext, flipPrev } = useMemo(
    () => ({
      flipNext: () => apiRef.current?.flipNext(),
      flipPrev: () => apiRef.current?.flipPrev(),
    }),
    [],
  );

  const progress = state.total > 1 ? state.pageNumber / state.total : 1;
  const coverSrc = PAGES[0]?.src ?? '';
  const isOpen = bookPhase === 'open';

  const handleOpen = useCallback(() => {
    if (reducedMotion) {
      // Skip animation entirely for reduced-motion users.
      setBookPhase('open');
    } else {
      setBookPhase('opening');
    }
  }, [reducedMotion]);

  const handleOpened = useCallback(() => {
    setBookPhase('open');
  }, []);

  return (
    <div className={`experience experience--${bookPhase}`}>
      <SceneUI visible={isOpen} />

      <FullscreenButton tone="light" />

      {/* Nav controls only shown once the book is open */}
      {isOpen && (
        <BookControls
          hasPrev={state.hasPrev}
          hasNext={state.hasNext}
          onPrev={flipPrev}
          onNext={flipNext}
          tone="light"
        />
      )}

      {/* The StPageFlip book — always mounted so the engine initialises,
          but invisible until the open phase. The .book-wrapper class
          controls the cross-fade during the opening animation. */}
      <div className={`book-wrapper book-wrapper--${bookPhase}`}>
        <PortfolioBook onStateChange={handleStateChange} apiRef={apiRef}>
          {/* Floating controls, kept just outside the book. */}
          <div className="float-layer" aria-hidden={!state.showCv && !state.showContact}>
            <CVDownloadButton visible={state.showCv && isOpen} tone="light" />
            <ContactLinks visible={state.showContact && isOpen} tone="light" />
          </div>
        </PortfolioBook>
      </div>

      {/* Closed book shell — removed from the DOM once fully open */}
      {bookPhase !== 'open' && (
        <ClosedBook
          phase={bookPhase}
          onOpen={handleOpen}
          onOpened={handleOpened}
          coverSrc={coverSrc}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Page counter — only when open */}
      {isOpen && (
        <PageCounter page={state.pageNumber} total={state.total} progress={progress} />
      )}
    </div>
  );
}
