export type Role = 'admin' | 'accounting' | 'student' | 'chef';
export type Department = 'Kitchen' | 'Catering' | 'Store';
export interface Preferences {
  cuisine: string;
  vegetarian: boolean;
  newsletter: boolean;
  reducedMotion: boolean;
  audio: boolean;
}
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  picture: string;
  passwordHash: string;
  salt: string;
  card: { last4: string; expiry: string; holder: string } | null;
  preferences: Preferences;
}
export interface Product {
  key: string;
  name: string;
  price: number;
  category: 'meal' | 'spice' | 'tool' | 'essential';
  region: string;
  unit: string;
  copy: string;
}
export interface ProductOption {
  label: string;
  price: number;
}
export interface CartLine {
  id: string;
  productKey: string;
  option: string;
  price: number;
  qty: number;
}
export interface Order {
  id: string;
  userId: string | null;
  date: string;
  items: CartLine[];
  subtotal: number;
  fee: number;
  total: number;
  contact: { name: string; email: string; phone: string; address: string };
  fulfillment: 'pickup' | 'delivery';
  slot: string;
  payment: string;
}
export interface Transaction {
  id: string;
  date: string;
  department: Department;
  type: 'income' | 'expense';
  category: 'sales' | 'ingredients' | 'stock' | 'overhead' | 'other';
  description: string;
  amount: number;
}
export interface Staff {
  id: string;
  userId: string;
  name: string;
  base: number;
}
export interface CateringEvent {
  id: string;
  name: string;
  date: string;
  guests: number;
  sales: number;
  cost: number;
  approved: boolean;
  allowances: { staffId: string; amount: number }[];
}
export interface PayAdjustment {
  id: string;
  staffId: string;
  month: string;
  type: 'allowance' | 'deduction';
  reason: string;
  amount: number;
}
export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  receiptId: string;
}
export interface Invoice {
  id: string;
  studentId: string;
  module: string;
  amount: number;
  due: string;
  created: string;
  payments: Payment[];
}
export interface ProductPerformance {
  id: string;
  month: string;
  productKey: string;
  units: number;
  unitCost: number;
}
export interface AppDatabase {
  version: number;
  users: User[];
  orders: Order[];
  transactions: Transaction[];
  staff: Staff[];
  events: CateringEvent[];
  adjustments: PayAdjustment[];
  invoices: Invoice[];
  productPerformance: ProductPerformance[];
  reports: { id: string; month: string; created: string; total: number; rows: PayRow[] }[];
}
export interface PayRow {
  staffId: string;
  name: string;
  base: number;
  eventAllowance: number;
  manualAllowance: number;
  deductions: number;
  gross: number;
  net: number;
}
export const DEFAULT_PREFERENCES: Preferences = {
  cuisine: 'All',
  vegetarian: false,
  newsletter: false,
  reducedMotion: false,
  audio: false,
};
export const DEPARTMENTS: Department[] = ['Kitchen', 'Catering', 'Store'];
export const FINANCE_ROLES: Role[] = ['admin', 'accounting'];
export const newId = (prefix: string) =>
  prefix + '-' + crypto.randomUUID().slice(0, 8).toUpperCase();
export const today = () => new Date().toISOString().slice(0, 10);
export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
