// widget-config-modal.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ChartConfig, ChartKind, EntityField, EntityName } from '../../../../shared/common/customizable-dashboard/widget-types';
import { EntityMetaService } from '../../../../shared/common/customizable-dashboard/entity-meta.service';

type SelectOption<T = any> = { label: string; value: T };

@Component({
  selector: 'widget-config-modal',
  styleUrls: ['widget-config-modal.component.scss'],
  templateUrl: './widget-config-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetConfigModalComponent {
  @ViewChild('dlg', { static: true }) dlg!: ModalDirective;
  @Input() chartType!: ChartKind;
  @Output() create = new EventEmitter<ChartConfig>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  entities: EntityName[] = [];
  fields: EntityField[] = [];
  measures: EntityField[] = [];
  dimensions: EntityField[] = [];
  timeFields : EntityField[] = [];
  
  filterDefs = [];

  dimensionValueOptions: string[] = [];
  barXValueOptions: string[] = [];

  // Calculation options
  calcAggOptions: SelectOption[] = [
    { label: 'Count', value: 'count' },
    { label: 'Sum',   value: 'sum' },
    { label: 'Avg',   value: 'avg' },
    { label: 'Min',   value: 'min' },
    { label: 'Max',   value: 'max' },
  ];

  calcFormatOptions: SelectOption[] = [
    { label: 'Number',   value: 'number' },
    { label: 'Currency', value: 'currency' },
    { label: 'Percent',  value: 'percent' },
  ];

activeTab: 'settings' | 'data' = 'settings';
  previewData: any = null;
previewConfig: any = null;
previewChartData: { labels: any[]; datasets: { label?: string; data: number[] }[] } | null = null;
previewCalcValue: number | null = null;

  constructor(
    private fb: FormBuilder,
    private meta: EntityMetaService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      entity: [null, Validators.required],

      // normal charts
      measure: [null],
      dimension: [null],
      dimensionValues: [[]],

      // filters
      dateFrom: [null],
      dateTo: [null],
      filters: [[]],

      lineTimeField: [null],
      timePreset: ['thisMonth'], // ClickUp-like default
      bucket: ['week'],
      lineAgg: ['count'],
      lineField: [null],
      lineSeriesField: [null],
      smooth: [true],
      stackedArea: [false],
      showLegend: [true],

      // bar config
      barX: [null],
      barY: [[]],
      barXValues: [[]],
      barStacked: [true],
      axisTickColor: ['#9aa0a6'],
      gridColor: ['#e0e0e0'],

      // calculation config
      calcAgg: ['count'],
      calcField: [null],
      calcLabel: [null],
      calcFormat: ['number'],
    });

    // default validators based on initial chartType (if set later, setKind handles it)
  }
  timePresetOptions = [
    { label: 'Last 7 days', value: 'last7Days' },
    { label: 'Last 30 days', value: 'last30Days' },
    { label: 'Last 90 days', value: 'last90Days' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'Custom', value: 'custom' },
  ];
  // ngOnChanges(){
  //   this.form.valueChanges.subscribe(() => {
  //     this.updatePreview();
  //   });
  // }
  ngOnInit(){
    this.form.valueChanges.subscribe(() => {
      this.updatePreview();
    });
  }

  // show(kind?: ChartKind): void {
  //   this.entities = this.meta.getEntities();
  //   if (kind) this.setKind(kind);

  //   this.form.reset({
  //     entity: null,
  //     measure: null,
  //     dimension: null,
  //     dimensionValues: [],
  //     dateFrom: null,
  //     dateTo: null,
  //     filters: [],

  //     barX: null,
  //     barY: [],
  //     barXValues: [],
  //     barStacked: true,
  //     axisTickColor: '#9aa0a6',
  //     gridColor: '#e0e0e0',

  //     calcAgg: 'count',
  //     calcField: null,
  //     calcLabel: null,
  //     calcFormat: 'number',
  //   }, { emitEvent: false });

  //   this.dlg.show();
  //   setTimeout(() => {
  //     window.dispatchEvent(new Event('resize')); // ✅ يخلي echarts يرسم
  //   }, 0);
  //   this.updatePreview();
  //   this.cdr.markForCheck();
  // }


editMode = true;
@Input() mode: 'create' | 'edit' | 'view' = 'create';

get isEditMode(): boolean { return this.mode === 'edit'; }
get isCreateMode(): boolean { return this.mode === 'create'; }
get isViewMode(): boolean { return this.mode === 'view'; }
show(existingConfig?: ChartConfig,mode: 'create' | 'edit' | 'view' = 'create') : void {
  this.mode = mode;
  this.entities = this.meta.getEntities();

 

  // لو Edit existing widget
  if (existingConfig) {
    this.chartType = existingConfig.chartType;
    this.form.patchValue(this.mapConfigToForm(existingConfig), { emitEvent: false });
    this.onEntityChange();
    this.updatePreview();
  } else {
    this.resetFormDefaults();
  }

  this.dlg.show();
  setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  this.cdr.markForCheck();
}

private resetFormDefaults() {
  this.form.reset({
    entity: null,
    measure: null,
    dimension: null,
    dimensionValues: [],
    filters: [],
    dateFrom: null,
    dateTo: null,

    // line
    lineTimeField: null,
    timePreset: 'thisMonth',
    bucket: 'week',
    lineAgg: 'count',
    lineField: null,
    lineSeriesField: null,

    // bar
    barX: null,
    barY: null,
    barStacked: true,

    // calc
    calcAgg: 'count',
    calcField: null,
    calcLabel: null,
    calcFormat: 'number',
  }, { emitEvent: false });
}

private mapConfigToForm(cfg: ChartConfig): any {
  const base: any = {
    entity: cfg.entity,
    filters: cfg.filters ?? [],
    dateFrom: cfg.time?.range?.from ?? null,
    dateTo: cfg.time?.range?.to ?? null,
  };

  if (cfg.chartType === 'calculation') {
    return {
      ...base,
      calcAgg: cfg.calculation?.agg ?? 'count',
      calcField: cfg.calculation?.field ?? null,
      calcLabel: cfg.calculation?.label ?? null,
      calcFormat: cfg.calculation?.format ?? 'number',
    };
  }

  if (cfg.chartType === 'bar') {
    return {
      ...base,
      barX: cfg.bar?.x ?? null,
      barY: cfg.bar?.y ?? null,
      barStacked: !!cfg.bar?.stacked
    };
  }

  if (cfg.chartType === 'line') {
    return {
      ...base,
      lineTimeField: cfg.line?.timeField ?? null,
      lineAgg: cfg.line?.agg ?? 'count',
      lineField: cfg.line?.field ?? null,
      lineSeriesField: cfg.line?.seriesField ?? null,
      bucket: cfg.line?.bucket ?? 'week',
      timePreset: cfg.time?.range?.preset ?? 'thisMonth'
    };
  }

  return {
    ...base,
    measure: cfg.measure ?? null,
    dimension: cfg.dimension ?? null,
    dimensionValues: cfg.dimensionValues ?? []
  };
}

  hide(): void {
    this.dlg.hide();
    this.cancel.emit();
  }

  setKind(kind: ChartKind): void {
    this.chartType = kind;
    this.applyValidatorsForKind();
    this.cdr.markForCheck();
  }

  onEntityChange(): void {
    const ent = this.form.value.entity as EntityName;
    if (!ent) return;

    this.fields = this.meta.getFields(ent);
    this.measures = this.fields.filter(f => f.role === 'measure');
    this.dimensions = this.fields.filter(f => f.role !== 'measure');
    this.timeFields = this.fields.filter(f => f.role === 'datetime');
    this.filterDefs = this.meta.getFilters(ent);

    // reset dependent controls
    this.form.patchValue({
      measure: null,
      dimension: null,
      dimensionValues: [],
      filters: [],
      barX: null,
      barY: [],
      barXValues: [],
      calcField: null,
    }, { emitEvent: false });

    this.dimensionValueOptions = [];
    this.barXValueOptions = [];

    // calc field may be required depending on agg
    this.onCalcAggChange();
    this.updatePreview(); 
    this.cdr.markForCheck();
  }

  onDimensionChange(): void {
    // if you later implement distinct values, refill options here
    this.form.patchValue({ dimensionValues: [] }, { emitEvent: false });
    this.updatePreview();  
    this.cdr.markForCheck();
  }

  onBarXChange(): void {
    // if you later implement distinct values, refill options here
    this.form.patchValue({ barXValues: [] }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  onFiltersChanged(list: any[]): void {
    this.form.patchValue({ filters: list }, { emitEvent: false });
    this.updatePreview();  
    this.cdr.markForCheck();
  }

  // ========= CALC HELPERS =========

  requiresCalcField(agg: string): boolean {
    return agg !== 'count';
  }

  onCalcAggChange(): void {
    const agg = this.form.value.calcAgg as string;

    const calcFieldCtrl = this.form.get('calcField');
    if (!calcFieldCtrl) return;

    if (this.chartType === 'calculation' && this.requiresCalcField(agg)) {
      calcFieldCtrl.setValidators([Validators.required]);
    } else {
      calcFieldCtrl.clearValidators();
      // count doesn't need a field
      this.form.patchValue({ calcField: null }, { emitEvent: false });
    }

    calcFieldCtrl.updateValueAndValidity({ emitEvent: false });
    this.updatePreview();  
    this.cdr.markForCheck();
  }

  // ========= VALIDATION BY KIND =========

  private applyValidatorsForKind(): void {
    const measureCtrl = this.form.get('measure');
    const barXCtrl = this.form.get('barX');
    const barYCtrl = this.form.get('barY');
    const calcAggCtrl = this.form.get('calcAgg');
    const calcFieldCtrl = this.form.get('calcField');

    // clear all first
    measureCtrl?.clearValidators();
    barXCtrl?.clearValidators();
    barYCtrl?.clearValidators();
    calcAggCtrl?.clearValidators();
    calcFieldCtrl?.clearValidators();

    if (this.chartType === 'bar') {
      barXCtrl?.setValidators([Validators.required]);
      barYCtrl?.setValidators([Validators.required]);
    } else if (this.chartType === 'calculation') {
      calcAggCtrl?.setValidators([Validators.required]);
      // calcField depends on agg (handled by onCalcAggChange)
      // also ensure measure isn't required
    } else {
      // normal charts
      measureCtrl?.setValidators([Validators.required]);
    }

    measureCtrl?.updateValueAndValidity({ emitEvent: false });
    barXCtrl?.updateValueAndValidity({ emitEvent: false });
    barYCtrl?.updateValueAndValidity({ emitEvent: false });
    calcAggCtrl?.updateValueAndValidity({ emitEvent: false });
    calcFieldCtrl?.updateValueAndValidity({ emitEvent: false });

    // also sync calc field requirement if needed
    this.onCalcAggChange();
  }

  canCreate(): boolean {
    const v = this.form.value;

    if (!v.entity) return false;

    if (this.chartType === 'bar') {
      return true
      // return !!v.barX && Array.isArray(v.barY) && v.barY.length > 0;
    }

    if (this.chartType === 'calculation') {
      if (!v.calcAgg) return false;
      if (this.requiresCalcField(v.calcAgg)) return !!v.calcField;
      return true;
    }

    if (this.chartType === 'line') {
      if (!v.lineTimeField) return false;
      if (!v.lineAgg) return false;
      if (v.lineAgg !== 'count' && !v.lineField) return false;
    
      // preset custom needs dates
      if (v.timePreset === 'custom' && (!v.dateFrom || !v.dateTo)) return false;
    
      return true;
    }

    // normal charts
    return !!v.measure;
  }

  submit(): void {
    if (!this.canCreate()) return;

    const v = this.form.value;

    const cfg: ChartConfig = {
      id: `Widgets_Generic_${this.chartType.toUpperCase()}`,
      chartType: this.chartType,
      entity: v.entity,

      dateFrom: v.dateFrom,
      dateTo: v.dateTo,
      filters: (v.filters || []).map((f: any) => ({ field: f.field, op: f.op, value: f.value })),
    };

    if (this.chartType === 'bar') {
      // store bar config in config object (extend ChartConfig if you want strongly typed bar config)
      cfg.dimension = v.barX;          // X axis dimension
      cfg.measure = undefined;         // not used
      // You can also add cfg['bar'] = { x: v.barX, y: v.barY, ... } if you extend types
      (cfg as any).bar = { x: v.barX, y: v.barY, xValues: v.barXValues || [], stacked: v.barStacked };
    } else if (this.chartType === 'calculation') {
      cfg.calculation = {
        agg: v.calcAgg,
        field: this.requiresCalcField(v.calcAgg) ? v.calcField : null,
        label: v.calcLabel || null,
        format: v.calcFormat || 'number'
      };
    } else {
      cfg.measure = v.measure;
      cfg.dimension = v.dimension || undefined;
      // optionally include v.dimensionValues if you want:
      (cfg as any).dimensionValues = v.dimensionValues || [];
    }

    this.create.emit(cfg);
    this.dlg.hide();
  }


  updatePreview(): void {
    const v = this.form.value;
  
    // reset
    this.previewChartData = null;
    this.previewCalcValue = null;
    this.previewConfig = null;
  
    if (!v.entity) {
      this.cdr.markForCheck();
      return;
    }
  
    const baseCfg: any = {
      id: `Widgets_Generic_${String(this.chartType).toUpperCase()}`,
      chartType: this.chartType,
      entity: v.entity,
      dateFrom: v.dateFrom,
      dateTo: v.dateTo,
      filters: (v.filters || []).map((f: any) => ({ field: f.field, op: f.op, value: f.value })),
    };
  
    // ---- CALCULATION ----
    if (this.chartType === 'calculation') {
      const agg = v.calcAgg;
      const needsField = this.requiresCalcField(agg);
  
      if (!agg || (needsField && !v.calcField)) {
        this.previewConfig = baseCfg;
        this.cdr.markForCheck();
        return;
      }
  
      baseCfg.calculation = {
        agg,
        field: needsField ? v.calcField : null,
        label: v.calcLabel || null,
        format: v.calcFormat || 'number',
      };
  
      const res = this.meta.runQuery(baseCfg); // should return { value }
      this.previewCalcValue = Number(res?.value ?? 0);
      this.previewConfig = baseCfg;
  
      this.cdr.markForCheck();
      return;
    }
  
    // ---- BAR ----
    if (this.chartType === 'bar') {
      if (!v.barX || !Array.isArray(v.barY) || v.barY.length === 0) {
        this.previewConfig = baseCfg;
        this.cdr.markForCheck();
        return;
      }
  
      baseCfg.bar = { x: v.barX, y: v.barY, stacked: v.barStacked };
  
      const res = this.meta.runQuery(baseCfg); // { labels, datasets }
      this.previewChartData = { labels: res.labels, datasets: res.datasets };
      this.previewConfig = baseCfg;
  
      this.cdr.markForCheck();
      return;
    }
  
    // ---- NORMAL CHARTS ----
    if (!v.measure) {
      this.previewConfig = baseCfg;
      this.cdr.markForCheck();
      return;
    }
  
    baseCfg.measure = v.measure;
    baseCfg.dimension = v.dimension || undefined;
  
    const res = this.meta.runQuery(baseCfg);
    this.previewChartData = { labels: res.labels, datasets: res.datasets };
    this.previewConfig = baseCfg;
  
    this.cdr.markForCheck();
  }

  onLineAggChange(): void {
    const agg = this.form.value.lineAgg;
    if (agg === 'count') {
      this.form.patchValue({ lineField: null }, { emitEvent: false });
      this.form.get('lineField')?.clearValidators();
    } else {
      this.form.get('lineField')?.setValidators([Validators.required]);
    }
    this.form.get('lineField')?.updateValueAndValidity({ emitEvent: false });
    this.updatePreview();
  }

  bucketOptions = [
    { label: 'Hour', value: 'hour' },
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' },
  ];


  get activeTabIndex(): number {
    return this.activeTab === 'data' ? 1 : 0;
  }
  set activeTabIndex(i: number) {
    this.activeTab = i === 1 ? 'data' : 'settings';
  }

  rawRows: any[] = [];

refreshPreview(): void {
  this.updatePreview();
}
}