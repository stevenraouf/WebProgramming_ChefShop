import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';
import {
  FINANCE_ROLES,
  Invoice,
  PayAdjustment,
  PayRow,
  ProductPerformance,
  Staff,
  Transaction,
  newId,
  today,
  roundMoney,
} from './models';
@Injectable({ providedIn: 'root' })
export class FinanceService {
  readonly db = inject(DatabaseService);
  private auth = inject(AuthService);
  payroll(month: string): PayRow[] {
    const u = this.auth.require(['admin', 'accounting', 'chef']),
      d = this.db.data();
    return d.staff
      .filter((s) => u.role !== 'chef' || s.userId === u.id)
      .map((s) => {
        const eventAllowance = d.events
            .filter((e) => e.approved && e.date.startsWith(month))
            .reduce((n, e) => n + (e.allowances.find((a) => a.staffId === s.id)?.amount || 0), 0),
          adjust = d.adjustments.filter((a) => a.staffId === s.id && a.month === month),
          manualAllowance = adjust
            .filter((a) => a.type === 'allowance')
            .reduce((n, a) => n + a.amount, 0),
          deductions = adjust
            .filter((a) => a.type === 'deduction')
            .reduce((n, a) => n + a.amount, 0),
          gross = roundMoney(s.base + eventAllowance + manualAllowance);
        return {
          staffId: s.id,
          name: s.name,
          base: s.base,
          eventAllowance: roundMoney(eventAllowance),
          manualAllowance: roundMoney(manualAllowance),
          deductions: roundMoney(deductions),
          gross,
          net: roundMoney(gross - deductions),
        };
      });
  }
  saveStaff(staff: Staff): void {
    this.auth.require(FINANCE_ROLES);
    if (
      !staff.name.trim() ||
      !Number.isFinite(staff.base) ||
      staff.base < 0 ||
      staff.base > 1000000
    )
      throw Error('Enter a name and a valid base salary.');
    const deductions = this.db
      .data()
      .adjustments.filter((a) => a.staffId === staff.id && a.type === 'deduction');
    const largest = deductions.reduce(
      (map, a) => {
        map[a.month] = (map[a.month] || 0) + a.amount;
        return map;
      },
      {} as Record<string, number>,
    );
    if (Object.values(largest).some((n) => n > staff.base))
      throw Error('The base salary cannot fall below existing deductions.');
    this.db.update((db) => {
      const old = db.staff.find((s) => s.id === staff.id);
      if (old) Object.assign(old, staff);
      else db.staff.push({ ...staff, id: newId('STAFF') });
    });
  }
  adjustment(a: Omit<PayAdjustment, 'id'>): void {
    this.auth.require(FINANCE_ROLES);
    if (
      !a.reason.trim() ||
      !Number.isFinite(a.amount) ||
      a.amount <= 0 ||
      !/^\d{4}-\d{2}$/.test(a.month)
    )
      throw Error('Enter a reason, month and positive amount.');
    if (!this.db.data().staff.some((s) => s.id === a.staffId))
      throw Error('Select a staff member.');
    if (a.type === 'deduction') {
      const row = this.payroll(a.month).find((s) => s.staffId === a.staffId);
      if (!row || a.amount > row.net) throw Error('Deductions cannot exceed the remaining salary.');
    }
    this.db.update((db) =>
      db.adjustments.push({ ...a, id: newId('ADJ'), amount: roundMoney(a.amount) }),
    );
  }
  removeAdjustment(id: string): void {
    this.auth.require(FINANCE_ROLES);
    const a = this.db.data().adjustments.find((a) => a.id === id);
    if (a?.type === 'allowance') {
      const r = this.payroll(a.month).find((r) => r.staffId === a.staffId);
      if (r && r.net < a.amount)
        throw Error('Remove or reduce the related deductions before removing this allowance.');
    }
    this.db.update((db) => (db.adjustments = db.adjustments.filter((a) => a.id !== id)));
  }
  approveEvent(id: string): void {
    this.auth.require(FINANCE_ROLES);
    this.db.update((db) => {
      const e = db.events.find((e) => e.id === id);
      if (!e) throw Error('Event not found.');
      e.approved = true;
    });
  }
  saveTransaction(t: Transaction): void {
    this.auth.require(FINANCE_ROLES);
    if (
      !t.description.trim() ||
      !Number.isFinite(t.amount) ||
      t.amount <= 0 ||
      !t.date ||
      !['Kitchen', 'Catering', 'Store'].includes(t.department) ||
      !['income', 'expense'].includes(t.type)
    )
      throw Error('Complete the transaction and enter a positive amount.');
    this.db.update((db) => {
      const old = db.transactions.find((x) => x.id === t.id);
      if (old) Object.assign(old, t, { amount: roundMoney(t.amount) });
      else db.transactions.push({ ...t, id: newId('TX'), amount: roundMoney(t.amount) });
    });
  }
  removeTransaction(id: string): void {
    this.auth.require(FINANCE_ROLES);
    this.db.update((db) => (db.transactions = db.transactions.filter((t) => t.id !== id)));
  }
  savePerformance(p: ProductPerformance): void {
    this.auth.require(FINANCE_ROLES);
    if (
      !p.productKey ||
      !Number.isInteger(p.units) ||
      p.units < 0 ||
      !Number.isFinite(p.unitCost) ||
      p.unitCost < 0 ||
      !/^\d{4}-\d{2}$/.test(p.month)
    )
      throw Error('Choose a product, month, non-negative whole units and unit cost.');
    if (
      this.db
        .data()
        .productPerformance.some(
          (x) => x.id !== p.id && x.month === p.month && x.productKey === p.productKey,
        )
    )
      throw Error('This product already has a record for that month. Edit the existing record.');
    this.db.update((db) => {
      const old = db.productPerformance.find((x) => x.id === p.id);
      if (old) Object.assign(old, p);
      else db.productPerformance.push({ ...p, id: newId('PERF') });
    });
  }
  invoices(): Invoice[] {
    const u = this.auth.require(['admin', 'accounting', 'student']);
    return this.db.data().invoices.filter((i) => u.role !== 'student' || i.studentId === u.id);
  }
  balance(i: Invoice): number {
    return roundMoney(i.amount - i.payments.reduce((n, p) => n + p.amount, 0));
  }
  status(i: Invoice): string {
    return this.balance(i) === 0
      ? 'Paid'
      : i.payments.length
        ? 'Part paid'
        : i.due < today()
          ? 'Overdue'
          : 'Unpaid';
  }
  createInvoice(data: Omit<Invoice, 'id' | 'payments' | 'created'>): void {
    this.auth.require(FINANCE_ROLES);
    if (
      !this.db.data().users.some((u) => u.id === data.studentId && u.role === 'student') ||
      !data.module.trim() ||
      !Number.isFinite(data.amount) ||
      data.amount <= 0 ||
      !data.due
    )
      throw Error('Choose a student, module, positive fee and due date.');
    this.db.update((db) =>
      db.invoices.push({
        ...data,
        id: newId('INV'),
        amount: roundMoney(data.amount),
        created: today(),
        payments: [],
      }),
    );
  }
  payInvoice(id: string, amount: number, method: string): string {
    const u = this.auth.require(['admin', 'accounting', 'student']),
      i = this.invoices().find((i) => i.id === id);
    if (!i) throw Error('You cannot access this invoice.');
    if (!Number.isFinite(amount) || amount <= 0 || amount > this.balance(i))
      throw Error('Payment must be greater than zero and no more than the outstanding balance.');
    if (u.role === 'student' && method !== 'Demo card •••• 4242')
      throw Error('Use the demo card for student payments.');
    const receiptId = newId('MF');
    this.db.update((db) =>
      db.invoices
        .find((x) => x.id === id)!
        .payments.push({
          id: newId('PAY'),
          date: today(),
          amount: roundMoney(amount),
          method,
          receiptId,
        }),
    );
    return receiptId;
  }
  report(month: string): unknown {
    this.auth.require(FINANCE_ROLES);
    const rows = this.payroll(month),
      total = roundMoney(rows.reduce((n, r) => n + r.net, 0)),
      report = {
        id: newId('PAYROLL'),
        month,
        created: new Date().toISOString(),
        currency: 'EGP',
        scope: 'Frontend demo; no bank transfer',
        total,
        rows,
      };
    this.db.update((db) => db.reports.push(report));
    return report;
  }
}
