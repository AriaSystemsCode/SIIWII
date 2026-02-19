// // chart-widget-card.component.ts
// import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

// type RawRow = Record<string, any>;
// type XYMapping = {
//   xField: string;           // e.g., 'day' or 'category'
//   yFields: string[];        // e.g., ['sales', 'profit']
//   labelMap?: Record<string,string>; // optional display labels per yField
//   stacked?: boolean;        // bar-only convenience
// };

// @Component({
//   selector: 'app-chart-widget-card',
//   templateUrl: './chart-widget-card.component.html'
// })
// export class ChartWidgetCardComponent implements OnInit, OnChanges {
//   @Input() chartType: any;

//   /** pass ready Chart.js objects to render directly (labels + datasets) */
//   @Input() externalData?: any;
//   @Input() externalOptions?: any;

//   /** OR: pass raw rows + mapping for axis-based charts (bar/line/radar/scatter) */
//   @Input() rawRows?: RawRow[];
//   @Input() xyMapping?: XYMapping;

//   data: any;
//   options: any;

//   ngOnInit(): void {
//     this.build();

//   }

//   ngOnChanges(_: SimpleChanges): void {
//     this.build();

//   }

//   private build(): void {
//     // priority: explicit externalData → adapter (rawRows+xyMapping) → sample
//     if (this.externalData) {
//       this.data = this.externalData;
//     } else if (this.rawRows && this.xyMapping && this.supportsXY(this.chartType)) {
//       this.data = this.buildXYData(this.rawRows, this.xyMapping);
//     } else {
//       this.data = this.sample();
//     }

//     this.options = this.externalOptions ?? this.defaultOptions(this.chartType, this.xyMapping?.stacked);
//   }

//   private supportsXY(t: string): boolean {
//     return ['bar','line','radar','scatter'].includes((t||'').toLowerCase());
//   }

//   private buildXYData(rows: RawRow[], map: XYMapping) {
//     const labels = rows.map(r => r[map.xField]);
//     const datasets = map.yFields.map((yf, i) => {
//       const label = map.labelMap?.[yf] ?? yf;
//       const values = rows.map(r => r[yf]);
//       return { label, data: values, // you can style per dataset here if you want
//       };
//     });

//     // scatter special case (expects [{x,y}] points)
//     if ((this.chartType||'').toLowerCase() === 'scatter' && map.yFields.length === 1) {
//       return {
//         datasets: [{
//           label: map.labelMap?.[map.yFields[0]] ?? map.yFields[0],
//           data: rows.map(r => ({ x: r[map.xField], y: r[map.yFields[0]] }))
//         }]
//       };
//     }

//     return { labels, datasets };
//   }

//   private defaultOptions(type: string, stacked?: boolean) {
//     const t = (type||'').toLowerCase();
//     const base = { responsive: true, maintainAspectRatio: false };

//     if (['bar','line'].includes(t)) {
//       return {
//         ...base,
//         scales: {
//           x: { stacked: !!stacked, ticks: { autoSkip: true, maxRotation: 0 } },
//           y: { stacked: !!stacked, beginAtZero: true }
//         },
//         plugins: { legend: { display: true } }
//       };
//     }

//     if (['pie','doughnut','polararea','radar','scatter'].includes(t)) {
//       return { ...base, plugins: { legend: { display: true } } };
//     }

//     return base;
//   }

//   private sample() {
//     const labels = [' draft','open','closed','cancelled'];
//     const dataset = [12, 19, 3, 5];
//     return { labels, datasets: [{ label: 'Sample', data: dataset, fill: false }] };
//   }
// }


// chart-widget-card.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { EChartsOption, SeriesOption } from 'echarts';

@Component({ selector:'app-chart-widget-card', templateUrl:'./chart-widget-card.component.html' })
export class ChartWidgetCardComponent implements OnChanges {
  @Input() chartType: 'bar'|'line'|'pie'|'doughnut'|'scatter'|'radar' = 'line';
  @Input() externalData?: { labels: any[]; datasets: { label?: string; data: number[] }[] };
  @Input() externalOptions?: EChartsOption;
  @Input() rawRows?: Record<string, any>[];
  @Input() xyMapping?: { xField: string; yFields: string[]; labelMap?: Record<string,string>; stacked?: boolean };

  options: EChartsOption = {};

  ngOnChanges(_: SimpleChanges): void {
    this.build();
  }

  private build(): void {
    // 1) choose a {labels,datasets} source
    const chartData =
      this.externalData
      ?? (this.rawRows && this.xyMapping ? this.buildXYData(this.rawRows, this.xyMapping)
                                         : this.sample());

    // 2) adapt to ECharts options
    const base = this.toEcharts(this.chartType, chartData, this.xyMapping);
    // 3) allow overrides
    this.options = { ...base, ...(this.externalOptions || {}) };
  }

  private buildXYData(rows: Record<string, any>[], map: { xField: string; yFields: string[]; labelMap?: Record<string,string> }) {
    const labels = rows.map(r => r[map.xField]);
    const datasets = map.yFields.map(yf => ({
      label: map.labelMap?.[yf] ?? yf,
      data: rows.map(r => r[yf] ?? 0)
    }));
    return { labels, datasets };
  }

  /** 🔧 The adapter: convert Chart.js-like data → EChartsOption */
  private toEcharts(
    type: string,
    data: { labels: any[]; datasets: { label?: string; data: number[] }[] },
    map?: { stacked?: boolean }
  ): EChartsOption {
    const t = (type||'').toLowerCase();
    const labels = data?.labels ?? [];
    const datasets = data?.datasets ?? [];

    const base: EChartsOption = {
      tooltip: { trigger: t === 'pie' || t === 'doughnut' ? 'item' : 'axis' },
      legend: { top: 0 },
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    };

    if (t === 'pie' || t === 'doughnut') {
      const radius = t === 'doughnut' ? ['45%','70%'] : '65%';
      return {
        ...base,
        series: [{
          type: 'pie',
          radius,
          data: labels.map((l, i) => ({ name: String(l), value: datasets[0]?.data?.[i] ?? 0 }))
        }]
      };
    }

    if (t === 'radar') {
      return {
        ...base,
        radar: { indicator: labels.map(l => ({ name: String(l) })) },
        series: [{
          type: 'radar',
          data: datasets.map(ds => ({ name: ds.label ?? '', value: ds.data }))
        }]
      };
    }

    if (t === 'scatter') {
      // if labels are numeric x and first dataset is y, plot points:
      return {
        ...base,
        xAxis: { type: 'value' },
        yAxis: { type: 'value' },
        series: datasets.map(ds => ({
          type: 'scatter',
          name: ds.label ?? '',
          data: labels.map((x, i) => [Number(x), Number(ds.data[i] ?? 0)])
        }))
      };
    }

    // bar/line default
    const series: SeriesOption[] = datasets.map(ds => ({
      name: ds.label ?? '',
      type: t as any,                   // 'bar' | 'line'
      data: ds.data,
      stack: map?.stacked ? 'total' : undefined,
      smooth: t === 'line' ? true : undefined
    }));

    return {
      ...base,
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series
    };
  }

  /** ✅ Sample that your adapter understands */
  private sample() {
    return {
      labels: ['Draft','Open','Closed','Cancelled'],
      datasets: [{ label: 'Sample', data: [12, 19, 3, 5] }]
    };
  }
}
