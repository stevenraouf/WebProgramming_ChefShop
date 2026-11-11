import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FinanceService } from '../core/finance.service';
import { UiService } from '../core/ui.service';
import { Invoice, today } from '../core/models';
import { trimRequired } from '../core/validators';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fees',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    Heading,
    ErrorMessage,
  ],
  template: `<p>
      <a class="secondary" [routerLink]="auth.isFinance() ? '/operations' : '/student'"
        >← {{ auth.isFinance() ? 'Operations overview' : 'Student dashboard' }}</a
      >
    </p>
    <app-heading
      eyebrow="STUDENT FINANCE"
      title="EVERY CHAPTER, ACCOUNTED FOR."
      copy="Invoices, outstanding fees and a clear payment history."
    />
    <div class="stats">
      <div class="panel stat">
        <p class="eyebrow">INVOICED</p>
        <p class="value">{{ invoiced() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">PAID</p>
        <p class="value">{{ paid() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">OUTSTANDING</p>
        <p class="value">{{ invoiced() - paid() | currency: 'EGP' : 'code' }}</p>
      </div>
    </div>
    <div class="filters">
      <label
        ><span>SEARCH STUDENT OR MODULE</span
        ><input
          type="search"
          [ngModel]="search()"
          (ngModelChange)="search.set($event); page.set(0)" /></label
      ><label
        ><span>STATUS</span
        ><select [ngModel]="status()" (ngModelChange)="status.set($event); page.set(0)">
          <option value="All">All statuses</option>
          @for (s of ['Unpaid', 'Part paid', 'Paid', 'Overdue']; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select></label
      >
    </div>
    <div class="table-wrap">
      <table class="responsive-table">
        <caption>
          {{
            auth.isFinance() ? 'Student fee records' : 'Your fee records'
          }}
        </caption>
        <thead>
          <tr>
            <th>
              <button class="table-sort" (click)="descending.set(!descending())">
                Invoice / due date {{ descending() ? '↓' : '↑' }}
              </button>
            </th>
            <th>Student</th>
            <th>Module</th>
            <th>Amount</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (i of paged(); track i.id) {
            <tr>
              <th scope="row" data-label="Invoice">
                {{ i.id }}<br /><small class="muted">Due {{ i.due | date }}</small>
              </th>
              <td data-label="Student">{{ student(i.studentId) }}</td>
              <td data-label="Module">{{ i.module }}</td>
              <td data-label="Amount">{{ i.amount | currency: 'EGP' : 'code' }}</td>
              <td data-label="Balance">{{ finance.balance(i) | currency: 'EGP' : 'code' }}</td>
              <td data-label="Status">
                <span class="badge" [class.pending]="finance.balance(i) > 0">{{
                  finance.status(i)
                }}</span>
              </td>
              <td data-label="Actions">
                <div class="table-actions">
                  @if (finance.balance(i) > 0) {
                    @if (auth.isFinance()) {
                      <button class="secondary" (click)="startPayment(i)">Mark payment</button>
                    } @else {
                      <a class="primary" [routerLink]="['/fees', i.id, 'pay']">Pay fee</a>
                    }
                  }
                  <button class="secondary" (click)="history.set(history() === i.id ? '' : i.id)">
                    View history
                  </button>
                </div>
              </td>
            </tr>
            @if (history() === i.id) {
              <tr>
                <td colspan="7">
                  <section class="payment-history">
                    <h3>PAYMENT HISTORY · {{ i.id }}</h3>
                    @for (p of i.payments; track p.id) {
                      <div class="panel inline">
                        <div>
                          <strong>{{ p.amount | currency: 'EGP' : 'code' }}</strong
                          ><br /><span class="small muted"
                            >{{ p.date | date }} · {{ p.method }}</span
                          >
                        </div>
                        <a class="secondary" [routerLink]="['/receipt', p.receiptId]"
                          >View receipt</a
                        >
                      </div>
                    } @empty {
                      <p class="muted">No payments recorded.</p>
                    }
                  </section>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
      @if (!filtered().length) {
        <p class="empty">No invoices match these filters.</p>
      }
    </div>
    <div class="pagination">
      <button class="secondary" (click)="page.set(page() - 1)" [disabled]="page() === 0">
        Previous</button
      ><span>Page {{ page() + 1 }} of {{ pages() }}</span
      ><button class="secondary" (click)="page.set(page() + 1)" [disabled]="page() + 1 >= pages()">
        Next
      </button>
    </div>
    @if (auth.isFinance()) {
      <div class="form-layout section">
        <section class="panel" id="invoice-form">
          <h2>CREATE AN INVOICE</h2>
          <app-error [message]="error()" />
          <form [formGroup]="invoiceForm" (ngSubmit)="createInvoice()">
            <label
              ><span>STUDENT</span
              ><select formControlName="studentId">
                <option value="">Choose student</option>
                @for (s of finance.db.students(); track s.id) {
                  <option [value]="s.id">{{ s.name }} · {{ s.username }}</option>
                }
              </select></label
            ><label><span>MODULE</span><input formControlName="module" maxlength="100" /></label>
            <div class="form-two">
              <label
                ><span>AMOUNT · EGP</span
                ><input type="number" min="0.01" step="0.01" formControlName="amount" /></label
              ><label><span>DUE DATE</span><input type="date" formControlName="due" /></label>
            </div>
            <button class="primary full" type="submit">Create invoice</button>
          </form>
        </section>
        <section class="panel" id="payment-form">
          <h2>MARK A PAYMENT</h2>
          @if (selected(); as i) {
            <p>{{ student(i.studentId) }} · {{ i.module }}</p>
            <p class="money">Balance {{ finance.balance(i) | currency: 'EGP' : 'code' }}</p>
            <app-error [message]="paymentError()" />
            <form [formGroup]="paymentForm" (ngSubmit)="markPayment()">
              <label
                ><span>PAYMENT AMOUNT · EGP</span
                ><input type="number" min="0.01" step="0.01" formControlName="amount" /></label
              ><label
                ><span>METHOD</span
                ><select formControlName="method">
                  <option>Campus cash · Demo</option>
                  <option>Bank transfer · Demo</option>
                  <option>Demo card •••• 4242</option>
                </select></label
              ><button class="primary full" type="submit">Record demo payment</button
              ><button class="text-button" type="button" (click)="selectedId.set('')">
                Cancel
              </button>
            </form>
          } @else {
            <p class="muted">
              Choose “Mark payment” on an unpaid invoice. Partial payments are supported, and each
              payment creates a receipt.
            </p>
          }
        </section>
      </div>
    }
    <p class="notice">
      Tuition records are separate from the shopping bag and store sales. All payments here are
      simulated.
    </p>`,
})
export class FeesPage {
  auth = inject(AuthService);
  finance = inject(FinanceService);
  ui = inject(UiService);
  fb = inject(FormBuilder);
  search = signal('');
  status = signal('All');
  descending = signal(true);
  page = signal(0);
  history = signal('');
  selectedId = signal('');
  error = signal('');
  paymentError = signal('');
  invoices = computed(() => this.finance.invoices());
  invoiced = computed(() => this.invoices().reduce((n, i) => n + i.amount, 0));
  paid = computed(() =>
    this.invoices().reduce((n, i) => n + i.amount - this.finance.balance(i), 0),
  );
  filtered = computed(() =>
    this.invoices()
      .filter(
        (i) =>
          (this.student(i.studentId) + ' ' + i.module + ' ' + i.id)
            .toLowerCase()
            .includes(this.search().toLowerCase()) &&
          (this.status() === 'All' || this.finance.status(i) === this.status()),
      )
      .sort((a, b) => (this.descending() ? -1 : 1) * a.due.localeCompare(b.due)),
  );
  pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 5)));
  paged = computed(() => this.filtered().slice(this.page() * 5, (this.page() + 1) * 5));
  selected = computed(() => this.invoices().find((i) => i.id === this.selectedId()));
  invoiceForm = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
    module: ['', [trimRequired, Validators.maxLength(100)]],
    amount: [2400, [Validators.required, Validators.min(0.01)]],
    due: ['2026-11-16', Validators.required],
  });
  paymentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['Campus cash · Demo', Validators.required],
  });
  student(id: string): string {
    return this.finance.db.data().users.find((u) => u.id === id)?.name || id;
  }
  createInvoice(): void {
    this.invoiceForm.markAllAsTouched();
    if (this.invoiceForm.invalid) {
      this.error.set('Choose a student, enter a module, positive amount and due date.');
      return;
    }
    try {
      this.finance.createInvoice(this.invoiceForm.getRawValue());
      this.invoiceForm.reset({ studentId: '', module: '', amount: 2400, due: today() });
      this.error.set('');
      this.page.set(0);
      this.ui.notify('Student invoice created.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  startPayment(i: Invoice): void {
    this.selectedId.set(i.id);
    this.paymentForm.controls.amount.setValue(this.finance.balance(i));
    this.paymentError.set('');
    document.getElementById('payment-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  markPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentError.set('Enter a positive payment amount.');
      return;
    }
    try {
      const id = this.selectedId();
      this.finance.payInvoice(
        id,
        this.paymentForm.controls.amount.value,
        this.paymentForm.controls.method.value,
      );
      this.history.set(id);
      this.selectedId.set('');
      this.paymentError.set('');
      this.ui.notify('Payment recorded and receipt generated.');
    } catch (e) {
      this.paymentError.set((e as Error).message);
    }
  }
}
