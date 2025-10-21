// widget-config-modal.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ChartConfig, ChartKind, EntityField, EntityName } from '../../widget-types';
import { EntityMetaService } from '../../entity-meta.service';


@Component({
  selector: 'widget-config-modal',
  templateUrl: './widget-config-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetConfigModalComponent {
  @ViewChild('dlg', { static: true }) dlg!: ModalDirective;
  @Input() chartType!: ChartKind;
  @Output() create = new EventEmitter<ChartConfig>();
  @Output() cancel = new EventEmitter<void>();

  step = 0; // 0 = choose entity & fields, 1 = filters & preview
  form!: FormGroup;

  entities: EntityName[] = [];
  fields: EntityField[] = [];
  measures: EntityField[] = [];
  dimensions: EntityField[] = [];
  filterDefs = [];

  previewData: any;

  constructor(
    private fb: FormBuilder,
    private meta: EntityMetaService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      entity: [null, Validators.required],
      measure: [null, Validators.required],
      dimension: [null],
      dateFrom: [null],
      dateTo: [null],
      filters: [[]]
    });
  }

  show(): void {
    this.entities = this.meta.getEntities();
    this.step = 0;
    this.previewData = null;
    this.dlg.show();
    this.cdr.markForCheck();
  }
  hide(): void { this.dlg.hide(); this.cancel.emit(); }

  next(): void { if (this.form.valid) { this.step = 1; this.onFiltersChanged(this.form.value.filters || []); } }
  back(): void { this.step = 0; }

  onEntityChange(): void {
    const ent = this.form.value.entity as EntityName;
    if (!ent) return;

    this.fields = this.meta.getFields(ent);
    this.measures = this.fields.filter(f => f.role === 'measure');
    this.dimensions = this.fields.filter(f => f.role !== 'measure');
    this.filterDefs = this.meta.getFilters(ent);

    // reset related controls
    this.form.patchValue({ measure: null, dimension: null, filters: [] });
    this.previewData = null;
    this.cdr.markForCheck();
  }

  onFiltersChanged(list: any[]): void {
    // keep filters on form; update preview too
    this.form.patchValue({ filters: list }, { emitEvent: false });
    this.updatePreview();
  }

  updatePreview(): void {
    const v = this.form.value;
    if (!v.entity || !v.measure) { this.previewData = null; this.cdr.markForCheck(); return; }

    const cfg: ChartConfig = {
      id: `Widgets_Generic_Chart`,       // or your specific id
      chartType: this.chartType,
      entity: v.entity,
      measure: v.measure,
      dimension: v.dimension || undefined,
      dateFrom: v.dateFrom, dateTo: v.dateTo,
      filters: (v.filters || []).map((f: any) => ({ field: f.field, op: f.op, value: f.value }))
    };

    const res = this.meta.runQuery(cfg);
    this.previewData = ['pie','doughnut','polarArea'].includes(this.chartType)
      ? { labels: res.labels, datasets: [{ data: res.datasets[0].data }] }
      : { labels: res.labels, datasets: res.datasets };

    this.cdr.markForCheck();
  }

  submit(): void {
    const v = this.form.value;
    const cfg: ChartConfig = {
      id: `Widgets_Generic_Chart`,
      chartType: this.chartType,
      entity: v.entity,
      measure: v.measure,
      dimension: v.dimension || undefined,
      dateFrom: v.dateFrom, dateTo: v.dateTo,
      filters: (v.filters || []).map((f: any) => ({ field: f.field, op: f.op, value: f.value }))
    };
    this.create.emit(cfg);
    this.dlg.hide();
  }
}
