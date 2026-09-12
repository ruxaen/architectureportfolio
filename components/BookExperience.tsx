'use client';

/**
 * BookExperience — the whole scene: book, counter, navigation, fullscreen and
 * the context-aware floating controls. Owns the single piece of shared state
 * (the BookState) that drives every UI reaction.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { PortfolioBook } from '@/components/PortfolioBook';
import type { PortfolioBookHandle } from '@/components/PortfolioBook';
import { BookControls } from '@/components/BookControls';
import { PageCounter } from '@/components/PageCounter';
import { CVDownloadButton } from '@/components/CVDownloadButton';
import { ContactLinks } from '@/components/ContactLinks';
import { FullscreenButton } from '@/components/FullscreenButton';
import { getBookState, type BookState } from '@/lib/portfolio';

export function BookExperience() {
  const apiRef = useRef<PortfolioBookHandle | null>(null);
  const [state, setState] = useState<BookState>(() => getBookState(0, 'landscape'));

  const handleStateChange = useCallback((next: BookState) => setState(next), []);

  const { flipNext, flipPrev } = useMemo(
    () => ({
      flipNext: () => apiRef.current?.flipNext(),
      flipPrev: () => apiRef.current?.flipPrev(),
    }),
    [],
  );

  const progress = state.total > 1 ? state.pageNumber / state.total : 1;

  return (
    <div className="experience">
      <FullscreenButton tone="light" />

      <BookControls
        hasPrev={state.hasPrev}
        hasNext={state.hasNext}
        onPrev={flipPrev}
        onNext={flipNext}
        tone="light"
      />

      <PortfolioBook onStateChange={handleStateChange} apiRef={apiRef}>
        {/* Floating controls, kept just outside the book. */}
        <div className="float-layer" aria-hidden={!state.showCv && !state.showContact}>
          <CVDownloadButton visible={state.showCv} tone="light" />
          <ContactLinks visible={state.showContact} tone="light" />
        </div>
      </PortfolioBook>

      <PageCounter page={state.pageNumber} total={state.total} progress={progress} />
    </div>
  );
}
