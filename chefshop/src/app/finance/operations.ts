import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../core/finance.service';
import { CatalogService } from '../core/catalog.service';
import { DEPARTMENTS, ProductPerformance } from '../core/models';
import { UiService } from '../core/ui.service';
import { Heading, ChartView, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-operations',
  imports: [CurrencyPipe, FormsModule, RouterLink, Heading, ChartView],
  template: `<app-heading
      eyebrow="THE BIG PICTURE"
      title="A HEALTHIER BUSINESS."
      copy="Kitchen, Catering and Store—one clear view of sales and costs."
    /><label class="month-filter"
      ><span>REPORTING MONTH</span
      ><input type="month" [ngModel]="month()" (ngModelChange)="month.set($event)"
    /></label>
    <div class="stats">
      <div class="panel stat">
        <p class="eyebrow">SALES</p>
        <p class="value">{{ sales() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">DIRECT COSTS</p>
        <p class="value">{{ direct() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">NET AFTER OPERATING COSTS</p>
        <p class="value">{{ net() | currency: 'EGP' : 'code' }}</p>
        <p class="small muted">After payroll and other expenses</p>
      </div>
    </div>
    <div class="panel">
      <app-chart title="Sales by department" [labels]="departments" [values]="departmentSales()" />
    </div>
    <div class="role-grid">
      @for (link of links; track link.path) {
        <section class="panel">
          <h3>{{ link.name }}</h3>
          <p class="muted">{{ link.copy }}</p>
          <a class="secondary" [routerLink]="link.path">View report →</a>
        </section>
      }
    </div>
    <p class="notice">
      Gross contribution is sales less ingredients and stock costs. Payroll includes approved
      allowances and deductions. Module tuition is tracked separately in Student Fees. These are
      editable demonstration records.
    </p>`,
})
export class OperationsPage {
  finance = inject(FinanceService);
  month = signal('2026-11');
  departments = DEPARTMENTS;
  tx = computed(() =>
    this.finance.db.data().transactions.filter((t) => t.date.startsWith(this.month())),
  );
  sales = computed(() =>
    this.tx()
      .filter((t) => t.type === 'income')
      .reduce((n, t) => n + t.amount, 0),
  );
  direct = computed(() =>
    this.tx()
      .filter((t) => t.type === 'expense' && ['ingredients', 'stock'].includes(t.category))
      .reduce((n, t) => n + t.amount, 0),
  );
  expenses = computed(() =>
    this.tx()
      .filter((t) => t.type === 'expense')
      .reduce((n, t) => n + t.amount, 0),
  );
  pay = computed(() => this.finance.payroll(this.month()).reduce((n, p) => n + p.net, 0));
  net = computed(() => this.sales() - this.expenses() - this.pay());
  departmentSales = computed(() =>
    this.departments.map((d) =>
      this.tx()
        .filter((t) => t.department === d && t.type === 'income')
        .reduce((n, t) => n + t.amount, 0),
    ),
  );
  links = [
    {
      path: '/budgets',
      name: 'DEPARTMENT BUDGETS',
      copy: 'Manage income, ingredient costs and expenses.',
    },
    {
      path: '/events',
      name: 'CATERING EVENTS',
      copy: 'Review event costs and approve chef allowances.',
    },
    {
      path: '/profitability',
      name: 'PRODUCT PROFITABILITY',
      copy: 'Find your best gross profit contributors.',
    },
    {
      path: '/payroll',
      name: 'CHEF PAYROLL',
      copy: 'Manage salary, allowances, deductions and JSON reports.',
    },
    {
      path: '/fees',
      name: 'STUDENT FEES',
      copy: 'Create invoices, record payments and view history.',
    },
  ];
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profitability',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    Heading,
    ChartView,
    ErrorMessage,
  ],
  template: `<p><a class="secondary" routerLink="/operations">← Operations overview</a></p>
    <app-heading
      eyebrow="WHAT EARNS ITS PLACE?"
      title="FIND YOUR BEST PERFORMERS."
      copy="Selected product records. Gross profit is sales less direct cost, before payroll and overhead."
    /><label class="month-filter"
      ><span>REPORTING MONTH</span
      ><input type="month" [ngModel]="month()" (ngModelChange)="month.set($event)"
    /></label>
    <div class="panel">
      <app-chart title="Gross profit by product" [labels]="labels()" [values]="profits()" />
    </div>
    <div class="table-wrap">
      <table class="responsive-table">
        <caption>
          Product performance ·
          {{
            month()
          }}
        </caption>
        <thead>
          <tr>
            <th>Product</th>
            <th>Units</th>
            <th>Sales</th>
            <th>Direct cost</th>
            <th>Gross profit</th>
            <th>Margin</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.id) {
            <tr>
              <th scope="row" data-label="Product">{{ r.name }}</th>
              <td data-label="Units">{{ r.units }}</td>
              <td data-label="Sales">{{ r.sales | currency: 'EGP' : 'code' }}</td>
              <td data-label="Cost">{{ r.cost | currency: 'EGP' : 'code' }}</td>
              <td data-label="Gross">{{ r.gross | currency: 'EGP' : 'code' }}</td>
              <td data-label="Margin">{{ r.margin | number: '1.1-1' }}%</td>
              <td data-label="Action"><button class="secondary" (click)="edit(r)">Edit</button></td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7">No product records for this month. Add a record below.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <section class="panel section" id="performance-form">
      <h2>{{ editing() ? 'EDIT PRODUCT PERFORMANCE' : 'ADD PRODUCT PERFORMANCE' }}</h2>
      <app-error [message]="error()" />
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-two">
          <label
            ><span>PRODUCT</span
            ><select formControlName="productKey">
              <option value="">Choose product</option>
              @for (p of catalog.products; track p.key) {
                <option [value]="p.key">{{ p.name }}</option>
              }
            </select></label
          ><label><span>MONTH</span><input type="month" formControlName="month" /></label
          ><label
            ><span>UNITS SOLD</span
            ><input type="number" min="0" step="1" formControlName="units" /></label
          ><label
            ><span>DIRECT COST PER UNIT · EGP</span
            ><input type="number" min="0" step="0.01" formControlName="unitCost"
          /></label>
        </div>
        <p class="small muted">
          Sales use the catalog's standard unit price. Cost means ingredients for meals and purchase
          cost for tools, spices and uniforms. These selected records are separate from the
          department ledger.
        </p>
        <div class="actions">
          <button class="primary" type="submit">Save performance record</button>
          @if (editing()) {
            <button class="secondary" type="button" (click)="cancel()">Cancel edit</button>
          }
        </div>
      </form>
    </section>`,
})
export class ProfitabilityPage {
  finance = inject(FinanceService);
  catalog = inject(CatalogService);
  ui = inject(UiService);
  fb = inject(FormBuilder);
  month = signal('2026-11');
  editing = signal('');
  error = signal('');
  form = this.fb.nonNullable.group({
    productKey: ['', Validators.required],
    month: ['2026-11', Validators.required],
    units: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
  });
  rows = computed(() =>
    this.finance.db
      .data()
      .productPerformance.filter((p) => p.month === this.month())
      .map((p) => {
        const product = this.catalog.get(p.productKey)!,
          sales = product.price * p.units,
          cost = p.unitCost * p.units;
        return {
          ...p,
          name: product.name,
          sales,
          cost,
          gross: sales - cost,
          margin: sales ? ((sales - cost) / sales) * 100 : 0,
        };
      })
      .sort((a, b) => b.gross - a.gross),
  );
  labels = computed(() => this.rows().map((r) => r.name));
  profits = computed(() => this.rows().map((r) => r.gross));
  edit(p: ProductPerformance): void {
    this.editing.set(p.id);
    this.form.patchValue(p);
    document.getElementById('performance-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  cancel(): void {
    this.editing.set('');
    this.form.reset({ productKey: '', month: this.month(), units: 0, unitCost: 0 });
    this.error.set('');
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Choose a product and month, whole units, and a non-negative cost.');
      return;
    }
    try {
      const v = this.form.getRawValue();
      this.finance.savePerformance({ ...v, id: this.editing() });
      this.month.set(v.month);
      this.cancel();
      this.ui.notify('Product performance saved.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
