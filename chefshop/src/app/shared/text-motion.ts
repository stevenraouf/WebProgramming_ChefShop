import { AfterViewInit, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/** Reveal display headings once as they enter view, including lazy-loaded routes. */
@Directive({ selector: '[appTextMotion]' })
export class TextMotion implements AfterViewInit {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    // Without these APIs the text remains visible and fully usable.
    if (typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined')
      return;
    const seen = new WeakSet<HTMLElement>();
    const intersections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('text-motion-visible');
          intersections.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -24px 0px' },
    );
    const scan = () => {
      this.host.nativeElement.querySelectorAll<HTMLElement>('h1, h2, h3').forEach((heading) => {
        if (seen.has(heading)) return;
        seen.add(heading);
        heading.classList.add('text-motion');
        intersections.observe(heading);
      });
    };
    const mutations = new MutationObserver(scan);
    mutations.observe(this.host.nativeElement, { childList: true, subtree: true });
    scan();
    this.destroyRef.onDestroy(() => {
      intersections.disconnect();
      mutations.disconnect();
    });
  }
}
