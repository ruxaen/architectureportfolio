'use client';

/**
 * SceneUI — the quiet chrome printed on the environment around the book.
 *
 * Layout (matches the dark reference mockups):
 *   top-left      MADIHA SAMAR / ARCHITECTURAL PORTFOLIO
 *   top-right     PORTFOLIO · CV · CONTACT   (CV / CONTACT jump into the book)
 *   bottom-left   ARCHITECTURE / URBANISM / PEOPLE / NATURE (stacked list)
 *   bottom-centre page counter "01 / 30" + progress line (lives in PageCounter)
 *   bottom-right  SCROLL OR USE ARROWS + short rule
 *
 * Deliberately absent: the two middle-edge quotes from the earlier cream
 * mockup ("Spaces for a more thoughtful tomorrow." left, "A collection of
 * spaces, ideas and possibilities." right) — the user asked for those to go.
 */

import { SCENE_CHAPTERS, SCENE_HINT, SCENE_NAV, SITE } from '@/lib/portfolio';

interface SceneUIProps {
  /** Controls the fade-in (chrome is rendered from the start). */
  visible: boolean;
  /** Jump instantly to a book page (scene nav links). */
  onJump: (page: number) => void;
  /** Nav links only jump once the book is open. */
  interactive?: boolean;
}

export function SceneUI({ visible, onJump, interactive = true }: SceneUIProps) {
  return (
    <div className={`scene-ui ${visible ? 'is-visible' : ''}`}>
      {/* Top-left: name + subtitle */}
      <div className="scene-ui__top-left">
        <p className="scene-ui__name">{SITE.name.toUpperCase()}</p>
        <p className="scene-ui__tagline">{SITE.tagline.toUpperCase()}</p>
      </div>

      {/* Top-right: section links (not a navbar — quiet tracked words) */}
      <nav className="scene-ui__top-right" aria-label="Sections">
        {SCENE_NAV.map((item) =>
          item.page >= 0 ? (
            <button
              key={item.id}
              type="button"
              className="scene-ui__nav-item"
              onClick={() => onJump(item.page)}
              disabled={!interactive}
              tabIndex={interactive ? 0 : -1}
            >
              {item.label.toUpperCase()}
            </button>
          ) : (
            <span key={item.id} className="scene-ui__nav-item scene-ui__nav-item--static">
              {item.label.toUpperCase()}
            </span>
          ),
        )}
        <span className="scene-ui__label-line" aria-hidden="true" />
      </nav>

      {/* Bottom-left: chapter list */}
      <ul className="scene-ui__bottom-left" aria-label="Chapters">
        {SCENE_CHAPTERS.map((chapter) => (
          <li key={chapter}>{chapter.toUpperCase()}</li>
        ))}
      </ul>

      {/* Bottom-right: interaction hint */}
      <p className="scene-ui__bottom-right">
        <span>{SCENE_HINT.toUpperCase()}</span>
        <span className="scene-ui__hint-line" aria-hidden="true" />
      </p>
    </div>
  );
}
