import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Heading } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-academy',
  imports: [RouterLink, Heading],
  template: `<app-heading
      eyebrow="THE CULINARY INSTITUTE"
      title="LEARN IT. COOK IT. SHARE IT."
      copy="Build your craft through hands-on practice and chef guidance."
    /><img
      class="photo"
      src="assets/catalog/academy.png"
      alt="Students learning in the culinary institute kitchen"
      width="600"
      height="420"
    />
    <div class="actions">
      <a class="primary" routerLink="/academy" fragment="programs">Explore programs ↓</a
      ><a class="secondary" routerLink="/shop" [queryParams]="{ category: 'meal' }"
        >Shop student meals</a
      >
    </div>
    <section class="section">
      <p class="eyebrow">FROM CLASSROOM TO YOUR TABLE</p>
      <h2>REAL PRACTICE. REAL POSSIBILITY.</h2>
      <p class="intro">
        Students learn technique, prepare dishes under supervision, and gain experience through the
        shop and catering events.
      </p>
      <div class="steps">
        @for (s of steps; track s; let i = $index) {
          <div class="panel">
            <p class="eyebrow">0{{ i + 1 }}</p>
            <h3>{{ s }}</h3>
          </div>
        }
      </div>
    </section>
    <section class="section" id="programs">
      <p class="eyebrow">FIND YOUR PLACE IN THE KITCHEN</p>
      <h2>YOUR CRAFT. YOUR NEXT CHAPTER.</h2>
      <div class="grid">
        @for (p of programs; track p.name) {
          <article class="card">
            <img
              class="photo"
              [src]="p.image"
              [alt]="p.name"
              loading="lazy"
              width="600"
              height="420"
            />
            <h3>{{ p.name }}</h3>
            <p class="muted">{{ p.copy }}</p>
            <details>
              <summary>Program overview</summary>
              <p>
                Campus kitchen sessions combine practical demonstrations, supervised cooking and
                constructive feedback. Contact the academy team for module dates and enrollment.
              </p>
              <a class="secondary" routerLink="/student">Student workspace →</a>
            </details>
          </article>
        }
      </div>
    </section>`,
})
export class AcademyPage {
  steps = [
    'Learn the foundations',
    'Prepare with chef guidance',
    'Serve the community',
    'Reflect and improve',
  ];
  programs = [
    {
      name: 'CULINARY FOUNDATIONS',
      image: 'assets/catalog/foundations.png',
      copy: 'Knife skills, kitchen practice and the fundamentals of good cooking.',
    },
    {
      name: 'BAKING & PASTRY',
      image: 'assets/catalog/pastry.png',
      copy: 'From dough to delicate pastry, learn through careful practice.',
    },
    {
      name: 'MEDITERRANEAN COOKING',
      image: 'assets/catalog/academy.png',
      copy: 'Explore the flavours of Egypt, Italy and Greece.',
    },
  ];
}
