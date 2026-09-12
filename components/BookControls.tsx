'use client';

import { FloatControl } from '@/components/FloatControl';
import type { FloatTone } from '@/components/FloatControl';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface BookControlsProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  tone?: FloatTone;
}

/** Previous / next chevrons floating at the sides of the book. */
export function BookControls({ hasPrev, hasNext, onPrev, onNext, tone }: BookControlsProps) {
  return (
    <>
      <FloatControl
        onClick={onPrev}
        label="Previous page"
        visible={hasPrev}
        tone={tone}
        className="nav-control nav-control--prev"
      >
        <ChevronLeftIcon size={20} />
      </FloatControl>
      <FloatControl
        onClick={onNext}
        label="Next page"
        visible={hasNext}
        tone={tone}
        className="nav-control nav-control--next"
      >
        <ChevronRightIcon size={20} />
      </FloatControl>
    </>
  );
}
