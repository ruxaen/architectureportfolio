# 3D Architectural Portfolio — Context & Reasoning

## Project Goal
Transform a 2D digital architectural portfolio into a highly tactile, realistic 3D interactive book experience set in a photographic studio environment. 

## Progress Log

**Phase 1: Architecture & Foundation (Completed)**
- Mapped the state management (`BookState` in `lib/portfolio.ts`) and engine (`page-flip` integrated via `PortfolioBook.tsx`).
- Created the workspace skill `.agents/skills/3d-architectural-portfolio/SKILL.md` to define visual principles and architectural rules.
- Determined that `page-flip`'s HTML/CSS structure is rigid; transformations must happen on the container.

**Phase 2: 3D Transformation (Completed)**
- Generated a premium background image (`bg-studio.webp`) rather than using complex CSS compositing, achieving a much more realistic tabletop environment.
- Built a CSS 3D `ClosedBook.tsx` component using `transform-style: preserve-3d` with realistic spine, page edges, shadows, and cover.
- Built `SceneUI.tsx` to handle subtle environmental labels matching reference images.
- Refactored `BookExperience.tsx` to implement a robust 3-phase state machine: `'closed' -> 'opening' -> 'open'`. 
- Overhauled `globals.css` with advanced CSS keyframes for a seamless 3D handoff during the opening transition, ensuring the actual page engine remains hidden until the animation completes.
- Fixed a grid layout conflict where the `book-stage` and `book-wrapper` were competing, ensuring correct sizing and page visibility.
- Refined CSS shadows, text contrast on labels, and adjusted mobile breakpoints.

## Key Technical Decisions
1. **No 3D Libraries**: Achieved the result using pure CSS 3D transforms (`rotateX`, `rotateY`, `perspective`) to maintain absolute maximum performance (60fps) and keep the footprint small.
2. **Animation Handoff**: The opening animation plays entirely on a CSS shell (`ClosedBook.tsx`). At ~85% of the animation, the real `page-flip` component fades in underneath it, creating an illusion of a single continuous object.
3. **Environment**: A static, pre-rendered photographic background is infinitely faster to render and looks more realistic than trying to build a leaf shadow and stone blocks via CSS.

## Outstanding Issues / Next Steps
- The CV download and Contact control visibility (`state.showCv`) was behaving slightly unexpectedly at the very end of the book. 
- Further polishing of responsive breakpoints if requested.
