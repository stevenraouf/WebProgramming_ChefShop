import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly warning = signal('');
  read<T>(key: string, fallback: T, session = false): T {
    try {
      const raw = (session ? sessionStorage : localStorage).getItem('chefshop:' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      this.warning.set('Saved data could not be read. This session will use demo defaults.');
      return fallback;
    }
  }
  write(key: string, value: unknown, session = false): void {
    try {
      (session ? sessionStorage : localStorage).setItem('chefshop:' + key, JSON.stringify(value));
    } catch {
      this.warning.set(
        'Browser storage is full or unavailable. Changes remain in memory until this page closes.',
      );
    }
  }
  remove(key: string, session = false): void {
    try {
      (session ? sessionStorage : localStorage).removeItem('chefshop:' + key);
    } catch {}
  }
  cookie(name: string, value: string, days = 365): void {
    document.cookie =
      'chefshop_' +
      encodeURIComponent(name) +
      '=' +
      encodeURIComponent(value) +
      '; Max-Age=' +
      days * 86400 +
      '; Path=/; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  }
  readCookie(name: string): string {
    const prefix = 'chefshop_' + encodeURIComponent(name) + '=';
    return decodeURIComponent(
      document.cookie
        .split('; ')
        .find((c) => c.startsWith(prefix))
        ?.slice(prefix.length) || '',
    );
  }
}
