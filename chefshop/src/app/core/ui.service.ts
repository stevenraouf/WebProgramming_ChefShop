import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
@Injectable({ providedIn: 'root' })
export class UiService {
  storage = inject(StorageService);
  readonly toast = signal('');
  readonly theme = signal(this.storage.readCookie('theme') || 'dark');
  readonly cookieChoice = signal(this.storage.readCookie('preferences'));
  private timer: ReturnType<typeof setTimeout> | undefined;
  notify(message: string): void {
    this.toast.set(message);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(''), 5000);
  }
  setTheme(theme: string): void {
    this.theme.set(theme);
    this.storage.cookie('theme', theme);
    document.documentElement.dataset['theme'] = theme;
  }
  acceptCookies(value = 'essential'): void {
    this.storage.cookie('preferences', value);
    this.cookieChoice.set(value);
  }
  download(name: string, data: unknown): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  sound(): void {
    try {
      const ctx = new AudioContext(),
        osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      osc.onended = () => ctx.close();
    } catch {}
  }
}
