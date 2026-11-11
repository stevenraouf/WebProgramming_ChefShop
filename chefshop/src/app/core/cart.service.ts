import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogService } from './catalog.service';
import { StorageService } from './storage.service';
import { CartLine, Product, roundMoney } from './models';
@Injectable({ providedIn: 'root' })
export class CartService {
  private storage = inject(StorageService);
  private catalog = inject(CatalogService);
  private normalize(lines: CartLine[]): CartLine[] {
    if (!Array.isArray(lines)) return [];
    return lines.flatMap((l) => {
      const p = this.catalog.get(l.productKey),
        o = p ? this.catalog.options(p).find((o) => o.label === l.option) : undefined;
      return p && o && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 10
        ? [{ ...l, id: p.key + '|' + o.label, price: o.price }]
        : [];
    });
  }
  readonly lines = signal(this.normalize(this.storage.read<CartLine[]>('cart', [])));
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  readonly subtotal = computed(() =>
    roundMoney(this.lines().reduce((n, l) => n + l.qty * l.price, 0)),
  );
  private commit(lines: CartLine[]): void {
    this.lines.set(lines);
    this.storage.write('cart', lines);
  }
  add(p: Product, option: string, qty: number): void {
    const o = this.catalog.options(p).find((o) => o.label === option);
    if (!o || !Number.isInteger(qty) || qty < 1 || qty > 10)
      throw Error('Choose an available option and quantity from 1 to 10.');
    const lines = structuredClone(this.lines()),
      id = p.key + '|' + o.label,
      line = lines.find((l) => l.id === id);
    if ((line?.qty || 0) + qty > 10) throw Error('A maximum of 10 items per option is available.');
    if (line) line.qty += qty;
    else lines.push({ id, productKey: p.key, option, price: o.price, qty });
    this.commit(lines);
  }
  change(id: string, delta: number): void {
    const lines = structuredClone(this.lines()),
      l = lines.find((l) => l.id === id);
    if (!l) return;
    if (l.qty + delta > 10) throw Error('A maximum of 10 items per option is available.');
    l.qty += delta;
    this.commit(lines.filter((l) => l.qty > 0));
  }
  remove(id: string): void {
    this.commit(this.lines().filter((l) => l.id !== id));
  }
  clear(): void {
    this.commit([]);
  }
}
