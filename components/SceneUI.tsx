'use client';

/**
 * SceneUI — subtle environmental text labels that float around the scene.
 *
 * Matches the reference images:
 *   - Top-left: architect name + tagline
 *   - Top-right: "PORTFOLIO" + line decoration (near fullscreen button)
 *   - Bottom-left: line + tagline
 *   - Bottom-right: "SCROLL LESS · EXPLORE MORE"
 *
 * These feel like printed labels on the environment, not a UI navbar.
 * They fade in after the book opens.
 */

import { SITE } from '@/lib/portfolio';

interface SceneUIProps {
  /** Only show when the book is fully open. */
  visible: boolean;
}

export function SceneUI({ visible }: SceneUIProps) {
  return (
    <div className={`scene-ui ${visible ? 'is-visible' : ''}`} aria-hidden="true">
      {/* Top-left: name + tagline */}
      <div className="scene-ui__top-left">
        <p className="scene-ui__name">{SITE.name.toUpperCase()}</p>
        <p className="scene-ui__tagline">{SITE.tagline.toUpperCase()}</p>
      </div>

      {/* Top-right: PORTFOLIO label */}
      <div className="scene-ui__top-right">
        <span className="scene-ui__label">{SITE.label.toUpperCase()}</span>
        <span className="scene-ui__label-line" />
      </div>

      {/* Bottom-left: tagline with line */}
      <div className="scene-ui__bottom-left">
        <span className="scene-ui__bottom-line" />
        <span className="scene-ui__bottom-text">SPACES FOR A BETTER TOMORROW</span>
      </div>

      {/* Bottom-right */}
      <div className="scene-ui__bottom-right">
        <span className="scene-ui__bottom-text">SCROLL LESS</span>
        <span className="scene-ui__bottom-text">EXPLORE MORE</span>
      </div>
    </div>
  );
}
