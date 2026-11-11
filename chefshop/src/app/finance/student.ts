import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FinanceService } from '../core/finance.service';
import { CatalogService } from '../core/catalog.service';
import { Heading, ProductCard } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-student',
  imports: [CurrencyPipe, RouterLink, Heading, ProductCard],
  template: `<app-heading
      eyebrow="YOUR CULINARY JOURNEY"
      [title]="'GOOD MORNING, ' + auth.user()!.name.split(' ')[0].toUpperCase() + '.'"
      copy="A little closer to your future."
    />
    <div class="stats">
      <div class="panel stat">
        <p class="eyebrow">YOUR OUTSTANDING FEES</p>
        <p class="value">{{ balance() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">MODULE INVOICES</p>
        <p class="value">{{ invoices().length }}</p>
      </div>
    </div>
    @if (next(); as i) {
      <section class="panel">
        <p class="eyebrow">YOUR NEXT CHAPTER</p>
        <h2>{{ i.module }}</h2>
        <p>Due {{ i.due }} · {{ finance.balance(i) | currency: 'EGP' : 'code' }}</p>
        <a class="primary" [routerLink]="['/fees', i.id, 'pay']">Pay module fee →</a>
      </section>
    } @else {
      <div class="panel">
        <h2>{{ invoices().length ? 'YOU’RE ALL SET.' : 'WELCOME TO THE ACADEMY.' }}</h2>
        <p class="muted">
          {{
            invoices().length
              ? 'Your recorded module fees are paid.'
              : 'Accounting will create your module invoice after enrollment.'
          }}
        </p>
      </div>
    }
    <div class="actions">
      <a class="secondary" routerLink="/fees">Fee records & payment history</a
      ><a class="secondary" routerLink="/profile">Your profile</a>
    </div>
    <section class="section">
      <p class="eyebrow">READY FOR THE KITCHEN</p>
      <h2>THE ESSENTIALS FOR YOUR NEXT CHAPTER.</h2>
      <div class="grid">
        @for (p of essentials; track p.key) {
          <app-product-card [product]="p" />
        }
      </div>
    </section>
    <a class="secondary" routerLink="/academy" fragment="programs">Explore academy programs</a>`,
})
export class StudentPage {
  auth = inject(AuthService);
  finance = inject(FinanceService);
  catalog = inject(CatalogService);
  invoices = computed(() => this.finance.invoices());
  balance = computed(() => this.invoices().reduce((n, i) => n + this.finance.balance(i), 0));
  next = computed(
    () =>
      this.invoices()
        .filter((i) => this.finance.balance(i) > 0)
        .sort((a, b) => a.due.localeCompare(b.due))[0],
  );
  essentials = this.catalog.products.filter((p) => p.category === 'essential');
}
