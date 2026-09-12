/**
 * Hand written type declarations for the `page-flip` package (StPageFlip).
 * The published package ships JavaScript only, so the surface we use is declared here.
 */
declare module 'page-flip' {
  export type SizeType = 'fixed' | 'stretch';
  export type Orientation = 'portrait' | 'landscape';
  export type FlippingState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';
  export type FlipCorner = 'top' | 'bottom';

  export interface FlipSetting {
    /** Page number (index from 0) the book opens on. */
    startPage: number;
    /** Fixed dimensions, or stretched to the parent element. */
    size: SizeType;
    /** Base page dimensions; in stretch mode this only defines the page ratio. */
    width: number;
    height: number;
    /** Bounds used while stretching (in stretch mode these describe a single page). */
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    /** Draw the moving page shadow while flipping. */
    drawShadow: boolean;
    /** Flip animation duration in ms. */
    flippingTime: number;
    /** Allow switching to a single page when there is not enough width. */
    usePortrait: boolean;
    startZIndex: number;
    /** Let the book size itself from the parent element width. */
    autoSize: boolean;
    /** Moving page shadow intensity, 0 - 1. */
    maxShadowOpacity: number;
    /** Render the first and last pages as rigid covers in single page mode. */
    showCover: boolean;
    /** Allow the page to scroll while touching the book. */
    mobileScrollSupport: boolean;
    /** Forward click events on links/buttons placed inside pages. */
    clickEventForward: boolean;
    /** Enable mouse and touch dragging. */
    useMouseEvents: boolean;
    /** Minimum swipe distance (px) that triggers a flip. */
    swipeDistance: number;
    /** Fold the corner under the pointer on hover. */
    showPageCorners: boolean;
    /** Only allow flipping by grabbing a page corner instead of a click. */
    disableFlipByClick: boolean;
  }

  export interface PageRect {
    left: number;
    top: number;
    width: number;
    height: number;
    pageWidth: number;
  }

  export interface PageFlipEventData {
    flip: number;
    changeOrientation: Orientation;
    changeState: FlippingState;
    init: { page: number; mode: Orientation };
    update: { page: number; mode: Orientation };
  }

  export interface WidgetEvent<K extends keyof PageFlipEventData = keyof PageFlipEventData> {
    data: PageFlipEventData[K];
    object: PageFlip;
  }

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>);

    /** Remove the book (including the element it was created on) and every listener. */
    destroy(): void;
    /** Recalculate the render area and re-show the current page. */
    update(): void;
    /** Take the `.page` elements found in `items` and build the book from them. */
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;

    /** Turn the page without animation. */
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(page: number): void;
    /** Turn the page with the flip animation. */
    flipPrev(corner?: FlipCorner): void;
    flipNext(corner?: FlipCorner): void;

    getPageCount(): number;
    /** The left page of the current spread (the page itself in portrait mode). */
    getCurrentPageIndex(): number;
    getOrientation(): Orientation;
    getState(): FlippingState;
    getRect(): PageRect;

    on<K extends keyof PageFlipEventData>(
      eventName: K,
      callback: (event: WidgetEvent<K>) => void,
    ): PageFlip;
    off(eventName: keyof PageFlipEventData): void;
  }
}
