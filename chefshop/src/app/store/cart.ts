import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { CatalogService } from '../core/catalog.service';
import { UiService } from '../core/ui.service';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink, Heading, ErrorMessage],
  template: `<app-heading
      eyebrow="ONE SHARED BAG"
      title="YOUR NEXT GOOD MEAL."
      copy="Your meals, spices, tools and student essentials."
    /><app-error [message]="error()" />
    @if (cart.lines().length) {
      <div class="form-layout">
        <section>
          @for (l of cart.lines(); track l.id) {
            <article class="panel">
              <div class="line">
                <img
                  [src]="catalog.image(catalog.get(l.productKey)!)"
                  alt=""
                  width="88"
                  height="95"
                />
                <div>
                  <h3>{{ catalog.get(l.productKey)!.name }}</h3>
                  <p class="small muted">
                    {{ l.option }}<br />{{ l.price | currency: 'EGP' : 'code' }} each
                  </p>
                </div>
              </div>
              <div class="qty">
                <button
                  (click)="change(l.id, -1)"
                  [attr.aria-label]="'Decrease ' + catalog.get(l.productKey)!.name + ' quantity'"
                >
                  −</button
                ><output>{{ l.qty }}</output
                ><button
                  (click)="change(l.id, 1)"
                  [attr.aria-label]="'Increase ' + catalog.get(l.productKey)!.name + ' quantity'"
                >
                  +
                </button>
              </div>
              <div class="inline">
                <b>{{ l.price * l.qty | currency: 'EGP' : 'code' }}</b
                ><button class="remove" (click)="cart.remove(l.id); ui.notify('Item removed.')">
                  Remove
                </button>
              </div>
            </article>
          }
        </section>
        <aside class="panel">
          <h2>YOUR BAG</h2>
          <div class="summary total">
            <span>Subtotal</span><span>{{ cart.subtotal() | currency: 'EGP' : 'code' }}</span>
          </div>
          <p class="muted small">Campus pickup is free. Delivery adds EGP 30 at checkout.</p>
          <div class="actions">
            <a class="primary" routerLink="/checkout">Proceed to checkout</a>
          </div>
          <a class="secondary full" routerLink="/shop">Continue shopping</a>
        </aside>
      </div>
    } @else {
      <div class="panel empty">
        <h2>YOUR BAG IS WAITING.</h2>
        <p class="muted">Discover something delicious, or the tools to make it yourself.</p>
        <a class="primary" routerLink="/shop">Explore the collection</a>
      </div>
    }`,
})
export class CartPage {
  cart = inject(CartService);
  catalog = inject(CatalogService);
  ui = inject(UiService);
  error = signal('');
  change(id: string, delta: number): void {
    try {
      this.cart.change(id, delta);
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
