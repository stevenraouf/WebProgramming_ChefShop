import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../core/finance.service';
import { DEPARTMENTS, Department, Transaction, today } from '../core/models';
import { UiService } from '../core/ui.service';
import { trimRequired } from '../core/validators';
import { Heading, ChartView, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-budgets',
  imports: [
    CurrencyPipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    Heading,
    ChartView,
    ErrorMessage,
  ],
  template: `<p><a class="secondary" routerLink="/operations">← Operations overview</a></p>
    <app-heading
      eyebrow="EVERY INGREDIENT COUNTS"
      title="KEEP COSTS IN VIEW."
      copy="Manage departmental income and expenses, with charts that update as records change."
    />
    <div class="filters">
      <label
        ><span>MONTH</span
        ><input
          type="month"
          [ngModel]="month()"
          (ngModelChange)="month.set($event); page.set(0)" /></label
      ><label
        ><span>DEPARTMENT</span
        ><select [ngModel]="department()" (ngModelChange)="department.set($event); page.set(0)">
          <option value="All">All departments</option>
          @for (d of departments; track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select></label
      >
    </div>
    <div class="stats">
      <div class="panel stat">
        <p class="eyebrow">INCOME</p>
        <p class="value">{{ income() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">EXPENSES</p>
        <p class="value">{{ expenses() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">BEFORE PAYROLL</p>
        <p class="value">{{ income() - expenses() | currency: 'EGP' : 'code' }}</p>
      </div>
    </div>
    <div class="panel">
      <app-chart
        title="Income and expenses by department"
        [labels]="chartLabels"
        [values]="chartValues()"
      />
    </div>
    <div class="inline section">
      <h2>DEPARTMENT LEDGER</h2>
      <a class="primary" routerLink="/budgets" fragment="transaction-form">Add transaction</a>
    </div>
    <label
      ><span>SEARCH DESCRIPTION</span
      ><input type="search" [ngModel]="search()" (ngModelChange)="search.set($event); page.set(0)"
    /></label>
    <div class="table-wrap">
      <table class="responsive-table">
        <caption>
          {{
            month()
          }}
          · Income and expense records
        </caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Department</th>
            <th>Type / category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (t of paged(); track t.id) {
            <tr>
              <td data-label="Date">{{ t.date }}</td>
              <td data-label="Department">{{ t.department }}</td>
              <td data-label="Type">{{ t.type }} · {{ t.category }}</td>
              <td data-label="Description">{{ t.description }}</td>
              <td data-label="Amount">{{ t.amount | currency: 'EGP' : 'code' }}</td>
              <td data-label="Actions">
                <div class="table-actions">
                  <button class="secondary" (click)="edit(t)">Edit</button
                  ><button class="text-button" (click)="deleteId.set(t.id)">Delete</button>
                </div>
                @if (deleteId() === t.id) {
                  <div class="notice">
                    <p>Delete this demo transaction?</p>
                    <button class="secondary" (click)="remove(t.id)">Confirm delete</button
                    ><button class="text-button" (click)="deleteId.set('')">Cancel</button>
                  </div>
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6">No records match the filters.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button class="secondary" (click)="page.set(page() - 1)" [disabled]="page() === 0">
        Previous</button
      ><span>Page {{ page() + 1 }} of {{ pages() }}</span
      ><button class="secondary" (click)="page.set(page() + 1)" [disabled]="page() + 1 >= pages()">
        Next
      </button>
    </div>
    <section class="panel section" id="transaction-form">
      <h2>{{ editing() ? 'EDIT TRANSACTION' : 'ADD A TRANSACTION' }}</h2>
      <app-error [message]="error()" />
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-two">
          <label><span>DATE</span><input type="date" formControlName="date" /></label
          ><label
            ><span>DEPARTMENT</span
            ><select formControlName="department">
              @for (d of departments; track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select></label
          ><label
            ><span>TYPE</span
            ><select formControlName="type">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select></label
          ><label
            ><span>CATEGORY</span
            ><select formControlName="category">
              @for (c of ['sales', 'ingredients', 'stock', 'overhead', 'other']; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select></label
          ><label
            ><span>DESCRIPTION</span><input formControlName="description" maxlength="160" /></label
          ><label
            ><span>AMOUNT · EGP</span
            ><input type="number" min="0.01" step="0.01" formControlName="amount"
          /></label>
        </div>
        <div class="actions">
          <button class="primary" type="submit">Save transaction</button>
          @if (editing()) {
            <button class="secondary" type="button" (click)="cancel()">Cancel edit</button>
          }
        </div>
      </form>
    </section>
    <p class="notice">
      Module fees are tracked separately. Payroll is calculated in Chef Payroll and deducted once in
      the operations overview.
    </p>`,
})
export class BudgetsPage {
  finance = inject(FinanceService);
  ui = inject(UiService);
  fb = inject(FormBuilder);
  departments = DEPARTMENTS;
  month = signal('2026-11');
  department = signal('All');
  search = signal('');
  page = signal(0);
  editing = signal('');
  deleteId = signal('');
  error = signal('');
  chartLabels = DEPARTMENTS.flatMap((d) => [d + ' income', d + ' expenses']);
  base = computed(() =>
    this.finance.db
      .data()
      .transactions.filter(
        (t) =>
          t.date.startsWith(this.month()) &&
          (this.department() === 'All' || t.department === this.department()),
      ),
  );
  income = computed(() =>
    this.base()
      .filter((t) => t.type === 'income')
      .reduce((n, t) => n + t.amount, 0),
  );
  expenses = computed(() =>
    this.base()
      .filter((t) => t.type === 'expense')
      .reduce((n, t) => n + t.amount, 0),
  );
  filtered = computed(() =>
    this.base()
      .filter((t) => t.description.toLowerCase().includes(this.search().toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date)),
  );
  pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 5)));
  paged = computed(() =>
    this.filtered().slice(
      Math.min(this.page(), this.pages() - 1) * 5,
      (Math.min(this.page(), this.pages() - 1) + 1) * 5,
    ),
  );
  chartValues = computed(() =>
    DEPARTMENTS.flatMap((d) =>
      ['income', 'expense'].map((type) =>
        this.base()
          .filter((t) => t.department === d && t.type === type)
          .reduce((n, t) => n + t.amount, 0),
      ),
    ),
  );
  form = this.fb.nonNullable.group({
    date: [today(), Validators.required],
    department: ['Kitchen' as Department, Validators.required],
    type: ['expense' as 'income' | 'expense', Validators.required],
    category: ['ingredients' as Transaction['category'], Validators.required],
    description: ['', [trimRequired, Validators.maxLength(160)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });
  edit(t: Transaction): void {
    this.editing.set(t.id);
    this.form.patchValue(t);
    this.error.set('');
    document.getElementById('transaction-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  cancel(): void {
    this.editing.set('');
    this.form.reset({
      date: today(),
      department: 'Kitchen',
      type: 'expense',
      category: 'ingredients',
      description: '',
      amount: 0,
    });
    this.error.set('');
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Complete all fields and enter a positive amount.');
      return;
    }
    try {
      const v = this.form.getRawValue();
      this.finance.saveTransaction({ ...v, id: this.editing() });
      this.month.set(v.date.slice(0, 7));
      this.cancel();
      this.ui.notify('Transaction saved. Charts and totals updated.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  remove(id: string): void {
    try {
      this.finance.removeTransaction(id);
      this.deleteId.set('');
      this.page.set(0);
      this.ui.notify('Transaction deleted.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
