import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { DEFAULT_PREFERENCES, Role, User, newId } from './models';
export interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  picture: string;
  cardNumber: string;
  expiry: string;
  cuisine: string;
  vegetarian: boolean;
  newsletter: boolean;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private db = inject(DatabaseService);
  private storage = inject(StorageService);
  private session = signal(
    this.storage.read<{ id: string; expires: number } | null>('session', null, true),
  );
  private clock = signal(Date.now());
  readonly user = computed(() => {
    this.clock();
    const s = this.session();
    return s && s.expires > Date.now()
      ? this.db.data().users.find((u) => u.id === s.id && u.active) || null
      : null;
  });
  readonly isFinance = computed(
    () => !!this.user() && ['admin', 'accounting'].includes(this.user()!.role),
  );
  constructor() {
    const timer = setInterval(() => this.clock.set(Date.now()), 60000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  validateSession(): void {
    if (this.session() && this.session()!.expires <= Date.now()) this.logout();
  }
  async hash(password: string, salt: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
      key,
      256,
    );
    return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  async login(username: string, password: string): Promise<void> {
    const u = this.db
      .data()
      .users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.active);
    if (!u || (await this.hash(password, u.salt)) !== u.passwordHash)
      throw Error('The username or password is incorrect.');
    const s = { id: u.id, expires: Date.now() + 8 * 60 * 60 * 1000 };
    this.session.set(s);
    this.storage.write('session', s, true);
  }
  async signup(data: SignupData): Promise<void> {
    const username = data.username.trim(),
      email = data.email.trim().toLowerCase();
    if (this.db.data().users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
      throw Error('That username is already taken.');
    if (this.db.data().users.some((u) => u.email.toLowerCase() === email))
      throw Error('That email is already registered.');
    const salt = crypto.randomUUID(),
      passwordHash = await this.hash(data.password, salt);
    const u: User = {
      id: newId('ST'),
      username,
      name: data.name.trim(),
      email,
      role: 'student',
      active: true,
      picture: data.picture,
      salt,
      passwordHash,
      card: {
        last4: data.cardNumber.replace(/\s/g, '').slice(-4),
        expiry: data.expiry,
        holder: data.name.trim(),
      },
      preferences: {
        ...DEFAULT_PREFERENCES,
        cuisine: data.cuisine,
        vegetarian: data.vegetarian,
        newsletter: data.newsletter,
      },
    };
    this.db.update((db) => db.users.push(u));
    await this.login(username, data.password);
  }
  logout(): void {
    this.session.set(null);
    this.storage.remove('session', true);
    this.storage.remove('checkout', true);
  }
  require(roles: readonly Role[]): User {
    this.validateSession();
    const u = this.user();
    if (!u || !roles.includes(u.role))
      throw Error('You do not have permission to perform this action.');
    return u;
  }
  updateProfile(
    patch: Partial<Pick<User, 'name' | 'email' | 'picture' | 'preferences' | 'card'>>,
  ): void {
    const u = this.user();
    if (!u) throw Error('Please sign in.');
    if (
      patch.email &&
      this.db
        .data()
        .users.some((x) => x.id !== u.id && x.email.toLowerCase() === patch.email!.toLowerCase())
    )
      throw Error('That email is already registered.');
    this.db.update((db) =>
      Object.assign(
        db.users.find((x) => x.id === u.id)!,
        patch,
      ),
    );
  }
  updateAccess(id: string, role: Role, active: boolean): void {
    const admin = this.require(['admin']);
    if (id === admin.id) throw Error('Use another administrator to change your own access.');
    this.db.update((db) => {
      const u = db.users.find((u) => u.id === id);
      if (!u) throw Error('User not found.');
      u.role = role;
      u.active = active;
    });
  }
  home(): string {
    return this.user()?.role === 'student'
      ? '/student'
      : this.user()?.role === 'chef'
        ? '/chef'
        : '/operations';
  }
}
