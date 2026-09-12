---
name: 3D Architectural Portfolio
description: >
  Persistent development guidance for transforming an existing 2D architectural
  portfolio book website into a premium, realistic 3D interactive portfolio
  experience. Covers visual direction, 3D treatment, closed-book animation,
  page flipping, environment, lighting, contextual controls, performance,
  responsiveness, accessibility, coding style, and project handoff context.
  Activate this skill for any task related to the portfolio book, its visual
  presentation, interactions, UI controls, responsiveness, performance, or
  project-level planning.
---

# 3D Architectural Portfolio — Development Skill

## 1 · Project Identity

This project is a **premium architectural portfolio presented as a realistic
physical book**. It is built with Next.js, React, TypeScript, and vanilla CSS.
Page-flipping is powered by [StPageFlip](https://www.npmjs.com/package/page-flip)
(`page-flip` on npm).

The final experience should feel like:

> A premium physical architectural portfolio sitting on a beautiful studio
> surface, brought to life as an interactive digital book.

The **book is the website**. There is no navbar, hero section, project cards, or
conventional portfolio layout. The page-flip is the primary animation; all other
motion should be minimal and purposeful.

---

## 2 · Visual Direction

Every visual decision should reinforce these qualities:

- **Premium** — materials, shadows, and typography should feel expensive.
- **Minimalist** — nothing extraneous on screen.
- **Architectural** — proportions, grid, negative space.
- **Editorial** — restrained typography, generous whitespace.
- **Sophisticated** — subtle depth, refined color.
- **Tactile** — the book should look and feel like a physical object.
- **Realistic** — believable 3D depth, lighting, and shadows.
- **Calm** — no jarring movement, no visual noise.
- **Slightly cinematic** — warm directional light, gentle depth of field.
- **Subtle** — never flashy, never busy.

### What to avoid

- Neon, saturated gradients, colorful accents.
- Excessive particles, motion trails, or animated backgrounds.
- Cartoon, game, or toy-like 3D aesthetics.
- Busy scenery or distracting environmental objects.
- Generic web-app patterns (cards, grids, hero sections).

---

## 3 · Existing Architecture

Read and understand these files before making any changes:

| File | Purpose |
|---|---|
| `lib/portfolio.ts` | Single source of truth: page list (33 pages), book geometry, page ratio (420 × 594), preload distances, CV/contact data, derived `BookState`. |
| `components/PortfolioBook.tsx` | Mounts StPageFlip engine, manages page DOM imperatively, handles keyboard navigation, preloading, and publishes `--book-w`/`--book-h` CSS custom properties on `:root`. |
| `components/BookExperience.tsx` | Top-level scene: composes the book, floating controls (CV, contact), navigation chevrons, fullscreen button, and page counter. Owns the single shared `BookState`. |
| `components/FloatControl.tsx` | Shared primitive for all circular glass-like controls: translucent disc, hairline border, backdrop blur, quiet fade in/out. |
| `components/CVDownloadButton.tsx` | CV download — appears when the CV page is visible; links to `/cv.pdf`. |
| `components/ContactLinks.tsx` | Contact icons — appear when the contact page is visible; staggered fade-in. |
| `components/BookControls.tsx` | Previous/next navigation chevrons positioned outside the book edges. |
| `components/PageCounter.tsx` | `08 / 34` counter with progress bar, centred below the book. |
| `components/FullscreenButton.tsx` | Top-right fullscreen toggle; low opacity at rest, full on hover. |
| `components/icons.tsx` | SVG icon components (chevrons, download, expand/collapse, contact glyphs). |
| `hooks/useFullscreen.ts` | Fullscreen API hook. |
| `hooks/usePrefersReducedMotion.ts` | `prefers-reduced-motion` media query hook. |
| `app/layout.tsx` | Root layout: Inter font, metadata, image preloading via `<link rel="preload">`. |
| `app/page.tsx` | Renders `<BookExperience />`. |
| `app/globals.css` | All styles: environment, book physical presence (shadows, gutter, page edges, spine), floating controls, page counter, responsiveness, reduced motion. |
| `types/page-flip.d.ts` | TypeScript declarations for the `page-flip` library. |
| `public/portfolio/` | 33 WebP page images (cover, 28 content pages, CV, contact, colophon, back). |
| `public/cv.pdf` | Downloadable CV file. |

### Key architectural facts

- StPageFlip takes **imperative ownership** of page DOM nodes. Pages are created
  once via `document.createElement` in a `useMemo`, then handed to the engine
  with `loadFromHTML`. React does not re-render these nodes.
- The book runs in **stretch + autoSize** mode: its dimensions are driven by the
  CSS width of `.book-host`; the engine handles the aspect ratio and portrait
  switching internally.
- Live book dimensions are published as `--book-w` and `--book-h` on `:root`
  via a `ResizeObserver`. All floating controls (nav, CV, contact) use these
  custom properties to anchor to the physical book.
- The `BookState` object is the **single piece of shared React state**. It
  drives CV visibility, contact visibility, navigation availability, and the
  page counter. It is derived in `getBookState()` from the engine's current
  page index and orientation.
- Page preloading uses a sliding window (`PRELOAD.behind = 2`, `PRELOAD.ahead = 5`).
  Distant pages are `loading="lazy"`; nearby pages are promoted to `"eager"` +
  `fetchPriority="high"` dynamically.

---

## 4 · Core Development Principles

These principles are **non-negotiable** and must be followed in every task:

### 4.1 Preserve working functionality

Never rebuild or rewrite a working system without an explicit, demonstrated
reason. Improve incrementally.

### 4.2 Portfolio pages remain image-based

The portfolio page content is rendered from pre-made images. Do **not** recreate
the architectural drawings, renders, typography, or layouts in HTML/CSS/SVG.

### 4.3 The book is the website

Do not introduce navbars, hero sections, project cards, about sections, footer
sections, or unnecessary scrolling content. The book fills the viewport and is
the entire experience.

### 4.4 Page flip is the primary animation

Other animations (opening transition, control fades, background effects) should
be secondary, purposeful, and restrained. Do not animate everything.

### 4.5 Visual quality AND performance

A beautiful animation that causes jank is not acceptable. Target 60 fps for
all interactions.

### 4.6 Simplest reliable implementation

Prefer CSS 3D transforms, perspective, shadows, gradients, pseudo-elements,
and the existing `page-flip` engine. Do **not** introduce Three.js, WebGL,
GSAP, physics engines, or other large dependencies unless there is a
demonstrated, specific reason that the existing approach cannot achieve the
result. Document the justification if a dependency is introduced.

### 4.7 No unnecessary rewrites

Do not destroy and rebuild the existing implementation to make the architecture
"cleaner." Refactor only when there is a clear, functional benefit.

---

## 5 · 3D Book Treatment

### 5.1 Desktop — open book

The book should appear as a convincing open physical object with two visible
pages:

- **Thickness**: visible page-stack edges on left and right (or top/bottom). The
  existing `::before`/`::after` pseudo-elements on `.book` already render this
  with repeating-linear-gradient. Enhance as needed.
- **Cover depth**: the cover boards should feel heavier than interior pages.
- **Center binding**: gutter shadow suggesting a physical spine. Already present
  via `.book__gutter`.
- **Page shadows**: soft shadows on individual pages, especially near the
  binding.
- **Ambient shadow**: the book casts a realistic shadow onto the surface below.
  Already present via `.book-host::before`.
- **Page curvature**: very subtle warping of pages near the spine, suggesting
  paper under tension. Achievable with CSS `perspective` and subtle transforms.
- **Perspective**: the whole book should have a gentle perspective, not flat.
- **Lighting**: the book should appear lit by a warm directional source (upper
  left or upper center). Achieved through shadow direction, gradient overlays,
  and subtle highlight placement.
- **Proportions**: the on-screen book should have believable physical
  proportions. The existing sizing formula in `.book-host` already constrains
  the book to the viewport with the correct aspect ratio.

### 5.2 Mobile — single page

On narrow viewports (≤ 460 px), the book switches to single-page (portrait)
mode automatically via StPageFlip's `usePortrait: true`. Do **not** squeeze a
two-page landscape spread into a tiny viewport. Maintain the original page
aspect ratio; do not distort pages.

---

## 6 · Closed Book & Opening Animation

This is a **high-priority feature** that does not yet exist. It should be
implemented with care.

### 6.1 Closed-book state

The book loads in a believable **closed** state:

- A 3D-looking closed book, seen from a slight angle.
- Visible front cover, spine, and a hint of page thickness.
- The book sits on the studio surface, casting appropriate shadows.
- The cover may be slightly foreshortened via CSS perspective.

### 6.2 Opening transition

When the user opens the book (click, tap, or automatic after a brief pause):

```
CLOSED BOOK
    ↓
FRONT COVER LIFTS / OPENS
    ↓
BOOK ROTATES OR TRANSITIONS INTO OPEN VIEW
    ↓
FULL OPEN TWO-PAGE SPREAD
```

Critical requirements:

- The transition must feel like **the same physical object** opening, not two
  unrelated UI states being swapped.
- The orientation may change (e.g., closed = portrait/angled; open = landscape
  spread). This orientation shift must be smooth and continuous.
- Avoid abrupt teleporting, scaling jumps, opacity fades, DOM replacement, or
  visible state swaps.
- The animation should be elegant and restrained — approximately 800–1400 ms.
- Use CSS transitions/animations with `transform`, `perspective`, and
  `transform-origin` where possible.
- StPageFlip should only be initialized or made visible once the book is in its
  open state, because the engine manages its own page layout.

### 6.3 Technical approach

Possible implementation strategy (adapt as needed):

1. Render a **closed-book shell** (HTML + CSS 3D transforms) that looks like
   the physical closed book.
2. On user interaction, animate the shell open using CSS keyframes or
   transitions.
3. At the appropriate point in the animation, fade in or reveal the StPageFlip
   book (already mounted beneath) so the transition is seamless.
4. Remove or hide the shell once the open animation completes.

The key challenge is the **handoff** between the CSS-animated shell and the
StPageFlip-managed book. This must be visually imperceptible.

### 6.4 Reduced motion

When `prefers-reduced-motion` is active, skip or greatly simplify the opening
animation. Show the book in its open state immediately or with a single quick
fade.

---

## 7 · Page Flipping

### 7.1 Use the existing engine

StPageFlip (`page-flip` v2.0.7) is already integrated and working. Do not
replace it without a very strong reason.

### 7.2 Supported interactions

All of these must work:

- Mouse click on page corners or edges.
- Mouse drag (page follows pointer).
- Touch swipe (natural, responsive).
- Keyboard left/right arrows (already implemented).
- Previous/next navigation controls (already implemented).

### 7.3 Performance target

Page flipping must run at a smooth 60 fps. The flip animation duration is
currently 720 ms (`FLIP_DURATION`). Do not add unnecessary computation,
DOM updates, or React re-renders during a flip.

### 7.4 Do not over-animate

The page flip itself is the animation. Do not add secondary animations
(background shifts, lighting changes, counter bounces) triggered by every
page turn.

---

## 8 · Background & Environment

### 8.1 Current state

The background is a CSS gradient system:
- Radial gradient (top light pool).
- Radial gradient (bottom depth).
- Linear gradient (top-to-bottom base).
- Colors: `--bg: #e9e6e1`, `--bg-2: #d9d5cf`, `--bg-deep: #b9b4ac`.

### 8.2 Target

Upgrade the background to feel like a **premium architectural studio surface**:

- Warm stone, polished concrete, or fine wood grain tabletop.
- Soft natural light falling from above.
- Subtle depth and shadow under the book.
- Muted neutral palette (warm greys, taupes, off-whites).
- Gentle light falloff toward edges and corners.
- Very subtle environmental details (e.g., a faint surface texture, a distant
  shadow suggesting a wall or edge).

### 8.3 Implementation approach

Use CSS whenever possible:

- Layered radial and linear gradients.
- CSS `background-image` with a lightweight texture image (small, tileable,
  ≤ 50 KB) if a flat gradient is insufficient.
- Pseudo-elements for vignetting, edge shadows, or surface depth.
- Subtle `filter: blur()` elements for out-of-focus environmental hints.

The background should **support the book** and never compete with it.

### 8.4 What to avoid

- Full-scene 3D environments (WebGL, Three.js).
- Heavy photographic backgrounds.
- Colorful or saturated gradients.
- Excessive particles or animated background elements.
- Distracting objects or scenery.

---

## 9 · Lighting

### 9.1 Philosophy

The book should appear to exist in a physical space with believable lighting.
Lighting should be warm, soft, and directional — suggesting a studio window or
architectural spot light.

### 9.2 Techniques

Use lightweight CSS-based approaches:

- **Radial gradients**: simulate a soft light pool on the surface beneath and
  around the book (already partially implemented in `.book-host::after`).
- **Linear gradients**: subtle top-to-bottom or diagonal light fall-off.
- **Box shadows**: the book's shadows should be consistent with the light
  direction. Shadows are slightly longer on the side away from the light.
- **Pseudo-element overlays**: very subtle light highlights on the book surface
  (a faint white-to-transparent gradient over the top-left corner of pages).
- **CSS filter**: `brightness()`, `contrast()`, or `drop-shadow()` for subtle
  adjustments.
- **Dynamic shadow positioning**: if the book orientation or state changes
  (e.g., during the opening animation), shadows should respond naturally.

### 9.3 Constraints

- Do not make lighting dramatically theatrical.
- Do not use real-time shadow-mapping or raytracing.
- Do not add moving light sources.
- Lighting changes during state transitions (closed → open) should be subtle
  and smooth.

---

## 10 · CV Download Control

### 10.1 Current implementation

`CVDownloadButton` uses the `FloatControl` primitive. It appears when the CV
page is visible (`state.showCv`) and links to `/cv.pdf` with a download
attribute.

### 10.2 Design specification

- **Shape**: circular, 46 px diameter (adjustable).
- **Style**: translucent glass — `backdrop-filter: blur()`, thin `1px` border,
  semi-transparent white background, monochrome download-arrow icon.
- **Behavior**: fades in smoothly (300–500 ms, `--ui-fade`) when the CV page
  appears; fades out when it leaves. No bounce, pulse, or scale effects.
- **Placement**: outside the book, anchored via `--book-w` custom property.
- **Link**: `/cv.pdf`, triggers browser download.
- **Accessibility**: `aria-label="Download CV (PDF)"`, keyboard-focusable.

### 10.3 Do not change

This control is already well-implemented. Only modify if:
- The positioning needs adjustment for the 3D treatment.
- The visual style needs refinement to match updated environment lighting.

---

## 11 · Contact Controls

### 11.1 Current implementation

`ContactLinks` renders one `FloatControl` per contact entry from `CONTACTS`
in `lib/portfolio.ts`. They appear when the contact page is visible
(`state.showContact`), with staggered entry (60 ms delay between icons).

### 11.2 Design specification

Same visual language as the CV control: circular, translucent, glass-like,
thin border, monochrome icon. Stacked vertically outside the book's right edge.

### 11.3 Contact links

Currently configured (update handles as needed):
- Email (`mailto:`)
- LinkedIn
- GitHub
- Behance
- Instagram

### 11.4 Do not change

Same as CV: only modify for positioning adjustments, visual refinement for
updated environment, or if new contact links are added.

---

## 12 · UI Controls

### 12.1 Philosophy

The interface should be **extremely minimal**. Controls should feel like quiet,
integrated parts of the environment — not like a software UI bolted on top.

### 12.2 Existing controls

| Control | Location | Behavior |
|---|---|---|
| Previous/Next chevrons | Fixed, outside book edges | Visible when navigation is possible; glass style |
| Page counter (`08 / 34`) | Centered below book | Progress bar + tabular-nums text; always visible |
| Fullscreen toggle | Fixed, top-right corner | Low opacity at rest, full on hover/focus |
| CV download | Fixed, outside book (right) | Visible only on CV page |
| Contact icons | Fixed, outside book (right) | Visible only on contact page |

### 12.3 Typography

- Font: Inter (300, 400, 500 weights loaded).
- Page counter: 11 px, weight 300, letter-spacing 0.22 em, tabular-nums.
- Controls use no visible text labels — only icons with aria-labels.

### 12.4 Do not add

- Hamburger menus, drawers, or sidebars.
- Toast notifications or modals.
- Progress spinners overlaid on the book.
- Toolbars or option panels.

---

## 13 · Performance

### 13.1 Image loading strategy

- **Eager**: cover + first `PRELOAD.ahead` (5) pages.
- **Sliding window**: as the user flips, `promoteNeighbours()` sets
  `loading="eager"` and `fetchPriority="high"` on nearby pages.
- **Lazy**: all distant pages remain `loading="lazy"`.
- **Preload tags**: the root layout emits `<link rel="preload">` for the
  first batch of page images.

### 13.2 Rendering performance

- Minimize React state. The only shared state is `BookState`.
- StPageFlip manages its own DOM; React does not re-render page nodes.
- `will-change: transform` is set on `.stf__block` for composited animations.
- Avoid layout-triggering CSS properties during animations (use `transform` and
  `opacity` only where possible).

### 13.3 Asset optimization

- All portfolio pages are already WebP. Consider AVIF if browser support and
  build tooling permit.
- Keep any texture images (background, surface) under 50–100 KB.
- Keep total JavaScript bundle lean — no unnecessary libraries.

### 13.4 Testing

Test on realistic lower-end hardware when possible:
- Mid-range Android phone.
- Older laptop.
- Throttled CPU/network in DevTools.

---

## 14 · Responsiveness

### 14.1 Breakpoints (current)

| Breakpoint | Behavior |
|---|---|
| Default (desktop) | Two-page landscape spread; `--stage-pad: 48px`; generous negative space |
| ≤ 900 px | Reduced padding (`--stage-pad: 28px`); tighter contact link gap |
| ≤ 640 px | Repositioned controls; smaller contact icons (40 px); tighter counter |
| ≤ 460 px | Single-page mode; `.book-host` width uses single-page ratio |

### 14.2 Rules

- **Never distort pages.** Maintain the original aspect ratio at all sizes.
- **Two-page → single-page**: handled by StPageFlip's `usePortrait: true` and
  the CSS width formula.
- **Controls**: reposition gracefully. On mobile, nav chevrons should be close
  to screen edges; CV and contact controls should not overlap the book.
- **Book size**: the book should always feel appropriately sized. Not too small
  that pages are unreadable; not overflowing the viewport.

---

## 15 · Accessibility

### 15.1 Requirements

- **Keyboard navigation**: left/right arrows for page flipping (implemented).
  All controls are keyboard-focusable.
- **ARIA labels**: all interactive controls have `aria-label`. The page counter
  has `aria-live="polite"`.
- **Focus indicators**: custom focus ring on `.float-control:focus-visible`
  (1 px solid outline, 3 px offset).
- **Touch**: swipe and tap are supported via StPageFlip.
- **Reduced motion**: when `prefers-reduced-motion: reduce` is active, all
  transition durations are collapsed to 1 ms. The `usePrefersReducedMotion`
  hook sets `flippingTime` to 1 ms for the engine. The opening animation
  (once implemented) should be skipped or greatly simplified.

### 15.2 Do not break

Accessibility features that are already in place must not be removed or
degraded.

---

## 16 · Scope Boundaries

### 16.1 In scope

- Portfolio book (3D presentation, physical feel).
- Closed-book state and opening animation.
- Page flipping (preserve existing system).
- Background / environment upgrade.
- Lighting.
- CV download control.
- Contact controls.
- Navigation controls.
- Page counter.
- Fullscreen.
- Responsive behavior.
- Performance optimization.
- Accessibility.
- Visual polish.

### 16.2 Not in scope (do not implement unless explicitly requested)

- About section / bio page.
- Blog or writing section.
- Client testimonials.
- Project detail pages beyond the book.
- CMS integration.
- Analytics.
- Authentication.
- Any page or route beyond the root `/`.

---

## 17 · Project Context File

### 17.1 Purpose

A persistent project handoff document must be maintained at:

```
docs/PORTFOLIO_CONTEXT.md
```

This file preserves **development context** — not model reasoning or
chain-of-thought — so that any agent (human or AI), on any platform, can
resume development efficiently.

### 17.2 Required sections

```
# Project Overview
# Design Direction
# Technical Architecture
# Important Decisions
# Current Implementation
# Known Issues
# Rejected Approaches
# Next Steps
# Verification
```

See the project specification for detailed content guidance for each section.

### 17.3 Maintenance rules

**Before starting any substantial task:**

1. Read `docs/PORTFOLIO_CONTEXT.md`.
2. Inspect the current implementation.
3. Compare the actual code state with the context file.
4. Continue from the existing architecture — do not assume a rebuild is needed.

**After every meaningful milestone:**

1. Update `docs/PORTFOLIO_CONTEXT.md`.
2. Record what changed.
3. Record what was verified.
4. Record remaining issues.
5. Update next steps.

**Content rules:**

- Keep the file compact (readable in 1–3 minutes).
- Record **conclusions**, not reasoning process.
- Record **decisions**, not deliberation.
- Record **current state**, not history of all states.
- Record **rejected approaches** only when they are meaningful enough that a
  future agent might otherwise repeat them.

**Bad example:**
> I considered using GSAP for the opening animation, then thought about CSS
> keyframes, then tried a combination, and eventually settled on...

**Good example:**
> Opening animation: CSS keyframes + transforms. GSAP was evaluated but rejected
> because the animation is achievable without a dependency and the library
> adds 25 KB to the bundle.

### 17.4 Do not create this file until actual development begins

The context file should be created when the first implementation work is done,
populated with the real state of the project at that point. Do not pre-fill it
with speculative content.

---

## 18 · Visual Verification

When browser or preview tools are available, **visually verify** after any
major change:

- [ ] Closed book appearance.
- [ ] Opening transition (smooth, seamless handoff).
- [ ] Fully opened book (perspective, shadows, gutter, thickness).
- [ ] Page flipping (60 fps, physical feel).
- [ ] Shadows and lighting (consistent with light direction).
- [ ] Background / environment (premium, non-competing).
- [ ] Responsive: desktop, tablet, mobile.
- [ ] CV control appears/disappears on correct pages.
- [ ] Contact controls appear/disappear on correct pages.
- [ ] Navigation chevrons, page counter, fullscreen button.
- [ ] Keyboard navigation.
- [ ] `prefers-reduced-motion` behavior.

Do not claim something is visually correct without actually checking it when
verification tools are available.

---

## 19 · Coding Style

- **Modular**: small, focused components.
- **Readable**: clear variable names, concise comments where non-obvious.
- **Strongly typed**: TypeScript throughout; avoid `any`.
- **Performance-conscious**: avoid unnecessary re-renders, DOM manipulation,
  and heavy dependencies.
- **Preserve existing conventions**: follow the patterns already established in
  the codebase (e.g., `FloatControl` as the shared primitive, `BookState` as
  the single state object, CSS custom properties for layout anchoring).
- **No over-abstraction**: do not create frameworks, plugin systems, or
  abstraction layers beyond what the project needs.
- **No duplicate logic**: if a pattern exists (e.g., `FloatControl`), use it
  rather than creating a parallel implementation.

---

## 20 · Agent Handoff Protocol

If another model or agent takes over this project:

1. **Read** `docs/PORTFOLIO_CONTEXT.md` (if it exists).
2. **Read** this skill file.
3. **Inspect** the repository: `lib/portfolio.ts`, `components/`, `app/globals.css`.
4. **Understand** the existing implementation before proposing changes.
5. **Continue** from the current state — do not assume a rebuild.
6. **Update** `docs/PORTFOLIO_CONTEXT.md` after meaningful changes.
7. **Follow** every principle in this skill.
