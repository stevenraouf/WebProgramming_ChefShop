import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService),
    router = inject(Router);
  auth.validateSession();
  const u = auth.user();
  if (!u) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  const roles = route.data['roles'] as Role[] | undefined;
  return !roles || roles.includes(u.role) || router.createUrlTree(['/forbidden']);
};
export function safeReturnUrl(url: string | null): string | null {
  return url && url.startsWith('/') && !url.startsWith('//') && !/^\/login|^\/signup/.test(url)
    ? url
    : null;
}
