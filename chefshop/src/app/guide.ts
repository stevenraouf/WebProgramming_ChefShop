import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './core/auth.service';
import { Heading } from './shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-guide',
  imports: [RouterLink, Heading],
  template: `<app-heading
      eyebrow="THE COMPLETE CHEFSHOP EXPERIENCE"
      title="ONE TABLE. EVERY WORKFLOW."
      copy="A frontend demonstration of a culinary institute, its shop, and its operations."
    />
    <section class="section">
      <h2>SHOPPING</h2>
      <div class="steps">
        <a routerLink="/shop">01 → Browse meals, spices and tools</a
        ><a routerLink="/product/alfredo">02 → Choose an option and discover related ingredients</a
        ><a routerLink="/cart">03 → Edit your bag and continue to checkout</a>
      </div>
      <p class="muted">
        Checkout validates your contact, pickup or delivery, time slot and optional demo card. Order
        confirmation appears after a successful demo order.
      </p>
    </section>
    <section class="section">
      <h2>YOUR INSTITUTE WORKSPACE</h2>
      <div class="steps">
        <a routerLink="/signup">Create a student account</a
        ><a routerLink="/login">Sign in with a demo account</a
        ><a routerLink="/profile">Update your profile and preferences</a>
      </div>
    </section>
    <section class="panel">
      <h2>DEMO ACCOUNTS</h2>
      <p>Use password <code>ChefShop&#64;2026</code> with one of these usernames:</p>
      <dl>
        <dt>admin</dt>
        <dd>Manage users and all financial records.</dd>
        <dt>accounts</dt>
        <dd>Manage payroll, budgets, fees and product performance.</dd>
        <dt>alex</dt>
        <dd>View and pay your own module invoices; shop student essentials.</dd>
        <dt>nadia</dt>
        <dd>View your own salary, adjustments and event allowances.</dd>
      </dl>
      <a class="primary" routerLink="/login">Open login →</a>
    </section>
    <section class="section">
      <h2>WHAT TO TRY</h2>
      <ol class="workflow-list">
        <li>
          Shop → Alfredo → Large portion → change quantity → add to bag → checkout → choose pickup
          or delivery → place a demo order.
        </li>
        <li>
          Sign up with a picture and preferences → profile → edit details → sign out → sign back in.
        </li>
        <li>
          Accounting → Student fees → create invoice → record a partial payment → view history and
          receipt.
        </li>
        <li>
          Student Alex → fee records → pay an outstanding module with card
          <code>4242 4242 4242 4242</code>, a future expiry such as <code>12/28</code>, and CVC
          <code>123</code>.
        </li>
        <li>
          Accounting → Catering → approve Winter Showcase → Payroll → verify allowances → add
          deduction → download monthly JSON.
        </li>
        <li>
          Accounting → Budgets → add or edit income and expenses → check charts and Operations
          totals.
        </li>
        <li>Student → attempt the Payroll or Admin URL → access is restricted.</li>
      </ol>
    </section>
    <section class="panel">
      <h2>HOW YOUR DEMO DATA IS SAVED</h2>
      <p>
        <strong>Local storage:</strong> demo accounts, masked card preference, bag and financial
        records survive a browser restart.
      </p>
      <p>
        <strong>Session storage:</strong> sign-in expires after eight hours; checkout drafts and
        guest order confirmations stay in the current tab.
      </p>
      <p>
        <strong>Cookies:</strong> theme and preference choices. No passwords, card numbers or
        account identity are stored in cookies.
      </p>
      <p class="muted">
        Passwords use PBKDF2 with unique salts. Full card numbers and CVCs are never saved. This
        client-only demonstration cannot provide production security; server authentication and a
        payment provider belong in the next milestone.
      </p>
    </section>
    <section class="panel">
      <h2>MOTION & ACCESSIBILITY</h2>
      <p>
        Food layering is a photo-derived 3D relief effect. Still-view controls are available in the
        meal explorer. System reduced-motion settings and your profile's reduced-motion preference
        are respected. Audio feedback is off until enabled in your profile.
      </p>
    </section>`,
})
export class GuidePage {}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-forbidden',
  imports: [RouterLink, Heading],
  template: `<app-heading
      eyebrow="ACCESS RESTRICTED"
      title="THIS WORKSPACE IS FOR ANOTHER ROLE."
      copy="Your account can only access the information and actions assigned to its role."
    />
    <div class="actions">
      <a class="primary" [routerLink]="auth.home()">Return to my workspace</a
      ><a class="secondary" routerLink="/profile">Your profile</a>
    </div>`,
})
export class ForbiddenPage {
  auth = inject(AuthService);
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found',
  imports: [RouterLink, Heading],
  template: `<app-heading
      eyebrow="A FRESH START"
      title="THIS PAGE IS OFF THE MENU."
      copy="The page you requested could not be found."
    /><a class="primary" routerLink="/">Back to home</a>`,
})
export class NotFoundPage {}
