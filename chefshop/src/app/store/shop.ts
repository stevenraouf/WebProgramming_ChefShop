import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogService } from '../core/catalog.service';
import { Heading, ProductCard } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shop',
  imports: [FormsModule, RouterLink, Heading, ProductCard],
  template: `<app-heading
      eyebrow="COOK. DISCOVER. RECREATE."
      [title]="title()"
      copy="Thoughtfully made and selected to bring the craft home."
    />
    <div class="tabs" aria-label="Product categories">
      @for (c of categories; track c.key) {
        <button
          class="secondary"
          [class.selected]="category() === c.key"
          (click)="changeCategory(c.key)"
          [attr.aria-pressed]="category() === c.key"
        >
          {{ c.name }}
        </button>
      }
    </div>
    <label
      ><span>SEARCH THE COLLECTION</span
      ><input
        type="search"
        placeholder="Try pasta, pepper or knife…"
        [ngModel]="query()"
        (ngModelChange)="query.set($event); sync()"
    /></label>
    @if (category() === 'meal') {
      <div class="chips" aria-label="Cuisine">
        @for (c of ['All', 'Egypt', 'Italy', 'Greece']; track c) {
          <button
            class="secondary"
            [class.selected]="region() === c"
            (click)="region.set(c); sync()"
            [attr.aria-pressed]="region() === c"
          >
            {{ c }}
          </button>
        }
      </div>
    }
    <div class="filters">
      <label
        ><span>PRICE RANGE</span
        ><select [ngModel]="max()" (ngModelChange)="max.set(+$event); sync()">
          <option [value]="0">All prices</option>
          <option [value]="100">Up to EGP 100</option>
          <option [value]="200">Up to EGP 200</option>
          <option [value]="500">Up to EGP 500</option>
        </select></label
      ><label
        ><span>SORT BY</span
        ><select [ngModel]="sort()" (ngModelChange)="sort.set($event); sync()">
          <option value="featured">Featured</option>
          <option value="price">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select></label
      >
    </div>
    <p class="small muted" role="status">
      {{ filtered().length }} {{ filtered().length === 1 ? 'product' : 'products' }}
    </p>
    @if (filtered().length) {
      <div class="grid">
        @for (p of filtered(); track p.key) {
          <app-product-card [product]="p" />
        }
      </div>
    } @else {
      <div class="panel empty">
        <h2>NO MATCHES.</h2>
        <p>Try a different search or clear your filters.</p>
      </div>
    }
    <div class="actions">
      <button class="secondary" (click)="clear()">Clear filters</button>
      @if (category() !== 'essential') {
        <a class="secondary" routerLink="/shop" [queryParams]="{ category: 'essential' }"
          >Uniforms & knife kits →</a
        >
      }
    </div>`,
})
export class ShopPage {
  catalog = inject(CatalogService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  category = signal('meal');
  region = signal('All');
  query = signal('');
  max = signal(0);
  sort = signal('featured');
  categories = [
    { key: 'meal', name: 'Meals' },
    { key: 'spice', name: 'Spices' },
    { key: 'tool', name: 'Tools' },
    { key: 'essential', name: 'Student' },
  ];
  title = computed(
    () =>
      ({
        meal: 'STUDENT MEALS',
        spice: 'SPICES & HERBS',
        tool: 'KITCHEN TOOLS',
        essential: 'STUDENT ESSENTIALS',
      })[this.category()] || 'OUR COLLECTION',
  );
  filtered = computed(() => {
    const ps = this.catalog.products.filter(
      (p) =>
        p.category === this.category() &&
        (this.category() !== 'meal' || this.region() === 'All' || p.region === this.region()) &&
        (!this.max() || p.price <= this.max()) &&
        p.name.toLowerCase().includes(this.query().toLowerCase().trim()),
    );
    return this.sort() === 'price'
      ? ps.sort((a, b) => a.price - b.price)
      : this.sort() === 'high'
        ? ps.sort((a, b) => b.price - a.price)
        : ps;
  });
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.category.set(
        this.categories.some((c) => c.key === p.get('category')) ? p.get('category')! : 'meal',
      );
      this.region.set(p.get('region') || 'All');
      this.query.set(p.get('q') || '');
      this.max.set(Number(p.get('max')) || 0);
      this.sort.set(p.get('sort') || 'featured');
    });
  }
  sync(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.category(),
        region: this.region() === 'All' ? null : this.region(),
        q: this.query() || null,
        max: this.max() || null,
        sort: this.sort() === 'featured' ? null : this.sort(),
      },
      replaceUrl: true,
    });
  }
  changeCategory(c: string): void {
    this.category.set(c);
    this.query.set('');
    this.max.set(0);
    this.region.set('All');
    this.sort.set('featured');
    this.sync();
  }
  clear(): void {
    this.query.set('');
    this.region.set('All');
    this.max.set(0);
    this.sort.set('featured');
    this.sync();
  }
}
