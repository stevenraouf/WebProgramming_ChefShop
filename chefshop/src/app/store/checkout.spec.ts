import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CheckoutPage } from './checkout';
import { StorageService } from '../core/storage.service';
import { MemoryStorage } from '../core/test-storage';
import { CartService } from '../core/cart.service';
import { CatalogService } from '../core/catalog.service';
describe('Checkout form state', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [provideRouter([]), { provide: StorageService, useClass: MemoryStorage }],
    }),
  );
  it('restores delivery and card validation without saving card details', () => {
    const storage = TestBed.inject(StorageService);
    storage.write(
      'checkout',
      {
        name: 'Alex Morgan',
        email: 'alex@example.com',
        phone: '01000000000',
        fulfillment: 'delivery',
        payment: 'card',
        address: '',
        slot: 'Today · 14:00–16:00',
      },
      true,
    );
    const f = TestBed.createComponent(CheckoutPage),
      c = f.componentInstance;
    expect(c.form.controls.address.invalid).toBeTrue();
    expect(c.form.controls.cardNumber.invalid).toBeTrue();
    expect(c.fee()).toBe(30);
    c.form.controls.cardNumber.setValue('4242424242424242');
    const saved = storage.read<Record<string, string>>('checkout', {}, true);
    expect(saved['cardNumber']).toBeUndefined();
    expect(saved['cvc']).toBeUndefined();
  });
  it('removes the delivery fee and address requirement for pickup', () => {
    const f = TestBed.createComponent(CheckoutPage),
      c = f.componentInstance;
    c.form.controls.fulfillment.setValue('delivery');
    expect(c.fee()).toBe(30);
    expect(c.form.controls.address.invalid).toBeTrue();
    c.form.controls.fulfillment.setValue('pickup');
    expect(c.fee()).toBe(0);
    expect(c.form.controls.address.valid).toBeTrue();
  });
  it('shows validation feedback instead of submitting an incomplete order', () => {
    const f = TestBed.createComponent(CheckoutPage),
      c = f.componentInstance,
      cat = TestBed.inject(CatalogService),
      p = cat.get('alfredo')!;
    TestBed.inject(CartService).add(p, cat.options(p)[0].label, 1);
    c.submit();
    expect(c.error()).toContain('highlighted');
    expect(TestBed.inject(CartService).count()).toBe(1);
  });
});
