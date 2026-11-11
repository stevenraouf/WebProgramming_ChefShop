import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../core/finance.service';
import { UiService } from '../core/ui.service';
import { Staff } from '../core/models';
import { trimRequired } from '../core/validators';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-payroll',
  imports: [CurrencyPipe, FormsModule, ReactiveFormsModule, RouterLink, Heading, ErrorMessage],
  template: `<p><a class="secondary" routerLink="/operations">← Operations overview</a></p>
    <app-heading
      eyebrow="TAKE CARE OF YOUR PEOPLE"
      title="FAIR PAY. EVERY EVENT INCLUDED."
      copy="Manage salary, approved allowances and deductions. Export a monthly JSON report."
    /><label class="month-filter"
      ><span>PAYROLL MONTH</span
      ><input
        type="month"
        [ngModel]="month()"
        (ngModelChange)="month.set($event); adjustForm.controls.month.setValue($event)"
    /></label>
    <div class="stats">
      <div class="panel stat">
        <p class="eyebrow">BASE SALARIES</p>
        <p class="value">{{ base() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">ALLOWANCES</p>
        <p class="value">{{ allowances() | currency: 'EGP' : 'code' }}</p>
      </div>
      <div class="panel stat">
        <p class="eyebrow">NET PAYROLL</p>
        <p class="value">{{ total() | currency: 'EGP' : 'code' }}</p>
      </div>
    </div>
    <div class="actions">
      <button class="primary" (click)="exportReport()">
        Download {{ month() }} salary report · JSON</button
      ><a class="secondary" routerLink="/events">Review catering allowances</a>
    </div>
    <app-error [message]="error()" />
    <div class="table-wrap">
      <table class="responsive-table">
        <caption>
          Monthly salary report ·
          {{
            month()
          }}
        </caption>
        <thead>
          <tr>
            <th>Chef</th>
            <th>Base</th>
            <th>Event allowance</th>
            <th>Other allowance</th>
            <th>Deductions</th>
            <th>Net</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.staffId) {
            <tr>
              <th scope="row" data-label="Chef">{{ r.name }}</th>
              <td data-label="Base">{{ r.base | currency: 'EGP' : 'code' }}</td>
              <td data-label="Events">{{ r.eventAllowance | currency: 'EGP' : 'code' }}</td>
              <td data-label="Allowances">{{ r.manualAllowance | currency: 'EGP' : 'code' }}</td>
              <td data-label="Deductions">{{ r.deductions | currency: 'EGP' : 'code' }}</td>
              <td data-label="Net">
                <strong>{{ r.net | currency: 'EGP' : 'code' }}</strong>
              </td>
              <td data-label="Action">
                <button class="secondary" (click)="editStaff(r.staffId)">Edit salary</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="form-layout section">
      <section class="panel" id="salary-form">
        <h2>{{ editing() ? 'EDIT BASE SALARY' : 'ADD STAFF SALARY' }}</h2>
        <form [formGroup]="staffForm" (ngSubmit)="saveStaff()">
          <label><span>NAME</span><input formControlName="name" /></label
          ><label
            ><span>LINKED CHEF ACCOUNT</span
            ><select formControlName="userId">
              <option value="">No linked account</option>
              @for (u of chefs(); track u.id) {
                <option [value]="u.id">{{ u.name }} · {{ u.username }}</option>
              }
            </select></label
          ><label
            ><span>MONTHLY BASE SALARY · EGP</span
            ><input type="number" min="0" max="1000000" step="0.01" formControlName="base"
          /></label>
          <p class="small muted">
            Base salary applies to the staff salary schedule. Generated reports retain the values
            from the time they were exported.
          </p>
          <div class="actions">
            <button class="primary" type="submit">Save salary</button>
            @if (editing()) {
              <button class="secondary" type="button" (click)="cancelStaff()">Cancel edit</button>
            }
          </div>
        </form>
      </section>
      <section class="panel">
        <h2>ALLOWANCE OR DEDUCTION</h2>
        <form [formGroup]="adjustForm" (ngSubmit)="saveAdjustment()">
          <label
            ><span>STAFF MEMBER</span
            ><select formControlName="staffId">
              <option value="">Choose chef</option>
              @for (s of finance.db.data().staff; track s.id) {
                <option [value]="s.id">{{ s.name }}</option>
              }
            </select></label
          >
          <div class="form-two">
            <label><span>MONTH</span><input type="month" formControlName="month" /></label
            ><label
              ><span>TYPE</span
              ><select formControlName="type">
                <option value="allowance">Allowance</option>
                <option value="deduction">Deduction</option>
              </select></label
            >
          </div>
          <label><span>REASON</span><input formControlName="reason" maxlength="140" /></label
          ><label
            ><span>AMOUNT · EGP</span
            ><input type="number" min="0.01" step="0.01" formControlName="amount" /></label
          ><button class="primary full" type="submit">Add adjustment</button>
        </form>
      </section>
    </div>
    <section class="section">
      <h2>ADJUSTMENT HISTORY</h2>
      <div class="table-wrap">
        <table class="responsive-table">
          <caption>
            Manual adjustments ·
            {{
              month()
            }}
          </caption>
          <thead>
            <tr>
              <th>Chef</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (a of adjustments(); track a.id) {
              <tr>
                <td data-label="Chef">{{ staffName(a.staffId) }}</td>
                <td data-label="Type">{{ a.type }}</td>
                <td data-label="Reason">{{ a.reason }}</td>
                <td data-label="Amount">{{ a.amount | currency: 'EGP' : 'code' }}</td>
                <td data-label="Action">
                  <button class="text-button" (click)="removeAdjustment(a.id)">
                    Remove adjustment
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">No manual adjustments for this month.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <section class="section">
      <h2>GENERATED REPORT HISTORY</h2>
      @for (r of finance.db.data().reports; track r.id) {
        <div class="panel inline">
          <div>
            <strong>{{ r.month }}</strong
            ><br /><small class="muted"
              >{{ r.created }} · {{ r.total | currency: 'EGP' : 'code' }}</small
            >
          </div>
          <button
            class="secondary"
            (click)="ui.download('chefshop-payroll-' + r.month + '.json', r)"
          >
            Download JSON
          </button>
        </div>
      } @empty {
        <p class="muted">Export a salary report to save its snapshot here.</p>
      }
    </section>
    <p class="notice">
      This is a frontend payroll demonstration. Saving or exporting a report never transfers money.
    </p>`,
})
export class PayrollPage {
  finance = inject(FinanceService);
  ui = inject(UiService);
  fb = inject(FormBuilder);
  month = signal('2026-11');
  error = signal('');
  editing = signal('');
  rows = computed(() => this.finance.payroll(this.month()));
  base = computed(() => this.rows().reduce((n, r) => n + r.base, 0));
  allowances = computed(() =>
    this.rows().reduce((n, r) => n + r.eventAllowance + r.manualAllowance, 0),
  );
  total = computed(() => this.rows().reduce((n, r) => n + r.net, 0));
  adjustments = computed(() =>
    this.finance.db.data().adjustments.filter((a) => a.month === this.month()),
  );
  chefs = computed(() => this.finance.db.data().users.filter((u) => u.role === 'chef' && u.active));
  staffForm = this.fb.nonNullable.group({
    name: ['', [trimRequired, Validators.maxLength(80)]],
    userId: [''],
    base: [14400, [Validators.required, Validators.min(0), Validators.max(1000000)]],
  });
  adjustForm = this.fb.nonNullable.group({
    staffId: ['', Validators.required],
    month: ['2026-11', Validators.required],
    type: ['allowance' as 'allowance' | 'deduction', Validators.required],
    reason: ['', [trimRequired, Validators.maxLength(140)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });
  staffName(id: string): string {
    return this.finance.db.data().staff.find((s) => s.id === id)?.name || id;
  }
  editStaff(id: string): void {
    const s = this.finance.db.data().staff.find((s) => s.id === id)!;
    this.editing.set(id);
    this.staffForm.patchValue(s);
    this.error.set('');
    document.getElementById('salary-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  cancelStaff(): void {
    this.editing.set('');
    this.staffForm.reset({ name: '', userId: '', base: 14400 });
  }
  saveStaff(): void {
    this.staffForm.markAllAsTouched();
    if (this.staffForm.invalid) {
      this.error.set('Enter a staff name and valid base salary.');
      return;
    }
    try {
      this.finance.saveStaff({ ...this.staffForm.getRawValue(), id: this.editing() });
      this.cancelStaff();
      this.error.set('');
      this.ui.notify('Salary schedule updated.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  saveAdjustment(): void {
    this.adjustForm.markAllAsTouched();
    if (this.adjustForm.invalid) {
      this.error.set('Choose a chef, month, reason and a positive adjustment amount.');
      return;
    }
    try {
      this.finance.adjustment(this.adjustForm.getRawValue());
      this.month.set(this.adjustForm.controls.month.value);
      this.adjustForm.patchValue({ reason: '', amount: 0 });
      this.error.set('');
      this.ui.notify('Payroll adjustment saved.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  removeAdjustment(id: string): void {
    try {
      this.finance.removeAdjustment(id);
      this.ui.notify('Adjustment removed.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  exportReport(): void {
    try {
      this.ui.download(
        'chefshop-payroll-' + this.month() + '.json',
        this.finance.report(this.month()),
      );
      this.ui.notify('Monthly salary report generated.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
