import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../core/catalog.service';
import { Product } from '../core/models';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-heading',
  template: `<p class="eyebrow">{{ eyebrow() }}</p>
    <h1 class="word-heading">
      @for (word of words(); track $index) {
        <span class="motion-word" [style.--word-index]="$index">{{ word.text }}</span
        >{{ word.gap }}
      }
    </h1>
    @if (copy()) {
      <p class="intro">{{ copy() }}</p>
    }`,
})
export class Heading {
  eyebrow = input('');
  title = input.required<string>();
  copy = input('');
  // Keep the original spaces/newlines and one semantic heading for assistive technology.
  words = computed(() =>
    Array.from(this.title().matchAll(/(\S+)(\s*)/g), (match) => ({
      text: match[1],
      gap: match[2],
    })),
  );
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  template: `<article class="card product-card">
    <a [routerLink]="['/product', product().key]" tabindex="-1" aria-hidden="true"
      ><img [src]="catalog.image(product())" alt="" loading="lazy" width="320" height="300"
    /></a>
    <p class="eyebrow">{{ product().region || product().unit }}</p>
    <h3>{{ product().name }}</h3>
    <p class="price">{{ product().price | currency: 'EGP' : 'code' }}</p>
    <a class="secondary" [routerLink]="['/product', product().key]"
      >View details<span class="sr-only"> for {{ product().name }}</span></a
    >
  </article>`,
})
export class ProductCard {
  product = input.required<Product>();
  catalog = inject(CatalogService);
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-error',
  template: `@if (message()) {
    <div class="error" role="alert">{{ message() }}</div>
  }`,
})
export class ErrorMessage {
  message = input('');
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chart',
  template: `<figure class="chart">
    <figcaption>{{ title() }}</figcaption>
    <div class="chart-stage">
      <canvas #canvas role="img" [attr.aria-label]="title() + '; data is listed below'"></canvas>
    </div>
    <table class="chart-data">
      <caption class="sr-only">
        {{
          title()
        }}
        data in EGP
      </caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">EGP</th>
        </tr>
      </thead>
      <tbody>
        @for (label of labels(); track $index) {
          <tr>
            <th scope="row">{{ label }}</th>
            <td>{{ values()[$index].toLocaleString('en-US') }}</td>
          </tr>
        }
      </tbody>
    </table>
  </figure>`,
})
export class ChartView implements AfterViewInit, OnDestroy {
  title = input.required<string>();
  labels = input<string[]>([]);
  values = input<number[]>([]);
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: import('chart.js').Chart | undefined;
  private ready = false;
  private version = 0;
  private destroyed = false;
  constructor() {
    effect(() => {
      this.labels();
      this.values();
      if (this.ready) void this.draw();
    });
  }
  ngAfterViewInit(): void {
    this.ready = true;
    void this.draw();
  }
  async draw(): Promise<void> {
    const version = ++this.version,
      { Chart, registerables } = await import('chart.js');
    if (this.destroyed || version !== this.version) return;
    Chart.register(...registerables);
    this.chart?.destroy();
    this.chart = new Chart(this.canvas().nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels(),
        datasets: [
          {
            label: 'EGP',
            data: this.values(),
            backgroundColor: ['#e9a065', '#9ec4be', '#c7d3b0', '#c88a69', '#93a997'],
            borderRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? false
          : { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => 'EGP ' + Number(ctx.raw).toLocaleString('en-US') },
          },
        },
        scales: {
          x: { ticks: { color: '#b7beaf' }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#b7beaf' }, grid: { color: '#42504466' } },
        },
      },
    });
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.chart?.destroy();
  }
}
