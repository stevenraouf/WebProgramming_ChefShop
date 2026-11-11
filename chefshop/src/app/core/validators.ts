import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export const demoCard: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  c.value?.replace(/\s/g, '') === '4242424242424242' ? null : { demoCard: true };
export const expiry: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(c.value || ''));
  if (!m) return { expiry: true };
  return new Date(2000 + Number(m[2]), Number(m[1]), 1) > new Date() ? null : { expiry: true };
};
export const passwordMatch: ValidatorFn = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { passwordMatch: true };
export const trimRequired: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  String(c.value || '').trim() ? null : { required: true };
