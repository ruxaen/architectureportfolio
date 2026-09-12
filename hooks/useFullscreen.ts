'use client';

import { useCallback, useEffect, useState } from 'react';

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

/** Fullscreen state + toggle with WebKit fallbacks (Safari). */
export function useFullscreen() {
  const [active, setActive] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const doc = document as FsDocument;
    const element = document.documentElement as FsElement;
    setAvailable(Boolean(doc.fullscreenEnabled ?? element.webkitRequestFullscreen));

    const sync = () => setActive(Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement));
    const events = ['fullscreenchange', 'webkitfullscreenchange'] as const;
    events.forEach((event) => document.addEventListener(event, sync));
    sync();

    return () => events.forEach((event) => document.removeEventListener(event, sync));
  }, []);

  const toggle = useCallback(() => {
    const doc = document as FsDocument;
    const element = document.documentElement as FsElement;

    if (document.fullscreenElement ?? doc.webkitFullscreenElement) {
      (document.exitFullscreen ?? doc.webkitExitFullscreen)?.call(document);
      return;
    }

    (element.requestFullscreen ?? element.webkitRequestFullscreen)?.call(element);
  }, []);

  return { active, available, toggle };
}
