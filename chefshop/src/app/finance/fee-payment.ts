import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService } from '../core/finance.service';
import { AuthService } from '../core/auth.service';
import { UiService } from '../core/ui.service';
import { demoCard, expiry, trimRequired } from '../core/validators';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fee-payment',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, Heading, ErrorMessage],
  template: `<p><a class="secondary" routerLink="/fees">← Fee records</a></p>
    <app-heading
      eyebrow="STUDENT FINANCE"
      title="YOUR NEXT CHAPTER AWAITS."
      copy="Review your module and complete a simulated fee payment."
    />
    @if (invoice(); as i) {
      @if (finance.balance(i) > 0) {
        <div class="form-layout">
          <section class="panel">
            <h2>{{ i.module }}</h2>
            <p>{{ auth.user()!.name }} · {{ i.id }}</p>
            <div class="summary">
              <span>Invoice amount</span><b>{{ i.amount | currency: 'EGP' : 'code' }}</b>
            </div>
            <div class="summary total">
              <span>Outstanding</span><b>{{ finance.balance(i) | currency: 'EGP' : 'code' }}</b>
            </div>
            <p class="notice">
              Module fees are separate from product purchases. Use the demo card. No real payment is
              collected.
            </p>
          </section>
          <form class="panel" [formGroup]="form" (ngSubmit)="pay()">
            <h2>DEMO CARD PAYMENT</h2>
            <app-error [message]="error()" /><label
              ><span>PAYMENT AMOUNT · EGP</span
              ><input
                type="number"
                min="0.01"
                [max]="finance.balance(i)"
                step="0.01"
                formControlName="amount" /></label
            ><label
              ><span>NAME ON CARD</span><input formControlName="name" autocomplete="off" /></label
            ><label
              ><span>DEMO CARD NUMBER · 4242 4242 4242 4242</span
              ><input formControlName="number" inputmode="numeric" autocomplete="off"
            /></label>
            <div class="form-two">
              <label
                ><span>EXPIRY · MM/YY</span
                ><input formControlName="expiry" placeholder="12/28" autocomplete="off" /></label
              ><label
                ><span>CVC</span
                ><input
                  formControlName="cvc"
                  type="password"
                  inputmode="numeric"
                  maxlength="3"
                  autocomplete="off"
              /></label>
            </div>
            <button class="primary full" type="submit" [disabled]="busy()">
              {{ busy() ? 'Recording payment…' : 'Pay module fee · Demo' }}
            </button>
          </form>
        </div>
      } @else {
        <div class="panel">
          <h2>THIS INVOICE IS PAID.</h2>
          <a class="primary" routerLink="/fees">View history and receipt</a>
        </div>
      }
    } @else {
      <div class="error">This invoice is unavailable for your account.</div>
    }`,
})
export class FeePaymentPage {
  finance = inject(FinanceService);
  auth = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  params = toSignal(inject(ActivatedRoute).paramMap);
  error = signal('');
  busy = signal(false);
  invoice = computed(() => this.finance.invoices().find((i) => i.id === this.params()?.get('id')));
  form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    name: [this.auth.user()!.name, trimRequired],
    number: ['', demoCard],
    expiry: ['', expiry],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });
  constructor() {
    this.form.controls.amount.setValue(this.invoice() ? this.finance.balance(this.invoice()!) : 0);
  }
  pay(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set(
        'Enter a positive amount, cardholder name, the demo card, future expiry and three-digit CVC.',
      );
      return;
    }
    this.busy.set(true);
    try {
      const id = this.finance.payInvoice(
        this.invoice()!.id,
        this.form.controls.amount.value,
        'Demo card •••• 4242',
      );
      void this.router.navigate(['/receipt', id]);
    } catch (e) {
      this.error.set((e as Error).message);
      this.busy.set(false);
    }
  }
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-receipt',
  imports: [CurrencyPipe, DatePipe, RouterLink, Heading],
  template: `@if (record(); as r) {
      <div class="success" aria-hidden="true">✓</div>
      <app-heading
        [eyebrow]="'RECEIPT ' + r.payment.receiptId"
        title="YOU’RE ALL SET."
        copy="Your simulated module payment has been recorded."
      />
      <section class="panel form-narrow">
        <p class="eyebrow">PAID</p>
        <p class="price-large">{{ r.payment.amount | currency: 'EGP' : 'code' }}</p>
        <h2>{{ r.invoice.module }}</h2>
        <dl>
          <dt>Student</dt>
          <dd>{{ studentName(r.invoice.studentId) }}</dd>
          <dt>Invoice</dt>
          <dd>{{ r.invoice.id }}</dd>
          <dt>Date</dt>
          <dd>{{ r.payment.date | date }}</dd>
          <dt>Payment method</dt>
          <dd>{{ r.payment.method }}</dd>
          <dt>Remaining balance</dt>
          <dd>{{ finance.balance(r.invoice) | currency: 'EGP' : 'code' }}</dd>
        </dl>
        <p class="small muted">Frontend demo receipt. No payment was collected.</p>
      </section>
      <div class="actions">
        <a class="primary" routerLink="/fees">Fee records & history</a>
        @if (auth.user()?.role === 'student') {
          <a class="secondary" routerLink="/student">Student dashboard</a>
        }
        <a class="secondary" routerLink="/shop" [queryParams]="{ category: 'essential' }"
          >Shop student essentials</a
        >
      </div>
    } @else {
      <app-heading
        title="RECEIPT UNAVAILABLE."
        copy="This receipt does not exist or is not authorized for your account."
      /><a class="primary" routerLink="/fees">Back to fee records</a>
    }`,
})
export class ReceiptPage {
  finance = inject(FinanceService);
  auth = inject(AuthService);
  params = toSignal(inject(ActivatedRoute).paramMap);
  record = computed(() => {
    for (const invoice of this.finance.invoices()) {
      const payment = invoice.payments.find((p) => p.receiptId === this.params()?.get('id'));
      if (payment) return { invoice, payment };
    }
    return null;
  });
  studentName(id: string): string {
    return this.finance.db.data().users.find((u) => u.id === id)?.name || id;
  }
}
