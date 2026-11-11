import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DatabaseService } from '../core/database.service';
import { Role, User } from '../core/models';
import { UiService } from '../core/ui.service';
import { Heading, ErrorMessage } from '../shared/shared';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin',
  imports: [FormsModule, RouterLink, Heading, ErrorMessage],
  template: `<p><a class="secondary" routerLink="/operations">← Operations overview</a></p>
    <app-heading
      eyebrow="ADMINISTRATION"
      title="THE PEOPLE BEHIND THE CRAFT."
      copy="Manage demo roles and account access. New registrations always start as students."
    /><app-error [message]="error()" /><label
      ><span>SEARCH USERS</span
      ><input type="search" [ngModel]="search()" (ngModelChange)="search.set($event)"
    /></label>
    <div class="table-wrap">
      <table class="responsive-table">
        <caption>
          User access
        </caption>
        <thead>
          <tr>
            <th>Name & username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          @for (u of users(); track u.id) {
            <tr>
              <td data-label="User">
                <strong>{{ u.name }}</strong
                ><br /><small>{{ u.username }}</small>
              </td>
              <td data-label="Email">{{ u.email }}</td>
              <td data-label="Role">
                <select
                  [ngModel]="u.role"
                  (ngModelChange)="save(u, $event, u.active)"
                  [disabled]="u.id === auth.user()?.id"
                  [attr.aria-label]="'Role for ' + u.name"
                >
                  @for (role of roles; track role) {
                    <option [value]="role">{{ role }}</option>
                  }
                </select>
              </td>
              <td data-label="Status">
                <span class="badge" [class.pending]="!u.active">{{
                  u.active ? 'Active' : 'Disabled'
                }}</span>
              </td>
              <td data-label="Action">
                <button
                  class="secondary"
                  [disabled]="u.id === auth.user()?.id"
                  (click)="save(u, u.role, !u.active)"
                >
                  {{ u.active ? 'Disable' : 'Enable' }}
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <p class="notice">
      Administrators manage roles. Accounting manages financial records. Students access their own
      fees and profile. Chefs access their own salary and event allowances. Your own administrator
      access cannot be changed here.
    </p>`,
})
export class AdminPage {
  auth = inject(AuthService);
  db = inject(DatabaseService);
  ui = inject(UiService);
  error = signal('');
  search = signal('');
  roles: Role[] = ['admin', 'accounting', 'student', 'chef'];
  users = computed(() =>
    this.db
      .data()
      .users.filter((u) =>
        (u.name + ' ' + u.username + ' ' + u.email)
          .toLowerCase()
          .includes(this.search().toLowerCase()),
      ),
  );
  save(u: User, role: Role, active: boolean): void {
    try {
      this.auth.updateAccess(u.id, role, active);
      this.error.set('');
      this.ui.notify('User access updated.');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
