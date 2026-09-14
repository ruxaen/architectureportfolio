'use client';

interface PageCounterProps {
  /** 1-based page number (rightmost visible page). */
  page: number;
  total: number;
  progress: number;
}

/** "08 / 34" with a short progress line beside it, centred under the book. */
export function PageCounter({ page, total, progress }: PageCounterProps) {
  return (
    <div className="page-counter" aria-live="polite" aria-atomic="true">
      <p className="page-counter__text">
        <span className="page-counter__current">{String(page).padStart(2, '0')}</span>
        <span className="page-counter__divider" aria-hidden="true">
          {' '}
          /{' '}
        </span>
        <span className="page-counter__total">{String(total).padStart(2, '0')}</span>
        <span className="sr-only">{` — page ${page} of ${total}`}</span>
      </p>
      <div className="page-counter__line" aria-hidden="true">
        <div className="page-counter__progress" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
