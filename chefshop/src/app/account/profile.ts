import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { OrderService } from '../core/order.service';
import { UiService } from '../core/ui.service';
import { demoCard, expiry, trimRequired } from '../core/validators';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, Heading, ErrorMessage],
  template: `@if (auth.user(); as u) {
    <app-heading
      eyebrow="YOUR CHEFSHOP"
      title="MAKE YOURSELF AT HOME."
      copy="Your profile, preferences and purchases."
    />
    <div class="profile-layout">
      <aside class="panel">
        <div class="profile-avatar">
          @if (u.picture) {
            <img class="avatar large" [src]="u.picture" [alt]="u.name" width="120" height="120" />
          } @else {
            <span class="avatar initials">{{ u.name.charAt(0) }}</span>
          }
        </div>
        <h2>{{ u.name }}</h2>
        <p>{{ u.email }}</p>
        <span class="badge">{{ u.role }}</span>
        <dl>
          <dt>Username</dt>
          <dd>{{ u.username }}</dd>
          <dt>Account ID</dt>
          <dd>{{ u.id }}</dd>
          <dt>Password</dt>
          <dd>Protected with a salted hash</dd>
          <dt>Payment preference</dt>
          <dd>
            {{
              u.card
                ? 'Demo card •••• ' + u.card.last4 + ' · ' + u.card.expiry
                : 'No saved payment preference'
            }}
          </dd>
        </dl>
        <a class="primary full" [routerLink]="auth.home()">My workspace →</a>
      </aside>
      <form class="panel" [formGroup]="form" (ngSubmit)="save()">
        <h2>YOUR DETAILS</h2>
        <app-error [message]="error()" /><label
          ><span>FULL NAME</span><input formControlName="name" autocomplete="name" /></label
        ><label
          ><span>EMAIL</span
          ><input formControlName="email" type="email" autocomplete="email" /></label
        ><label
          ><span>CHANGE PICTURE</span
          ><input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            (change)="upload($event)"
          /><small>JPG, PNG or WebP · Up to 500 KB.</small></label
        ><label
          ><span>FAVOURITE CUISINE</span
          ><select formControlName="cuisine">
            @for (c of ['All', 'Egypt', 'Italy', 'Greece']; track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select></label
        ><label class="checkbox"
          ><input type="checkbox" formControlName="vegetarian" />Prefer vegetarian choices</label
        ><label class="checkbox"
          ><input type="checkbox" formControlName="newsletter" />Interested in academy
          updates</label
        ><label class="checkbox"
          ><input type="checkbox" formControlName="reducedMotion" />Reduce motion</label
        ><label class="checkbox"
          ><input type="checkbox" formControlName="audio" />Play a short sound when adding to
          bag</label
        ><button class="secondary" type="button" (click)="ui.sound()">
          Preview feedback sound
        </button>
        <details class="section">
          <summary>Update demo payment preference</summary>
          <p class="small muted">
            Leave blank to keep your existing preference. Full card numbers are never saved.
          </p>
          <label
            ><span>DEMO CARD · 4242 4242 4242 4242</span
            ><input formControlName="cardNumber" inputmode="numeric" autocomplete="off" /></label
          ><label
            ><span>EXPIRY · MM/YY</span><input formControlName="expiry" placeholder="12/28"
          /></label>
        </details>
        <button class="primary full" type="submit">Save profile</button>
      </form>
    </div>
    <section class="section">
      <h2>YOUR ORDERS</h2>
      @if (orders.history().length) {
        <div class="grid">
          @for (o of orders.history(); track o.id) {
            <article class="panel">
              <h3>{{ o.id }}</h3>
              <p>{{ o.date | date }} · {{ o.total | currency: 'EGP' : 'code' }}</p>
              <a class="secondary" [routerLink]="['/order', o.id]">View order</a>
            </article>
          }
        </div>
      } @else {
        <p class="muted">Your completed orders will appear here.</p>
      }
    </section>
  }`,
})
export class ProfilePage {
  auth = inject(AuthService);
  orders = inject(OrderService);
  ui = inject(UiService);
  fb = inject(FormBuilder);
  error = signal('');
  picture = signal(this.auth.user()!.picture);
  u = this.auth.user()!;
  form = this.fb.nonNullable.group({
    name: [this.u.name, [trimRequired, Validators.maxLength(80)]],
    email: [this.u.email, [Validators.required, Validators.email]],
    cuisine: [this.u.preferences.cuisine],
    vegetarian: [this.u.preferences.vegetarian],
    newsletter: [this.u.preferences.newsletter],
    reducedMotion: [this.u.preferences.reducedMotion],
    audio: [this.u.preferences.audio],
    cardNumber: [''],
    expiry: [this.u.card?.expiry || ''],
  });
  upload(event: Event): void {
    const el = event.target as HTMLInputElement,
      f = el.files?.[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 500 * 1024) {
      this.error.set('Choose a JPG, PNG or WebP picture up to 500 KB.');
      return;
    }
    const r = new FileReader();
    r.onload = () => this.picture.set(String(r.result));
    r.readAsDataURL(f);
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Enter a name and valid email.');
      return;
    }
    const v = this.form.getRawValue();
    if (
      v.cardNumber &&
      (demoCard(this.form.controls.cardNumber) || expiry(this.form.controls.expiry))
    ) {
      this.error.set('Use the demo card 4242 4242 4242 4242 and a future expiry.');
      return;
    }
    try {
      this.auth.updateProfile({
        name: v.name.trim(),
        email: v.email.trim().toLowerCase(),
        picture: this.picture(),
        preferences: {
          cuisine: v.cuisine,
          vegetarian: v.vegetarian,
          newsletter: v.newsletter,
          reducedMotion: v.reducedMotion,
          audio: v.audio,
        },
        ...(v.cardNumber
          ? { card: { last4: '4242', expiry: v.expiry, holder: v.name.trim() } }
          : {}),
      });
      this.form.controls.cardNumber.reset();
      this.error.set('');
      this.ui.notify('Your profile has been updated.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
