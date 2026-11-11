import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { safeReturnUrl } from '../core/guards';
import { demoCard, expiry, passwordMatch, trimRequired } from '../core/validators';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Heading, ErrorMessage],
  template: `<div class="auth-layout">
    <section>
      <app-heading
        eyebrow="WELCOME BACK"
        title="MAKE YOURSELF AT HOME."
        copy="Your learning, essentials, and next chapter."
      /><img
        class="photo"
        src="assets/catalog/academy.png"
        alt="The teaching kitchen"
        width="600"
        height="420"
      />
    </section>
    <section class="panel">
      <h2>SIGN IN</h2>
      <app-error [message]="error()" />
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label
          ><span>USERNAME</span><input formControlName="username" autocomplete="username" />
          @if (form.controls.username.invalid && form.controls.username.touched) {
            <small class="field-error">Enter your username.</small>
          }</label
        ><label
          ><span>PASSWORD</span
          ><input
            formControlName="password"
            [type]="show() ? 'text' : 'password'"
            autocomplete="current-password"
          />
          @if (form.controls.password.invalid && form.controls.password.touched) {
            <small class="field-error">Enter your password.</small>
          }</label
        ><label class="checkbox"
          ><input type="checkbox" [checked]="show()" (change)="show.set(!show())" />Show
          password</label
        ><button class="primary full" type="submit" [disabled]="busy()">
          {{ busy() ? 'Signing in…' : 'Sign in →' }}
        </button>
      </form>
      <p class="small">New to ChefShop? <a routerLink="/signup">Create a student account</a></p>
      <details class="demo-accounts">
        <summary>Try a demo account</summary>
        <p class="small muted">All demo accounts use <code>ChefShop&#64;2026</code>.</p>
        <div class="demo-grid">
          @for (d of demos; track d.username) {
            <button class="secondary" (click)="useDemo(d.username)">
              {{ d.label }} · {{ d.username }}
            </button>
          }
        </div>
      </details>
      <p class="small muted">
        Course demonstration: sign-in and permissions are enforced in this browser. A server will be
        added in the next milestone.
      </p>
    </section>
  </div>`,
})
export class LoginPage {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  error = signal('');
  busy = signal(false);
  show = signal(false);
  form = this.fb.nonNullable.group({
    username: ['', trimRequired],
    password: ['', Validators.required],
  });
  demos = [
    { label: 'Admin', username: 'admin' },
    { label: 'Accounting', username: 'accounts' },
    { label: 'Student', username: 'alex' },
    { label: 'Chef', username: 'nadia' },
  ];
  useDemo(username: string): void {
    this.form.setValue({ username, password: 'ChefShop@2026' });
    this.error.set('');
  }
  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Enter your username and password.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.form.controls.username.value, this.form.controls.password.value);
      const target =
        safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')) || this.auth.home();
      await this.router.navigateByUrl(target);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.busy.set(false);
    }
  }
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, Heading, ErrorMessage],
  template: `<app-heading
      eyebrow="YOUR PLACE AT THE TABLE"
      title="START YOUR NEXT CHAPTER."
      copy="Create a student account for module fees, kitchen essentials and your culinary journey."
    />
    <form class="panel form-narrow" [formGroup]="form" (ngSubmit)="submit()">
      <app-error [message]="error()" />
      <div class="form-two">
        <label
          ><span>USERNAME</span><input formControlName="username" autocomplete="username" />
          @if (invalid('username')) {
            <small class="field-error"
              >Use 3–25 characters, starting with a letter. Letters, numbers, dots and underscores
              are allowed.</small
            >
          }</label
        ><label
          ><span>FULL NAME</span><input formControlName="name" autocomplete="name" />
          @if (invalid('name')) {
            <small class="field-error">Enter your name.</small>
          }
        </label>
      </div>
      <label
        ><span>EMAIL</span><input formControlName="email" type="email" autocomplete="email" />
        @if (invalid('email')) {
          <small class="field-error">Enter a valid email address.</small>
        }
      </label>
      <div class="form-two">
        <label
          ><span>PASSWORD</span
          ><input formControlName="password" type="password" autocomplete="new-password" />
          @if (invalid('password')) {
            <small class="field-error"
              >Use 8 or more characters with a capital letter, lowercase letter and number.</small
            >
          }</label
        ><label
          ><span>CONFIRM PASSWORD</span
          ><input formControlName="confirm" type="password" autocomplete="new-password" />
          @if (form.hasError('passwordMatch') && form.controls.confirm.touched) {
            <small class="field-error">The passwords must match.</small>
          }
        </label>
      </div>
      <div class="divider"></div>
      <h2>MAKE IT YOURS.</h2>
      <label
        ><span>PROFILE PICTURE</span
        ><input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          (change)="upload($event)"
        /><small>JPG, PNG or WebP · Maximum 500 KB.</small></label
      >
      @if (form.controls.picture.value) {
        <img
          class="avatar"
          [src]="form.controls.picture.value"
          alt="Your chosen profile picture"
          width="96"
          height="96"
        />
      }
      <button
        class="secondary"
        type="button"
        (click)="form.controls.picture.setValue('assets/figma/imgFrame.svg')"
      >
        Use institute avatar
      </button>
      @if (invalid('picture')) {
        <p class="field-error">Upload a picture or choose the institute avatar.</p>
      }
      <label class="section"
        ><span>FAVOURITE CUISINE</span
        ><select formControlName="cuisine">
          @for (c of ['All', 'Egypt', 'Italy', 'Greece']; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select></label
      ><label class="checkbox"
        ><input type="checkbox" formControlName="vegetarian" />I prefer vegetarian choices</label
      ><label class="checkbox"
        ><input type="checkbox" formControlName="newsletter" />Remember my interest in academy
        updates</label
      >
      <div class="divider"></div>
      <h2>DEMO PAYMENT PREFERENCE</h2>
      <p class="small muted">
        Use the test card 4242 4242 4242 4242. Only its last four digits, expiry and holder name are
        saved.
      </p>
      <label
        ><span>DEMO CREDIT CARD</span
        ><input formControlName="cardNumber" inputmode="numeric" autocomplete="off" />
        @if (invalid('cardNumber')) {
          <small class="field-error">Use 4242 4242 4242 4242 for this demonstration.</small>
        }</label
      ><label
        ><span>EXPIRY · MM/YY</span
        ><input formControlName="expiry" placeholder="12/28" autocomplete="off" />
        @if (invalid('expiry')) {
          <small class="field-error">Enter a future expiry date.</small>
        }</label
      ><button class="primary full" type="submit" [disabled]="busy()">
        {{ busy() ? 'Creating your account…' : 'Create student account →' }}
      </button>
      <p class="small">Already registered? <a routerLink="/login">Sign in</a></p>
    </form>`,
})
export class SignupPage {
  auth = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  error = signal('');
  busy = signal(false);
  form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_.]{2,24}$/)]],
      name: ['', [trimRequired, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirm: ['', Validators.required],
      picture: ['', Validators.required],
      cardNumber: ['', demoCard],
      expiry: ['', expiry],
      cuisine: ['All'],
      vegetarian: [false],
      newsletter: [false],
    },
    { validators: passwordMatch },
  );
  invalid(k: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[k];
    return c.invalid && c.touched;
  }
  upload(event: Event): void {
    const el = event.target as HTMLInputElement,
      f = el.files?.[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 500 * 1024) {
      this.error.set('Choose a JPG, PNG or WebP picture smaller than 500 KB.');
      el.value = '';
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      this.form.controls.picture.setValue(String(r.result));
      this.error.set('');
    };
    r.onerror = () => this.error.set('The image could not be read. Please choose another.');
    r.readAsDataURL(f);
  }
  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set(
        'Complete the highlighted fields, choose a picture, and make sure your passwords match.',
      );
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.signup(this.form.getRawValue());
      await this.router.navigate(['/profile']);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.busy.set(false);
    }
  }
}
