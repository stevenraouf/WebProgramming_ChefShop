import { Injectable, computed, inject, signal } from '@angular/core';
import { AppDatabase } from './models';
import { SEED_DATABASE } from './seed';
import { StorageService } from './storage.service';
@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private storage = inject(StorageService);
  private initial = this.storage.read<AppDatabase>('database', structuredClone(SEED_DATABASE));
  readonly data = signal<AppDatabase>(
    this.valid(this.initial) ? this.initial : structuredClone(SEED_DATABASE),
  );
  readonly students = computed(() =>
    this.data().users.filter((u) => u.role === 'student' && u.active),
  );
  private valid(db: AppDatabase): boolean {
    return (
      !!db &&
      db.version === 1 &&
      [
        'users',
        'orders',
        'transactions',
        'staff',
        'events',
        'adjustments',
        'invoices',
        'productPerformance',
        'reports',
      ].every((k) => Array.isArray((db as unknown as Record<string, unknown>)[k]))
    );
  }
  update(change: (db: AppDatabase) => void): void {
    const db = structuredClone(this.data());
    change(db);
    this.storage.write('database', db);
    this.data.set(db);
  }
}
