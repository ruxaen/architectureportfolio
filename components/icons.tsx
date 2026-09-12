/**
 * Minimal inline icon set. 24x24 grid, 1.25px strokes, monochrome.
 * Kept as tiny local components so no icon library is bundled.
 */
import type { SVGProps } from 'react';

import type { ContactIcon } from '@/lib/portfolio';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ChevronLeftIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </Svg>
);

export const DownloadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 4.5v11" />
    <path d="m7.5 11 4.5 4.5L16.5 11" />
    <path d="M5.5 19.5h13" />
  </Svg>
);

export const ExpandIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 4.5H4.5V9" />
    <path d="M15 4.5h4.5V9" />
    <path d="M9 19.5H4.5V15" />
    <path d="M15 19.5h4.5V15" />
  </Svg>
);

export const CollapseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4.5 9H9V4.5" />
    <path d="M19.5 9H15V4.5" />
    <path d="M4.5 15H9v4.5" />
    <path d="M19.5 15H15v4.5" />
  </Svg>
);

const ContactGlyph: Record<ContactIcon, (props: IconProps) => React.JSX.Element> = {
  mail: (props) => (
    <Svg {...props}>
      <rect x="4" y="6.5" width="16" height="11" rx="1" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </Svg>
  ),
  linkedin: (props) => (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 10.5V16" />
      <path d="M8 8v.01" />
      <path d="M11.5 16v-3.2c0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1V16" />
      <path d="M11.5 10.5V16" />
    </Svg>
  ),
  github: (props) => (
    <Svg {...props}>
      <path d="M9.5 20c-3.5 1-3.5-2-5-2.5m10.5 4.5v-3a2.7 2.7 0 0 0-.75-2.1c2.5-.28 5.25-1.23 5.25-5.61a4.3 4.3 0 0 0-1.2-2.98 4 4 0 0 0-.07-3.02s-.97-.3-3.18 1.18a11.1 11.1 0 0 0-5.8 0C7.04 3.99 6.07 4.3 6.07 4.3a4 4 0 0 0-.07 3.02 4.3 4.3 0 0 0-1.2 2.98c0 4.37 2.75 5.33 5.25 5.61a2.7 2.7 0 0 0-.75 2.1v3" />
    </Svg>
  ),
  behance: (props) => (
    <Svg {...props}>
      <path d="M3.5 7h4.7a2.4 2.4 0 0 1 0 4.8H3.5z" />
      <path d="M3.5 11.8h5a2.6 2.6 0 0 1 0 5.2h-5z" />
      <path d="M14 13.7h6.2a3.1 3.1 0 1 0-.6 2.3" />
      <path d="M15.5 7.2h4" />
    </Svg>
  ),
  instagram: (props) => (
    <Svg {...props}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M16.7 7.3v.01" />
    </Svg>
  ),
  link: (props) => (
    <Svg {...props}>
      <path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7L11.5 6.8" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 1 0 5.7 5.7l1.3-1.3" />
    </Svg>
  ),
};

export function ContactGlyphIcon({ icon, ...props }: IconProps & { icon: ContactIcon }) {
  const Glyph = ContactGlyph[icon] ?? ContactGlyph.link;
  return <Glyph {...props} />;
}
