import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { StorageService } from './core/storage.service';
import { MemoryStorage } from './core/test-storage';
import { ShopPage } from './store/shop';
import { HomePage } from './store/home';
import { AuthService } from './core/auth.service';
import { BudgetsPage } from './finance/budgets';
describe('Application shell', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: StorageService, useClass: MemoryStorage }],
    }),
  );
  it('renders accessible navigation and the V6 identity', async () => {
    const f = TestBed.createComponent(App);
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('nav[aria-label="Primary navigation"]')).toBeTruthy();
    expect(el.querySelector('.brand')?.textContent).toContain('CHEFSHOP');
    expect(el.querySelector('main#main-content')).toBeTruthy();
  });
  it('offers signup and login to guests', async () => {
    const f = TestBed.createComponent(App);
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('Create an account');
    expect(f.nativeElement.textContent).toContain('Login');
  });
  it('moves skip-link focus to main without turning its fragment into a hash route', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const main = root.querySelector<HTMLElement>('main')!;
    const hash = location.hash;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    root.querySelector<HTMLAnchorElement>('.skip-link')!.dispatchEvent(click);
    expect(click.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(main);
    expect(location.hash).toBe(hash);
  });
});
describe('Shop component', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ShopPage], providers: [provideRouter([])] }),
  );
  it('filters cuisine and price reactively', () => {
    const f = TestBed.createComponent(ShopPage),
      c = f.componentInstance;
    c.category.set('meal');
    c.region.set('Egypt');
    expect(c.filtered().length).toBe(4);
    c.max.set(40);
    expect(c.filtered().map((p) => p.key)).toEqual(['taameya']);
  });
  it('sorts product prices and searches names', () => {
    const f = TestBed.createComponent(ShopPage),
      c = f.componentInstance;
    c.category.set('meal');
    c.query.set('pesto');
    expect(c.filtered().map((p) => p.key)).toEqual(['pesto']);
    c.query.set('');
    c.sort.set('price');
    const prices = c.filtered().map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

describe('Reduced-motion home presentation', () => {
  it('uses a still image instead of mounting an autoplaying video for a reduced-motion user', async () => {
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), { provide: StorageService, useClass: MemoryStorage }],
    });
    const auth = TestBed.inject(AuthService);
    await auth.login('alex', 'ChefShop@2026');
    auth.updateProfile({ preferences: { ...auth.user()!.preferences, reducedMotion: true } });
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const hero = (fixture.nativeElement as HTMLElement).querySelector('.hero .art')!;
    expect(hero.querySelector('video')).toBeNull();
    expect(hero.querySelector('img')?.getAttribute('alt')).toContain('Fettuccine Alfredo');
  });
});

describe('Budget category form binding', () => {
  it('shows the saved category initially and when editing rather than the first option', async () => {
    TestBed.configureTestingModule({
      imports: [BudgetsPage],
      providers: [provideRouter([]), { provide: StorageService, useClass: MemoryStorage }],
    });
    await TestBed.inject(AuthService).login('accounts', 'ChefShop@2026');
    const fixture = TestBed.createComponent(BudgetsPage);
    fixture.detectChanges();
    const category = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(
      'select[formControlName="category"]',
    )!;
    expect(category.value).toBe('ingredients');
    fixture.componentInstance.form.patchValue({ category: 'stock', department: 'Store' });
    fixture.detectChanges();
    expect(category.value).toBe('stock');
    fixture.destroy();
  });
});
