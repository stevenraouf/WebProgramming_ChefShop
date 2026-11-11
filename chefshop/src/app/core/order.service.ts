import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { Order, newId, today, roundMoney } from './models';
@Injectable({ providedIn: 'root' })
export class OrderService {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private db = inject(DatabaseService);
  private storage = inject(StorageService);
  place(data: Pick<Order, 'contact' | 'fulfillment' | 'slot' | 'payment'>): Order {
    if (!this.cart.count()) throw Error('Your bag is empty.');
    if (
      !data.contact.name.trim() ||
      !data.contact.email.includes('@') ||
      data.contact.phone.replace(/\D/g, '').length < 8 ||
      !data.slot ||
      (data.fulfillment === 'delivery' && !data.contact.address.trim())
    )
      throw Error('Complete your contact, fulfillment and time details.');
    const subtotal = this.cart.subtotal(),
      fee = data.fulfillment === 'delivery' ? 30 : 0;
    const order: Order = {
      ...data,
      id: newId('CS'),
      userId: this.auth.user()?.id || null,
      date: today(),
      items: structuredClone(this.cart.lines()),
      subtotal,
      fee,
      total: roundMoney(subtotal + fee),
    };
    if (order.userId) this.db.update((db) => db.orders.push(order));
    else {
      const guest = this.storage.read<Order[]>('guest-orders', [], true);
      this.storage.write('guest-orders', [...guest, order], true);
    }
    this.storage.write('last-order', order.id, true);
    this.cart.clear();
    this.storage.remove('checkout', true);
    return order;
  }
  get(id: string): Order | undefined {
    const u = this.auth.user();
    return (
      this.db.data().orders.find((o) => o.id === id && o.userId === u?.id) ||
      this.storage.read<Order[]>('guest-orders', [], true).find((o) => o.id === id)
    );
  }
  history(): Order[] {
    return this.db.data().orders.filter((o) => o.userId === this.auth.user()?.id);
  }
}
