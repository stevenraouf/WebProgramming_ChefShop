import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../core/finance.service';
import { UiService } from '../core/ui.service';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-events',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, Heading, ErrorMessage],
  template: `<p><a class="secondary" routerLink="/operations">← Operations overview</a></p>
    <app-heading
      eyebrow="BRING PEOPLE TOGETHER"
      title="GOOD GATHERINGS. CLEAR COSTS."
      copy="Review catering-event costs and approve allowances for payroll."
    /><label class="month-filter"
      ><span>EVENT MONTH</span
      ><input type="month" [ngModel]="month()" (ngModelChange)="month.set($event)" /></label
    ><app-error [message]="error()" />
    <div class="grid event-grid">
      @for (e of events(); track e.id) {
        <article class="panel">
          <h2>{{ e.name }}</h2>
          <p class="muted">{{ e.date | date }} · {{ e.guests }} guests</p>
          <div class="summary">
            <span>Sales</span><b>{{ e.sales | currency: 'EGP' : 'code' }}</b>
          </div>
          <div class="summary">
            <span>Ingredients</span><b>{{ e.cost | currency: 'EGP' : 'code' }}</b>
          </div>
          <div class="summary">
            <span>Chef allowances</span><b>{{ allowance(e.id) | currency: 'EGP' : 'code' }}</b>
          </div>
          <div class="summary">
            <span>After-event contribution</span
            ><b>{{ e.sales - e.cost - allowance(e.id) | currency: 'EGP' : 'code' }}</b>
          </div>
          <details class="section">
            <summary>Allowance breakdown</summary>
            @for (a of e.allowances; track a.staffId) {
              <div class="summary">
                <span>{{ staffName(a.staffId) }}</span
                ><b>{{ a.amount | currency: 'EGP' : 'code' }}</b>
              </div>
            }
          </details>
          <p>
            <span class="badge" [class.pending]="!e.approved">{{
              e.approved ? 'Approved · Included in payroll' : 'Pending approval'
            }}</span>
          </p>
          @if (!e.approved) {
            <button class="primary full" (click)="approve(e.id)">
              Approve {{ allowance(e.id) | currency: 'EGP' : 'code' }} allowances
            </button>
          }
          <a class="secondary full" routerLink="/payroll">View payroll →</a>
        </article>
      } @empty {
        <p>No events in this month.</p>
      }
    </div>
    <p class="notice">
      Approval adds the event allowance once to the selected month's payroll. Contribution includes
      the planned event allowance whether pending or approved.
    </p>`,
})
export class EventsPage {
  finance = inject(FinanceService);
  ui = inject(UiService);
  month = signal('2026-11');
  error = signal('');
  events = computed(() =>
    this.finance.db.data().events.filter((e) => e.date.startsWith(this.month())),
  );
  allowance(id: string): number {
    return (
      this.finance.db
        .data()
        .events.find((e) => e.id === id)
        ?.allowances.reduce((n, a) => n + a.amount, 0) || 0
    );
  }
  staffName(id: string): string {
    return this.finance.db.data().staff.find((s) => s.id === id)?.name || id;
  }
  approve(id: string): void {
    try {
      this.finance.approveEvent(id);
      this.ui.notify('Event allowances approved. Payroll and chef earnings updated.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
