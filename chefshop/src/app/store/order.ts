import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderService } from '../core/order.service';
import { CatalogService } from '../core/catalog.service';
import { Heading } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order',
  imports: [CurrencyPipe, DatePipe, RouterLink, Heading],
  template: `@if (order(); as o) {
      <div class="success" aria-hidden="true">✓</div>
      <app-heading
        [eyebrow]="'ORDER ' + o.id"
        title="GOOD FOOD IS ON ITS WAY."
        copy="Your simulated order has been confirmed. Thank you for supporting our student chefs."
      />
      <div class="stats">
        <div class="panel stat">
          <p class="eyebrow">ORDER TOTAL</p>
          <p class="value">{{ o.total | currency: 'EGP' : 'code' }}</p>
          <p class="muted">{{ o.date | date }}</p>
        </div>
        <div class="panel stat">
          <p class="eyebrow">FULFILLMENT</p>
          <p class="value">{{ o.fulfillment === 'pickup' ? 'Campus pickup' : 'Delivery' }}</p>
          <p>{{ o.slot }}</p>
        </div>
        <div class="panel stat">
          <p class="eyebrow">PAYMENT</p>
          <p>{{ o.payment }}</p>
          <p class="small muted">No payment was collected.</p>
        </div>
      </div>
      <div class="panel">
        <h2>YOUR ORDER DETAILS</h2>
        <p>{{ o.contact.name }}<br />{{ o.contact.email }} · {{ o.contact.phone }}</p>
        <p class="muted">
          {{ o.fulfillment === 'pickup' ? 'Main campus collection desk' : o.contact.address }}
        </p>
        @for (l of o.items; track l.id) {
          <div class="summary">
            <span
              >{{ l.qty }} × {{ catalog.get(l.productKey)!.name }}<br /><small class="muted">{{
                l.option
              }}</small></span
            ><b>{{ l.price * l.qty | currency: 'EGP' : 'code' }}</b>
          </div>
        }
        <div class="summary">
          <span>Fulfillment</span><b>{{ o.fee | currency: 'EGP' : 'code' }}</b>
        </div>
        <div class="summary total">
          <span>Total</span><b>{{ o.total | currency: 'EGP' : 'code' }}</b>
        </div>
      </div>
      <div class="actions">
        <a class="primary" routerLink="/shop">Continue shopping</a
        ><a class="secondary" routerLink="/">Back to home</a>
      </div>
    } @else {
      <app-heading
        title="NO ORDER TO SHOW."
        copy="Complete checkout to see your confirmation, or sign in to the account that placed this order."
      /><a class="primary" routerLink="/shop">Open the shop</a>
    }`,
})
export class OrderPage {
  orders = inject(OrderService);
  catalog = inject(CatalogService);
  params = toSignal(inject(ActivatedRoute).paramMap);
  order = computed(() => this.orders.get(this.params()?.get('id') || ''));
}
