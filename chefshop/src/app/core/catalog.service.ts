import { Injectable } from '@angular/core';
import { PRODUCTS } from './catalog-data';
import { Product, ProductOption } from './models';
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly products = PRODUCTS;
  readonly related: Record<string, string[]> = {
    alfredo: ['pepper', 'saucepan', 'tongs'],
    bolognese: ['oregano', 'basil', 'saucepan', 'knife'],
    pesto: ['basil', 'pepper', 'mortar', 'tongs'],
    pizza: ['basil', 'oregano', 'stone', 'wheel'],
    souvlaki: ['oregano', 'thyme', 'grill', 'citrus'],
    spanakopita: ['pepper', 'thyme', 'knife', 'board'],
    gyro: ['oregano', 'paprika', 'grill', 'knife'],
    halloumi: ['sumac', 'oregano', 'grill', 'citrus'],
    taameya: ['cumin', 'coriander', 'frying', 'colander'],
    ful: ['cumin', 'dukkah', 'saucepan', 'citrus'],
    hawawshi: ['cumin', 'paprika', 'board', 'knife'],
    liver: ['cumin', 'chili', 'frying', 'knife'],
  };
  readonly allergens: Record<string, string> = {
    alfredo: 'Wheat · Milk',
    bolognese: 'Wheat · Milk',
    pesto: 'Wheat · Milk · Nuts',
    pizza: 'Wheat · Milk',
    souvlaki: 'Wheat · Milk',
    spanakopita: 'Wheat · Milk',
    gyro: 'Wheat · Milk',
    halloumi: 'Wheat · Milk',
    taameya: 'Wheat · Sesame',
    ful: 'Wheat · Sesame',
    hawawshi: 'Wheat',
    liver: 'Wheat',
    dukkah: 'Nuts · Sesame',
  };
  get(key: string): Product | undefined {
    return this.products.find((p) => p.key === key);
  }
  image(p: Product): string {
    return p.category === 'meal'
      ? 'assets/motion/' + p.key + '-meal.webp'
      : 'assets/catalog/product-' + p.key + '.png';
  }
  options(p: Product): ProductOption[] {
    if (p.key === 'alfredo')
      return [
        { label: 'Regular · 1 serving', price: 160 },
        { label: 'Large · 1 generous serving', price: 200 },
      ];
    if (p.key === 'pizza')
      return [
        { label: 'Small · 20 cm', price: 150 },
        { label: 'Medium · 28 cm', price: 190 },
        { label: 'Large · 32 cm', price: 230 },
      ];
    if (p.key === 'pepper')
      return [
        { label: '50 g pack', price: 40 },
        { label: '100 g pack', price: 70 },
      ];
    if (p.key === 'uniform')
      return ['S', 'M', 'L', 'XL'].map((s) => ({ label: 'Jacket size ' + s, price: 420 }));
    return [{ label: p.unit, price: p.price }];
  }
}
