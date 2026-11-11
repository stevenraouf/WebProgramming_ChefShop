import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Heading, ProductCard } from '../shared/shared';
import { CatalogService } from '../core/catalog.service';
import { AuthService } from '../core/auth.service';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [RouterLink, Heading, ProductCard],
  template: `<section class="hero">
      <div class="story">
        <app-heading
          eyebrow="THREE KITCHENS. ONE TABLE."
          [title]="headline"
          copy="Student-made meals. Mediterranean spirit. Egyptian heart."
        /><a class="primary full" routerLink="/shop">Discover the menu →</a>
        <div class="account-links">
          @if (!auth.user()) {
            <a routerLink="/login">Login</a><a routerLink="/signup">Sign up</a>
          }
          <a routerLink="/profile">Your profile →</a>
        </div>
      </div>
      <div class="art">
        <div class="halo"></div>
        @if (reduceMotion()) {
          <img
            src="assets/figma/imgV6CinematicAlfredo.png"
            alt="Fettuccine Alfredo with parmesan and fresh basil"
            width="600"
            height="600"
          />
        } @else {
          <video
            #heroVideo
            autoplay
            muted
            loop
            playsinline
            poster="assets/figma/imgV6CinematicAlfredo.png"
            aria-label="Fettuccine Alfredo ingredient animation"
          >
            <source src="assets/motion/alfredo-loop.mp4" type="video/mp4" />
          </video>
        }
        <div class="hero-caption">
          <h2>FETTUCCINE ALFREDO</h2>
          <p>Silky pasta. Freshly made. EGP 160.</p>
        </div>
      </div>
    </section>
    <section class="section">
      <p class="eyebrow">COOK. DISCOVER. RECREATE.</p>
      <h2>YOUR NEXT GOOD FIND.</h2>
      <div class="grid category-grid">
        @for (category of categories; track category.key) {
          <article class="card">
            <img [src]="category.image" alt="" loading="lazy" width="330" height="170" />
            <h3>{{ category.title }}</h3>
            <p class="muted">{{ category.copy }}</p>
            <a class="secondary" routerLink="/shop" [queryParams]="{ category: category.key }"
              >Explore {{ category.title.toLowerCase() }}</a
            >
          </article>
        }
      </div>
    </section>
    <section class="section">
      <p class="eyebrow">FRESH FROM OUR STUDENT KITCHEN</p>
      <h2>MADE TO BE SHARED.</h2>
      <div class="grid">
        @for (p of featured; track p.key) {
          <app-product-card [product]="p" />
        }
      </div>
    </section>
    <section class="section hero">
      <div class="story">
        <app-heading
          eyebrow="LEARN. COOK. SHARE."
          title="YOUR NEXT CHAPTER STARTS HERE."
          copy="Hands-on teaching, chef guidance, and a kitchen full of possibility."
        /><a class="primary" routerLink="/academy">Explore the academy</a>
      </div>
      <img
        class="photo"
        src="assets/figma/imgAcademyKitchen.png"
        alt="Students practising in the culinary institute kitchen"
        loading="lazy"
        width="600"
        height="420"
      />
    </section>`,
})
export class HomePage {
  headline = 'THREE ROOTS.\nONE CRAVING.';
  video = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');
  systemReduced = signal(matchMedia('(prefers-reduced-motion: reduce)').matches);
  reduceMotion = computed(
    () => !!this.auth.user()?.preferences.reducedMotion || this.systemReduced(),
  );
  constructor() {
    const media = matchMedia('(prefers-reduced-motion: reduce)'),
      listener = (e: MediaQueryListEvent) => this.systemReduced.set(e.matches);
    media.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', listener));
    effect(() => {
      const stopped = this.auth.user()?.preferences.reducedMotion || this.systemReduced(),
        video = this.video()?.nativeElement;
      if (video) {
        if (stopped) video.pause();
        else void video.play().catch(() => {});
      }
    });
  }
  catalog = inject(CatalogService);
  auth = inject(AuthService);
  featured = ['taameya', 'souvlaki', 'bolognese', 'halloumi'].map((k) => this.catalog.get(k)!);
  categories = [
    {
      key: 'meal',
      title: 'Student Meals',
      copy: 'Twelve dishes. Three culinary roots.',
      image: 'assets/figma/imgStudioPhotograph.png',
    },
    {
      key: 'spice',
      title: 'Spices & Herbs',
      copy: 'Bring the flavour home.',
      image: 'assets/figma/imgStudioPhotograph1.png',
    },
    {
      key: 'tool',
      title: 'Kitchen Tools',
      copy: 'Good tools. Better cooking.',
      image: 'assets/figma/imgStudioPhotograph2.png',
    },
  ];
}
