'use client';

import { FloatControl } from '@/components/FloatControl';
import type { FloatTone } from '@/components/FloatControl';
import { CollapseIcon, ExpandIcon } from '@/components/icons';
import { useFullscreen } from '@/hooks/useFullscreen';

/**
 * Top-right fullscreen toggle. Present at low opacity, fully present on hover
 * or keyboard focus; swaps to a collapse glyph while the stage is fullscreen.
 */
export function FullscreenButton({ tone }: { tone?: FloatTone }) {
  const { active, available, toggle } = useFullscreen();

  if (!available) return null;

  return (
    <FloatControl
      onClick={toggle}
      label={active ? 'Exit fullscreen' : 'Enter fullscreen'}
      tone={tone}
      className="fullscreen-button"
    >
      {active ? <CollapseIcon size={17} /> : <ExpandIcon size={17} />}
    </FloatControl>
  );
}
