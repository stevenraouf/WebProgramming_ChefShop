import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';
import { UiService } from './core/ui.service';
import { StorageService } from './core/storage.service';
import { TextMotion } from './shared/text-motion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TextMotion],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly brandLetters = Array.from('CHEFSHOP');
  auth = inject(AuthService);
  cart = inject(CartService);
  ui = inject(UiService);
  storage = inject(StorageService);
  router = inject(Router);
  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.ui.theme();
      document.documentElement.classList.toggle(
        'reduce-motion',
        !!this.auth.user()?.preferences.reducedMotion,
      );
    });
  }
  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
  skipToContent(event: Event): void {
    // A bare fragment would otherwise become a route with withHashLocation().
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
}
