import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../core/cart.service';
import { CatalogService } from '../core/catalog.service';
import { AuthService } from '../core/auth.service';
import { OrderService } from '../core/order.service';
import { StorageService } from '../core/storage.service';
import { demoCard, expiry, trimRequired } from '../core/validators';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-checkout',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, Heading, ErrorMessage],
  template: `<p><a class="secondary" routerLink="/cart">← Back to bag</a></p>
    <app-heading
      eyebrow="ALMOST AT YOUR TABLE"
      title="MAKE IT YOURS."
      copy="Review your details and choose how to receive your order."
    />
    @if (cart.count()) {
      <form [formGroup]="form" (ngSubmit)="submit()">
        <app-error [message]="error()" />
        <div class="form-layout">
          <section>
            <div class="panel">
              <h2>CONTACT INFORMATION</h2>
              <label
                ><span>FULL NAME</span
                ><input
                  formControlName="name"
                  autocomplete="name"
                  [attr.aria-invalid]="invalid('name')"
                />
                @if (invalid('name')) {
                  <small class="field-error">Enter your full name.</small>
                }</label
              ><label
                ><span>EMAIL</span
                ><input
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  [attr.aria-invalid]="invalid('email')"
                />
                @if (invalid('email')) {
                  <small class="field-error">Enter a valid email address.</small>
                }</label
              ><label
                ><span>PHONE</span
                ><input
                  formControlName="phone"
                  type="tel"
                  autocomplete="tel"
                  [attr.aria-invalid]="invalid('phone')"
                />
                @if (invalid('phone')) {
                  <small class="field-error">Enter a phone number with 8–15 digits.</small>
                }
              </label>
            </div>
            <h2>HOW WOULD YOU LIKE IT?</h2>
            <label class="choice"
              ><input type="radio" formControlName="fulfillment" value="pickup" />Campus pickup ·
              Free</label
            ><label class="choice"
              ><input type="radio" formControlName="fulfillment" value="delivery" />Delivery · EGP
              30</label
            >
            @if (value().fulfillment === 'pickup') {
              <div class="panel">
                <h3>CAMPUS COLLECTION DESK</h3>
                <p class="muted">
                  Main campus · Culinary institute<br />Please bring your order number.
                </p>
              </div>
            } @else {
              <label
                ><span>STREET, BUILDING & AREA</span
                ><input formControlName="address" autocomplete="street-address" />
                @if (invalid('address')) {
                  <small class="field-error">Enter your delivery address.</small>
                }
              </label>
            }
            <label
              ><span>{{ value().fulfillment === 'pickup' ? 'COLLECTION' : 'DELIVERY' }} TIME</span
              ><select formControlName="slot">
                <option value="">Choose an available time</option>
                @for (slot of slots(); track slot) {
                  <option [value]="slot">{{ slot }}</option>
                }
              </select>
              @if (invalid('slot')) {
                <small class="field-error">Choose an available time.</small>
              }
            </label>
            <h2>PAYMENT</h2>
            <label class="choice"
              ><input type="radio" formControlName="payment" value="cash" />Pay on
              {{ value().fulfillment === 'pickup' ? 'pickup' : 'delivery' }}</label
            ><label class="choice"
              ><input type="radio" formControlName="payment" value="card" />Demo card</label
            >
            @if (value().payment === 'card') {
              <div class="panel">
                <h3>TEST CARD DETAILS</h3>
                <p class="small muted">Use 4242 4242 4242 4242. No card number or CVC is saved.</p>
                <label
                  ><span>NAME ON CARD</span
                  ><input formControlName="cardName" autocomplete="off" /></label
                ><label
                  ><span>DEMO CARD NUMBER</span
                  ><input formControlName="cardNumber" inputmode="numeric" autocomplete="off" />
                  @if (invalid('cardNumber')) {
                    <small class="field-error">Use the demo card 4242 4242 4242 4242.</small>
                  }
                </label>
                <div class="filters">
                  <label
                    ><span>EXPIRY · MM/YY</span
                    ><input formControlName="expiry" placeholder="12/28" autocomplete="off" />
                    @if (invalid('expiry')) {
                      <small class="field-error">Enter a future expiry date.</small>
                    }</label
                  ><label
                    ><span>CVC</span
                    ><input
                      formControlName="cvc"
                      type="password"
                      inputmode="numeric"
                      maxlength="3"
                      autocomplete="off"
                    />
                    @if (invalid('cvc')) {
                      <small class="field-error">Enter three digits.</small>
                    }
                  </label>
                </div>
              </div>
            }
          </section>
          <aside class="panel">
            <h2>ORDER SUMMARY</h2>
            @for (l of cart.lines(); track l.id) {
              <p class="small">
                {{ l.qty }} × {{ catalog.get(l.productKey)!.name }}<br /><span class="muted"
                  >{{ l.option }} · {{ l.qty * l.price | currency: 'EGP' : 'code' }}</span
                >
              </p>
            }
            <div class="summary">
              <span>Subtotal</span><b>{{ cart.subtotal() | currency: 'EGP' : 'code' }}</b>
            </div>
            <div class="summary">
              <span>Fulfillment</span><b>{{ fee() ? 'EGP ' + fee() : 'Free' }}</b>
            </div>
            <div class="summary total">
              <span>Total</span><b>{{ total() | currency: 'EGP' : 'code' }}</b>
            </div>
            <p class="notice">
              Frontend demonstration. No payment is collected and no kitchen order is sent.
            </p>
            <button class="primary full" type="submit" [disabled]="busy()">
              {{ busy() ? 'Placing order…' : 'Place order' }} ·
              {{ total() | currency: 'EGP' : 'code' }}
            </button>
          </aside>
        </div>
      </form>
    } @else {
      <div class="panel empty">
        <h2>YOUR BAG IS EMPTY.</h2>
        <a class="primary" routerLink="/shop">Explore the collection</a>
      </div>
    }`,
})
export class CheckoutPage {
  cart = inject(CartService);
  catalog = inject(CatalogService);
  auth = inject(AuthService);
  orders = inject(OrderService);
  storage = inject(StorageService);
  router = inject(Router);
  fb = inject(FormBuilder);
  error = signal('');
  busy = signal(false);
  form = this.fb.nonNullable.group({
    name: [this.auth.user()?.name || '', [trimRequired, Validators.maxLength(80)]],
    email: [this.auth.user()?.email || '', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{8,22}$/)]],
    fulfillment: ['pickup', Validators.required],
    address: [''],
    slot: ['', Validators.required],
    payment: ['cash', Validators.required],
    cardName: [''],
    cardNumber: [''],
    expiry: [''],
    cvc: [''],
  });
  value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  fee = computed(() => (this.value().fulfillment === 'delivery' ? 30 : 0));
  total = computed(() => this.cart.subtotal() + this.fee());
  slots = computed(() =>
    this.value().fulfillment === 'delivery'
      ? ['Today · 14:00–16:00', 'Today · 16:00–18:00']
      : ['Today · 12:30–13:00', 'Today · 13:00–13:30', 'Today · 14:00–14:30'],
  );
  constructor() {
    this.form.controls.fulfillment.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      this.form.controls.address.setValidators(v === 'delivery' ? [trimRequired] : []);
      this.form.controls.address.updateValueAndValidity({ emitEvent: false });
      this.form.controls.slot.setValue('');
    });
    this.form.controls.payment.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      const card = v === 'card';
      this.form.controls.cardName.setValidators(card ? [trimRequired] : []);
      this.form.controls.cardNumber.setValidators(card ? [demoCard] : []);
      this.form.controls.expiry.setValidators(card ? [expiry] : []);
      this.form.controls.cvc.setValidators(
        card ? [Validators.pattern(/^\d{3}$/), Validators.required] : [],
      );
      for (const k of ['cardName', 'cardNumber', 'expiry', 'cvc'] as const)
        this.form.controls[k].updateValueAndValidity({ emitEvent: false });
    });
    const draft = this.storage.read<Record<string, string> | null>('checkout', null, true);
    if (draft) {
      this.form.patchValue(draft);
      if (!this.slots().includes(this.form.controls.slot.value))
        this.form.controls.slot.setValue('');
    }
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      const { cardName, cardNumber, expiry, cvc, ...safe } = v;
      this.storage.write('checkout', safe, true);
    });
  }
  invalid(k: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[k];
    return c.invalid && c.touched;
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Please complete the highlighted contact, time and payment fields.');
      return;
    }
    this.busy.set(true);
    try {
      const v = this.form.getRawValue();
      const o = this.orders.place({
        contact: { name: v.name, email: v.email, phone: v.phone, address: v.address },
        fulfillment: v.fulfillment === 'delivery' ? 'delivery' : 'pickup',
        slot: v.slot,
        payment: v.payment === 'card' ? 'Demo card •••• 4242' : 'Pay on ' + v.fulfillment,
      });
      void this.router.navigate(['/order', o.id]);
    } catch (e) {
      this.error.set((e as Error).message);
      this.busy.set(false);
    }
  }
}
