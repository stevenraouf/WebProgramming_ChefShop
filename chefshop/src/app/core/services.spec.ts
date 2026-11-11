import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { MemoryStorage } from './test-storage';
import { CatalogService } from './catalog.service';
import { CartService } from './cart.service';
import { FinanceService } from './finance.service';
import { OrderService } from './order.service';
import { roleGuard, safeReturnUrl } from './guards';
import { demoCard, expiry, passwordMatch } from './validators';
import { PayRow } from './models';
const setup = () =>
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: StorageService, useClass: MemoryStorage }],
  });
describe('Authentication and authorization', () => {
  let auth: AuthService;
  beforeEach(() => {
    setup();
    auth = TestBed.inject(AuthService);
  });
  it('verifies the demo password and creates a tab-scoped session', async () => {
    await auth.login('alex', 'ChefShop@2026');
    expect(auth.user()?.role).toBe('student');
    expect(TestBed.inject(StorageService).read('session', null, true)).toBeTruthy();
  });
  it('rejects an incorrect password without a session', async () => {
    await expectAsync(auth.login('admin', 'wrong-password')).toBeRejectedWithError();
    expect(auth.user()).toBeNull();
  });
  it('clears the session on logout', async () => {
    await auth.login('alex', 'ChefShop@2026');
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(TestBed.inject(StorageService).read('session', null, true)).toBeNull();
  });
  it('creates student accounts with masked cards and salted hashes', async () => {
    await auth.signup({
      username: 'newstudent',
      name: 'Test Student',
      email: 'test@example.com',
      password: 'CoursePass1',
      picture: 'assets/figma/imgFrame.svg',
      cardNumber: '4242424242424242',
      expiry: '12/28',
      cuisine: 'Italy',
      vegetarian: true,
      newsletter: false,
    });
    const u = auth.user()!;
    expect(u.role).toBe('student');
    expect(u.card?.last4).toBe('4242');
    expect(JSON.stringify(u)).not.toContain('4242424242424242');
    expect(u.passwordHash).not.toBe('CoursePass1');
    expect(u.salt).toBeTruthy();
  });
  it('rejects duplicate usernames', async () => {
    await expectAsync(
      auth.signup({
        username: 'alex',
        name: 'Another Alex',
        email: 'other@example.com',
        password: 'CoursePass1',
        picture: '',
        cardNumber: '4242424242424242',
        expiry: '12/28',
        cuisine: 'All',
        vegetarian: false,
        newsletter: false,
      }),
    ).toBeRejectedWithError('That username is already taken.');
  });
  it('prevents accounting from changing roles', async () => {
    await auth.login('accounts', 'ChefShop@2026');
    expect(() => auth.updateAccess('student-1', 'admin', true)).toThrowError();
  });
  it('allows an admin to disable another account', async () => {
    await auth.login('admin', 'ChefShop@2026');
    auth.updateAccess('student-2', 'student', false);
    expect(
      TestBed.inject(DatabaseService)
        .data()
        .users.find((u) => u.id === 'student-2')?.active,
    ).toBeFalse();
  });
  it('redirects guests to login and students away from financial routes', async () => {
    const router = TestBed.inject(Router),
      route = { data: { roles: ['admin', 'accounting'] } } as unknown as ActivatedRouteSnapshot,
      state = { url: '/payroll' } as RouterStateSnapshot;
    const guest = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(router.serializeUrl(guest as UrlTree)).toContain('/login');
    await auth.login('alex', 'ChefShop@2026');
    const denied = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(router.serializeUrl(denied as UrlTree)).toBe('/forbidden');
  });
  it('rejects external return URLs', () => {
    expect(safeReturnUrl('//evil.example')).toBeNull();
    expect(safeReturnUrl('https://evil.example')).toBeNull();
    expect(safeReturnUrl('/profile')).toBe('/profile');
  });
});
describe('Cart calculations', () => {
  let cart: CartService, catalog: CatalogService;
  beforeEach(() => {
    setup();
    cart = TestBed.inject(CartService);
    catalog = TestBed.inject(CatalogService);
  });
  it('keeps different portion options separate', () => {
    const p = catalog.get('alfredo')!,
      opts = catalog.options(p);
    cart.add(p, opts[0].label, 2);
    cart.add(p, opts[1].label, 1);
    expect(cart.lines().length).toBe(2);
    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBe(520);
  });
  it('updates totals and removes a line when its quantity reaches zero', () => {
    const p = catalog.get('pepper')!;
    cart.add(p, catalog.options(p)[0].label, 2);
    const id = cart.lines()[0].id;
    cart.change(id, -1);
    expect(cart.subtotal()).toBe(40);
    cart.change(id, -1);
    expect(cart.count()).toBe(0);
  });
  it('rejects unavailable options and quantity overflow', () => {
    const p = catalog.get('alfredo')!,
      option = catalog.options(p)[0].label;
    expect(() => cart.add(p, 'Invented option', 1)).toThrowError();
    cart.add(p, option, 10);
    expect(() => cart.add(p, option, 1)).toThrowError();
  });
  it('persists only normalized catalog prices when restoring a bag', () => {
    const storage = TestBed.inject(StorageService),
      p = catalog.get('alfredo')!;
    storage.write('cart', [
      { id: 'fake', productKey: 'alfredo', option: catalog.options(p)[0].label, price: 1, qty: 2 },
    ]);
    const restored = TestBed.runInInjectionContext(() => new CartService());
    expect(restored.subtotal()).toBe(320);
  });
});
describe('Institute finance rules', () => {
  let auth: AuthService, finance: FinanceService;
  beforeEach(async () => {
    setup();
    auth = TestBed.inject(AuthService);
    finance = TestBed.inject(FinanceService);
    await auth.login('accounts', 'ChefShop@2026');
  });
  it('reconciles approved event allowances to monthly payroll', () => {
    expect(finance.payroll('2026-11').reduce((n, r) => n + r.net, 0)).toBe(46400);
    finance.approveEvent('event-winter');
    expect(finance.payroll('2026-11').reduce((n, r) => n + r.net, 0)).toBe(48000);
    expect(finance.payroll('2026-11')[0].net).toBe(17000);
    finance.approveEvent('event-winter');
    expect(finance.payroll('2026-11')[0].net).toBe(17000);
  });
  it('applies deductions and rejects a negative net salary', () => {
    finance.adjustment({
      staffId: 'chef-nadia',
      month: '2026-11',
      type: 'deduction',
      reason: 'Demo adjustment',
      amount: 500,
    });
    expect(finance.payroll('2026-11')[0].net).toBe(15500);
    expect(() =>
      finance.adjustment({
        staffId: 'chef-nadia',
        month: '2026-11',
        type: 'deduction',
        reason: 'Too much',
        amount: 20000,
      }),
    ).toThrowError();
  });
  it('generates an immutable monthly report snapshot', () => {
    const report = finance.report('2026-11') as { month: string; total: number; rows: PayRow[] };
    expect(report.total).toBe(46400);
    expect(report.month).toBe('2026-11');
    finance.approveEvent('event-winter');
    expect(report.total).toBe(46400);
    expect(finance.db.data().reports[0].total).toBe(46400);
  });
  it('supports partial invoice payments and prevents overpayment', () => {
    const id = 'INV-2026-001',
      receipt = finance.payInvoice(id, 1000, 'Campus cash · Demo');
    expect(receipt.startsWith('MF-')).toBeTrue();
    const i = finance.invoices().find((i) => i.id === id)!;
    expect(finance.balance(i)).toBe(1400);
    expect(finance.status(i)).toBe('Part paid');
    expect(() => finance.payInvoice(id, 1401, 'Campus cash · Demo')).toThrowError();
    finance.payInvoice(id, 1400, 'Campus cash · Demo');
    expect(finance.status(finance.invoices().find((i) => i.id === id)!)).toBe('Paid');
  });
  it('creates invoices for students and rejects invalid amounts', () => {
    finance.createInvoice({
      studentId: 'student-2',
      module: 'New module',
      amount: 1200,
      due: '2026-12-01',
    });
    expect(finance.invoices().length).toBe(4);
    expect(() =>
      finance.createInvoice({
        studentId: 'student-2',
        module: 'Bad invoice',
        amount: -1,
        due: '2026-12-01',
      }),
    ).toThrowError();
  });
  it('enforces student ownership and blocks financial mutations', async () => {
    auth.logout();
    await auth.login('alex', 'ChefShop@2026');
    expect(finance.invoices().every((i) => i.studentId === 'student-1')).toBeTrue();
    expect(() => finance.payInvoice('INV-2026-003', 100, 'Demo card •••• 4242')).toThrowError();
    expect(() => finance.approveEvent('event-winter')).toThrowError();
    expect(() => finance.report('2026-11')).toThrowError();
  });
  it('restricts chef salary views to the signed-in chef', async () => {
    auth.logout();
    await auth.login('nadia', 'ChefShop@2026');
    expect(finance.payroll('2026-11').length).toBe(1);
    expect(finance.payroll('2026-11')[0].name).toBe('Nadia Hassan');
  });
  it('adds, edits and deletes a department transaction', () => {
    finance.saveTransaction({
      id: '',
      date: '2026-11-09',
      department: 'Kitchen',
      type: 'expense',
      category: 'ingredients',
      description: 'Fresh basil',
      amount: 45,
    });
    const added = finance.db.data().transactions.at(-1)!;
    finance.saveTransaction({ ...added, amount: 55 });
    expect(finance.db.data().transactions.at(-1)!.amount).toBe(55);
    finance.removeTransaction(added.id);
    expect(finance.db.data().transactions.some((t) => t.id === added.id)).toBeFalse();
  });
});
describe('Checkout and order privacy', () => {
  beforeEach(() => setup());
  it('calculates delivery totals and empties the bag after a successful order', () => {
    const cart = TestBed.inject(CartService),
      catalog = TestBed.inject(CatalogService),
      orders = TestBed.inject(OrderService),
      p = catalog.get('alfredo')!;
    cart.add(p, catalog.options(p)[0].label, 1);
    const order = orders.place({
      contact: {
        name: 'Alex Morgan',
        email: 'alex@example.com',
        phone: '01000000000',
        address: '12 Olive Street',
      },
      fulfillment: 'delivery',
      slot: 'Today · 14:00–16:00',
      payment: 'Cash on delivery',
    });
    expect(order.total).toBe(190);
    expect(order.fee).toBe(30);
    expect(cart.count()).toBe(0);
    expect(orders.get(order.id)?.id).toBe(order.id);
    expect(TestBed.inject(DatabaseService).data().orders.length).toBe(0);
  });
  it('does not produce a confirmation order from an empty bag', () => {
    expect(() =>
      TestBed.inject(OrderService).place({
        contact: { name: 'Alex', email: 'a@example.com', phone: '01000000000', address: '' },
        fulfillment: 'pickup',
        slot: 'Today',
        payment: 'Cash',
      }),
    ).toThrowError('Your bag is empty.');
  });
});
describe('Form validators', () => {
  it('accepts only the demo card', () => {
    expect(demoCard(new FormControl('4242 4242 4242 4242'))).toBeNull();
    expect(demoCard(new FormControl('1234'))).toBeTruthy();
  });
  it('rejects expired and malformed expiry dates', () => {
    expect(expiry(new FormControl('01/20'))).toBeTruthy();
    expect(expiry(new FormControl('13/28'))).toBeTruthy();
    expect(expiry(new FormControl('12/99'))).toBeNull();
  });
  it('requires matching signup passwords', () => {
    const group = new FormGroup({
      password: new FormControl('Apassword1'),
      confirm: new FormControl('different'),
    });
    expect(passwordMatch(group)).toEqual({ passwordMatch: true });
    group.controls.confirm.setValue('Apassword1');
    expect(passwordMatch(group)).toBeNull();
  });
});
