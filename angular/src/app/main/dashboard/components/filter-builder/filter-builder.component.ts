// filter-builder.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EntityField, FilterDef } from '../../../../shared/common/customizable-dashboard/widget-types';


@Component({
  selector: 'app-filter-builder',
  templateUrl: './filter-builder.component.html',
  styleUrls: ['./filter-builder.component.scss'],
})
export class FilterBuilderComponent implements OnChanges {
  @Input() fields: EntityField[] = [];
  @Input() filterDefs: FilterDef[] = [];
  @Output() changed = new EventEmitter<any[]>();

  form = this.fb.group({ filters: this.fb.array<FormGroup>([]) });

  get filters(): FormArray { return this.form.get('filters') as FormArray; }

  constructor(private fb: FormBuilder) {
    this.form.valueChanges.subscribe(v => this.changed.emit(v.filters || []));
  }

  ngOnChanges(_: SimpleChanges): void {
    // reset filters when entity changes
    this.filters.clear();
  }

  add(): void {
    this.filters.push(this.fb.group({ field: null, op: null, value: null }));
  }
  remove(i: number): void { this.filters.removeAt(i); }

  onFieldChange(i: number): void {
    const g = this.filters.at(i) as FormGroup;
    g.patchValue({ op: null, value: null }, { emitEvent: false });
  }

  fieldTypeAt(i: number): 'number'|'date'|'string' {
    const f = this.filters.at(i).value.field;
    const meta = this.fields.find(x => x.name === f);
    return (meta?.type || 'string') as any;
  }

  operatorOptions(i: number) {
    const f = this.filters.at(i).value.field;
    const defs = this.filterDefs.find(d => d.field === f);
    const ops = defs?.operators || [];
    return ops.map(o => ({ label: o, value: o }));
  }
}
