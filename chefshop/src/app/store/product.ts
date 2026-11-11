import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { CatalogService } from '../core/catalog.service';
import { CartService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { UiService } from '../core/ui.service';
import { Heading, ProductCard, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product',
  imports: [CurrencyPipe, FormsModule, RouterLink, Heading, ProductCard, ErrorMessage],
  template: `@if (product(); as p) {
      <p>
        <a class="secondary" routerLink="/shop" [queryParams]="{ category: p.category }"
          >← Back to
          {{
            p.category === 'meal'
              ? 'meals'
              : p.category === 'spice'
                ? 'spices'
                : p.category === 'tool'
                  ? 'tools'
                  : 'student essentials'
          }}</a
        >
      </p>
      <div class="detail">
        <div class="product-hero">
          <img [src]="catalog.image(p)" [alt]="p.name" width="600" height="600" />
        </div>
        <section>
          <app-heading [eyebrow]="p.region || 'SELECTED FOR YOUR KITCHEN'" [title]="p.name" />
          <p class="price-large">{{ selected().price | currency: 'EGP' : 'code' }}</p>
          <p class="intro">{{ p.copy }}</p>
          @if (p.category === 'meal') {
            <p class="small muted">
              Student-made · Chef-guided · Campus pickup<br />Allergens:
              {{ catalog.allergens[p.key] }}. Ask our team about allergens before ordering.
            </p>
            <button class="secondary" (click)="openLayers()">Explore the layers ↗</button>
          } @else {
            <p class="small muted">
              Available from the campus store.
              {{
                p.category === 'spice'
                  ? 'Store sealed in a cool, dry place.'
                  : 'Follow the supplied care instructions.'
              }}
            </p>
          }
          <label class="section"
            ><span>{{ p.key === 'uniform' ? 'JACKET SIZE' : 'OPTION' }}</span
            ><select [ngModel]="option()" (ngModelChange)="option.set(+$event)">
              @for (o of options(); track o.label; let i = $index) {
                <option [value]="i">
                  {{ o.label }} · {{ o.price | currency: 'EGP' : 'code' }}
                </option>
              }
            </select></label
          >
          <p class="eyebrow">QUANTITY</p>
          <div class="qty">
            <button (click)="qty.set(Math.max(1, qty() - 1))" aria-label="Decrease quantity">
              −</button
            ><output>{{ qty() }}</output
            ><button (click)="qty.set(Math.min(10, qty() + 1))" aria-label="Increase quantity">
              +
            </button>
          </div>
          <app-error [message]="error()" /><button class="primary full" (click)="add()">
            Add to bag · {{ selected().price * qty() | currency: 'EGP' : 'code' }}
          </button>
          @if (added()) {
            <div class="notice" role="status">
              Added to your bag. <a routerLink="/cart">View bag →</a>
            </div>
          }
          <p class="small muted">Available today · Maximum 10 per option.</p>
        </section>
      </div>
      @if (related().length) {
        <section class="section">
          <p class="eyebrow">OPTIONAL EXTRAS</p>
          <h2>{{ p.category === 'meal' ? 'RECREATE IT AT HOME.' : 'PUT IT TO DELICIOUS USE.' }}</h2>
          <div class="grid">
            @for (r of related(); track r.key) {
              <app-product-card [product]="r" />
            }
          </div>
        </section>
      }
      <dialog #layers (close)="layerOpen.set(false)" aria-labelledby="layers-title">
        <div class="modal-top">
          <b id="layers-title">Every layer, revealed</b
          ><button class="secondary" (click)="closeLayers()">Close ×</button>
        </div>
        @if (layerOpen()) {
          <iframe
            [src]="layerUrl()"
            title="Interactive V6 ingredient layers"
            allow="autoplay"
          ></iframe>
        }
      </dialog>
    } @else {
      <app-heading title="THIS DISH IS OFF THE MENU." /><a class="primary" routerLink="/shop"
        >Back to shop</a
      >
    }`,
})
export class ProductPage {
  catalog = inject(CatalogService);
  cart = inject(CartService);
  auth = inject(AuthService);
  ui = inject(UiService);
  route = inject(ActivatedRoute);
  sanitizer = inject(DomSanitizer);
  key = signal('');
  qty = signal(1);
  option = signal(0);
  error = signal('');
  added = signal(false);
  Math = Math;
  layerOpen = signal(false);
  layers = viewChild<ElementRef<HTMLDialogElement>>('layers');
  product = computed(() => this.catalog.get(this.key()));
  options = computed(() => (this.product() ? this.catalog.options(this.product()!) : []));
  selected = computed(() => this.options()[this.option()] || { label: '', price: 0 });
  related = computed(() =>
    this.product()?.category === 'meal'
      ? (this.catalog.related[this.key()] || []).map((k) => this.catalog.get(k)!)
      : this.catalog.products
          .filter((p) => this.catalog.related[p.key]?.includes(this.key()))
          .slice(0, 4),
  );
  layerUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      'assets/motion/meal-explorer.html?meal=' + encodeURIComponent(this.key()),
    ),
  );
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.key.set(p.get('key') || '');
      this.qty.set(1);
      this.option.set(this.key() === 'pizza' ? 1 : 0);
      this.added.set(false);
      this.error.set('');
      this.closeLayers();
    });
  }
  add(): void {
    try {
      this.cart.add(this.product()!, this.selected().label, this.qty());
      this.added.set(true);
      this.ui.notify(this.product()!.name + ' added to your bag.');
      if (this.auth.user()?.preferences.audio) this.ui.sound();
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  openLayers(): void {
    this.layerOpen.set(true);
    this.layers()?.nativeElement.showModal();
  }
  closeLayers(): void {
    this.layers()?.nativeElement.close();
    this.layerOpen.set(false);
  }
}
