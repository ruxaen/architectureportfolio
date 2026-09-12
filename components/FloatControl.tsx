'use client';

/**
 * The floating circular controls that live just outside the book.
 * One shared visual language: translucent disc, hairline border, faint blur,
 * monochrome glyph, quiet fade in/out. Nothing here bounces or scales.
 */
import type { CSSProperties, ReactNode } from 'react';

export type FloatTone = 'light' | 'dark';

export interface FloatControlProps {
  children: ReactNode;
  label: string;
  href?: string;
  /** Forces a file download when the control renders as a link. */
  download?: string;
  onClick?: () => void;
  /** false -> the control is faded out and non-interactive. */
  visible?: boolean;
  /** Which environment the control floats over. */
  tone?: FloatTone;
  /** Fade duration in ms; also used for the transition-delay while entering. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function FloatControl({
  children,
  label,
  href,
  download,
  onClick,
  visible = true,
  tone = 'light',
  delay = 0,
  className = '',
  style,
}: FloatControlProps) {
  const classes = [
    'float-control',
    `float-control--${tone}`,
    visible ? 'is-visible' : 'is-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const shared = {
    className: classes,
    'aria-label': label,
    title: label,
    style: { ...style, '--float-delay': `${delay}ms` } as CSSProperties,
  };

  if (href) {
    return (
      <a
        {...shared}
        href={href}
        download={download}
        target={download ? undefined : '_blank'}
        rel={download ? undefined : 'noopener noreferrer'}
        tabIndex={visible ? 0 : -1}
      >
        {children}
      </a>
    );
  }

  return (
    <button {...shared} type="button" onClick={onClick} disabled={!visible} tabIndex={visible ? 0 : -1}>
      {children}
    </button>
  );
}
