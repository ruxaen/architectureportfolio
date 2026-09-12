'use client';

import { CV_FILENAME, CV_URL } from '@/lib/portfolio';
import { FloatControl } from '@/components/FloatControl';
import type { FloatTone } from '@/components/FloatControl';
import { DownloadIcon } from '@/components/icons';

/**
 * Appears beside the book while the CV page is on screen.
 * Downloads /cv.pdf via the download attribute.
 */
export function CVDownloadButton({ visible, tone }: { visible: boolean; tone?: FloatTone }) {
  return (
    <FloatControl
      href={CV_URL}
      download={CV_FILENAME}
      label="Download CV (PDF)"
      visible={visible}
      tone={tone}
      className="cv-download"
    >
      <DownloadIcon size={19} />
    </FloatControl>
  );
}
