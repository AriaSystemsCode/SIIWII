import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { EChartsOption, SeriesOption } from 'echarts';
import { GridsterItem } from 'angular-gridster2';
@Component({ selector:'app-chart-widget-card', templateUrl:'./chart-widget-card.component.html' })
export class ChartWidgetCardComponent implements OnChanges {
  @Input() chartType: 'bar'|'line'|'pie'|'doughnut'|'scatter'|'radar'|'calculation' = 'line';

  // charts only
  @Input() externalData?: { labels: any[]; datasets: { label?: string; data: number[] }[] };

  // calculation only
  @Input() calcValue?: number;

  @Input() externalOptions?: EChartsOption;
  @Input() rawRows?: Record<string, any>[];
  @Input() xyMapping?: { xField: string; yFields: string[]; labelMap?: Record<string,string>; stacked?: boolean };

  @Input() config: any;

  options: EChartsOption = {};
  @Input() previewMode = false;
  // ngOnChanges(_: SimpleChanges): void {
  //   this.build();
  // }
    /** ✅ initial height (requested) */
    chartHeightPx = 250;

    private ro?: ResizeObserver;
    private chartInstance: any;
    @Input() grid?: GridsterItem;
  
  constructor(private host: ElementRef<HTMLElement>) {}

  // ngAfterViewInit(): void {
  //   // Observe the nearest gridster-item (real rendered height)
  //   const gridsterItemEl = this.host.nativeElement.closest('gridster-item') as HTMLElement | null;
  //   const target = gridsterItemEl ?? this.host.nativeElement;

  //   this.ro = new ResizeObserver(() => this.recalcHeight());
  //   this.ro.observe(target);

  //   // initial calc
  //   queueMicrotask(() => this.recalcHeight());
  // }
  ngAfterViewInit(): void {
    const target = this.previewMode
      ? this.host.nativeElement               // ✅ داخل المودال
      : ((this.host.nativeElement.closest('gridster-item') as HTMLElement | null) ?? this.host.nativeElement);
  
    this.ro = new ResizeObserver(() => this.recalcHeight());
    this.ro.observe(target);
  
    queueMicrotask(() => this.recalcHeight());
  }
  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  ngOnChanges(_: SimpleChanges): void {
    this.buildOptions();
  }

  onChartInit(ec: any): void {
    this.chartInstance = ec;
    // when chart first mounts, force correct size
    queueMicrotask(() => this.recalcHeight());
  }

  // private recalcHeight(): void {
  //   if (this.chartType === 'calculation') return;

  //   const gridsterItemEl = this.host.nativeElement.closest('gridster-item') as HTMLElement | null;
  //   const widgetShell = this.host.nativeElement.closest('.widget-shell') as HTMLElement | null;
  //   const headerEl = this.host.nativeElement.closest('.widget-shell')?.querySelector('.widget-head') as HTMLElement | null;

  //   // fallback chain
  //   const container = widgetShell ?? gridsterItemEl ?? this.host.nativeElement;

  //   const totalH = container?.getBoundingClientRect().height ?? 0;
  //   const headerH = headerEl?.getBoundingClientRect().height ?? 0;

  //   // your padding: widget-body has padding 10px 12px -> vertical = 20
  //   const bodyPadding = 20;

  //   // keep safe minimum
  //   const next = Math.max(160, Math.floor(totalH - headerH - bodyPadding));

  //   // if gridster not ready yet -> keep initial 250
  //   this.chartHeightPx = next > 0 ? next : 250;

  //   // resize echarts after height update
  //   if (this.chartInstance) {
  //     requestAnimationFrame(() => this.chartInstance.resize());
  //   }
  // }


  private recalcHeight(): void {
    if (this.chartType === 'calculation') return;
  
    //  Preview: fixed height
    if (this.previewMode) {
      this.chartHeightPx = 350;
      if (this.chartInstance) {
        requestAnimationFrame(() => this.chartInstance.resize());
      }
      return;
    }
  
    //  Dashboard mode: dynamic height (زي ما هو)
    const container =
      (this.host.nativeElement.closest('.widget-shell') as HTMLElement | null)
      ?? (this.host.nativeElement.closest('gridster-item') as HTMLElement | null)
      ?? this.host.nativeElement;
  
    const totalH = container?.getBoundingClientRect().height ?? 0;
  
    const headerH =
      (this.host.nativeElement.closest('.widget-shell')?.querySelector('.widget-head') as HTMLElement | null)
        ?.getBoundingClientRect().height ?? 0;
  
    const bodyPadding = 20;
  
    const next = Math.max(160, Math.floor(totalH - headerH - bodyPadding));
    this.chartHeightPx = next > 0 ? next : 250;
  
    if (this.chartInstance) {
      requestAnimationFrame(() => this.chartInstance.resize());
    }
  }
  private buildOptions(): void {
    if (this.chartType === 'calculation') {
      this.options = {};
      return;
    }


    const chartData =
      this.externalData
      ?? (this.rawRows && this.xyMapping ? this.buildXYData(this.rawRows, this.xyMapping)
                                         : this.sample());

    const base = this.toEcharts(this.chartType, chartData, this.xyMapping);
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

    // if (t === 'radar') {
    //   return {
    //     ...base,
    //     radar: { indicator: labels.map(l => ({ name: String(l) })) },
    //     series: [{
    //       type: 'radar',
    //       data: datasets.map(ds => ({ name: ds.label ?? '', value: ds.data }))
    //     }]
    //   };
    // }

    // if (t === 'scatter') {
    //   return {
    //     ...base,
    //     xAxis: { type: 'value' },
    //     yAxis: { type: 'value' },
    //     series: datasets.map(ds => ({
    //       type: 'scatter',
    //       name: ds.label ?? '',
    //       data: labels.map((x, i) => [Number(x), Number(ds.data[i] ?? 0)])
    //     }))
    //   };
    // }

    const series: SeriesOption[] = datasets.map(ds => ({
      name: ds.label ?? '',
      type: t as any,
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

  private sample() {
    return {
      labels: ['Draft','Open','Closed','Cancelled'],
      datasets: [{ label: 'Sample', data: [12, 19, 3, 5] }]
    };
  }


}