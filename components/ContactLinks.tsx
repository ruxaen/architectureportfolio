'use client';

import { CONTACTS } from '@/lib/portfolio';
import { FloatControl } from '@/components/FloatControl';
import type { FloatTone } from '@/components/FloatControl';
import { ContactGlyphIcon } from '@/components/icons';

/**
 * Appears beside the book while the contact page is on screen.
 * One quiet disc per link, staggered by a few frames on entry.
 */
export function ContactLinks({ visible, tone }: { visible: boolean; tone?: FloatTone }) {
  return (
    <div className={`contact-links${visible ? ' is-visible' : ''}`}>
      {CONTACTS.map((contact, index) => (
        <FloatControl
          key={contact.id}
          href={contact.href}
          label={contact.label}
          visible={visible}
          tone={tone}
          delay={index * 60}
          className="contact-links__item"
        >
          <ContactGlyphIcon icon={contact.icon} size={17} />
        </FloatControl>
      ))}
    </div>
  );
}
