'use client';

/**
 * ClosedBook — a CSS 3D hardcover book rendered with `preserve-3d`.
 *
 * Structure:
 *   .closed-book              perspective container
 *   ├── .closed-book__shadow  ambient shadow on the surface
 *   └── .closed-book__body    preserve-3d group (slight rotateX for top-down angle)
 *       ├── .closed-book__cover   front face → cover.webp
 *       ├── .closed-book__spine   left edge, darker
 *       ├── .closed-book__pages   page block (bottom + right edges)
 *       └── .closed-book__back    back face, barely visible
 *
 * The whole shell is animated via CSS keyframes when `phase === 'opening'`.
 * After the animation finishes, the parent unmounts this component.
 */

import type { CSSProperties } from 'react';

interface ClosedBookProps {
  /** Trigger the opening animation. */
  phase: 'closed' | 'opening';
  /** Called when the user clicks/taps the closed book to open it. */
  onOpen: () => void;
  /** Called when the opening animation completes (animationend). */
  onOpened: () => void;
  /** Cover image source. */
  coverSrc: string;
  /** Whether to skip animation (reduced motion). */
  reducedMotion?: boolean;
}

export function ClosedBook({ phase, onOpen, onOpened, coverSrc, reducedMotion }: ClosedBookProps) {
  const isOpening = phase === 'opening';

  const handleClick = () => {
    if (phase === 'closed') onOpen();
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Only react to the main body animation, not children.
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('closed-book__body')) {
      onOpened();
    }
  };

  return (
    <div
      className={`closed-book ${isOpening ? 'is-opening' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      role="button"
      tabIndex={0}
      aria-label="Open portfolio"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Ambient shadow on the surface */}
      <div className="closed-book__shadow" aria-hidden="true" />

      {/* 3D book body */}
      <div className="closed-book__body" aria-hidden="true">
        {/* Front cover */}
        <div className="closed-book__cover">
          <img
            src={coverSrc}
            alt="Portfolio cover"
            draggable={false}
            loading="eager"
            fetchPriority="high"
          />
          {/* Light overlay */}
          <div className="closed-book__cover-light" />
        </div>

        {/* Spine (left edge) */}
        <div className="closed-book__spine" />

        {/* Page block (right edge) */}
        <div className="closed-book__pages closed-book__pages--right" />

        {/* Page block (bottom edge) */}
        <div className="closed-book__pages closed-book__pages--bottom" />

        {/* Back cover */}
        <div className="closed-book__back" />
      </div>

      {/* Subtle CTA */}
      {phase === 'closed' && (
        <p className="closed-book__cta">Click to open</p>
      )}
    </div>
  );
}
