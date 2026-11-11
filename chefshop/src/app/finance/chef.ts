import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FinanceService } from '../core/finance.service';
import { Heading } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chef',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, Heading],
  template: `<app-heading
      eyebrow="FROM THE PASS"
      title="YOUR KITCHEN, AT A GLANCE."
      [copy]="auth.user()!.name + ' · Teaching, catering and clear earnings.'"
    /><img
      class="photo"
      src="assets/catalog/chef.png"
      alt="Chef guiding students in a teaching kitchen"
      width="600"
      height="420"
    /><label class="month-filter"
      ><span>EARNINGS MONTH</span
      ><input type="month" [ngModel]="month()" (ngModelChange)="month.set($event)"
    /></label>
    @if (row(); as r) {
      <div class="stats">
        <div class="panel stat">
          <p class="eyebrow">BASE SALARY</p>
          <p class="value">{{ r.base | currency: 'EGP' : 'code' }}</p>
        </div>
        <div class="panel stat">
          <p class="eyebrow">APPROVED ALLOWANCES</p>
          <p class="value">{{ r.eventAllowance + r.manualAllowance | currency: 'EGP' : 'code' }}</p>
        </div>
        <div class="panel stat">
          <p class="eyebrow">NET EARNINGS</p>
          <p class="value">{{ r.net | currency: 'EGP' : 'code' }}</p>
          <p class="small muted">Deductions {{ r.deductions | currency: 'EGP' : 'code' }}</p>
        </div>
      </div>
      <h2>YOUR CATERING SCHEDULE</h2>
      @for (e of events(); track e.id) {
        <article class="panel">
          <h3>{{ e.name }}</h3>
          <p>{{ e.date | date }} · {{ e.guests }} guests</p>
          <p class="money">{{ myAllowance(e.id) | currency: 'EGP' : 'code' }}</p>
          <span class="badge" [class.pending]="!e.approved">{{
            e.approved ? 'Approved' : 'Pending approval'
          }}</span>
        </article>
      } @empty {
        <p class="muted">No assigned events this month.</p>
      }
      <h2>YOUR MANUAL ADJUSTMENTS</h2>
      @for (a of adjustments(); track a.id) {
        <div class="panel inline">
          <span>{{ a.reason }} · {{ a.type }}</span
          ><b>{{ a.amount | currency: 'EGP' : 'code' }}</b>
        </div>
      } @empty {
        <p class="muted">No manual adjustments this month.</p>
      }
    } @else {
      <div class="notice">
        Your account does not have a linked salary schedule yet. Ask Accounting to link your chef
        account.
      </div>
    }
    <a class="secondary" routerLink="/profile">Your profile →</a>`,
})
export class ChefPage {
  auth = inject(AuthService);
  finance = inject(FinanceService);
  month = signal('2026-11');
  row = computed(() => this.finance.payroll(this.month())[0]);
  events = computed(() =>
    this.finance.db
      .data()
      .events.filter(
        (e) =>
          e.date.startsWith(this.month()) &&
          e.allowances.some((a) => a.staffId === this.row()?.staffId),
      ),
  );
  adjustments = computed(() =>
    this.finance.db
      .data()
      .adjustments.filter((a) => a.month === this.month() && a.staffId === this.row()?.staffId),
  );
  myAllowance(id: string): number {
    return (
      this.finance.db
        .data()
        .events.find((e) => e.id === id)
        ?.allowances.find((a) => a.staffId === this.row()?.staffId)?.amount || 0
    );
  }
}
