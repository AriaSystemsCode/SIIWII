import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

type Column = {
  key: string;
  label: string;
};

@Component({
  selector: 'app-data-preview',
  templateUrl: './data-preview.component.html'
})
export class DataPreviewComponent implements OnChanges {

  @Input() title = 'Data';
  @Input() rows: any[] = [];
  @Input() loading = false;

  @Input() columns?: Column[];

  @Output() refresh = new EventEmitter<void>();

  columnsAuto: Column[] = [];

  get columnsFinal(): Column[] {
    return this.columns || this.columnsAuto;
  }
  ngOnChanges(_: SimpleChanges): void {

    // if no real rows, show example rows
    if (!this.rows || this.rows.length === 0) {
      this.rows = this.buildExampleRows();
    }
  
    this.buildColumns();
  }

  private buildColumns() {

    if (this.columns) return;

    if (!this.rows || !this.rows.length) {
      this.columnsAuto = [];
      return;
    }

    const first = this.rows[0];

    this.columnsAuto = Object.keys(first)
      .slice(0, 10)
      .map(k => ({
        key: k,
        label: this.humanize(k)
      }));
  }

  private humanize(key: string) {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  formatValue(value: any) {

    if (value === null || value === undefined) return '—';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (value instanceof Date) return value.toLocaleDateString();

    if (typeof value === 'object') return '[Object]';

    return value;
  }
  private buildExampleRows() {

    return [
      {
        // id: 1001,
        name: 'Sales Order #1001',
        // account: 'ACME Corp',
        // status: 'Approved',
        // amount: 1250,
        // date: '2026-03-01'
      },
      {
        // id: 1002,
        name: 'Sales Order #1002',
        // account: 'Global Trade Ltd',
        // status: 'Pending',
        // amount: 890,
        // date: '2026-03-02'
      },
      {
        // id: 1003,
        name: 'Sales Order #1003',
        // account: 'Delta Supplies',
        // status: 'Completed',
        // amount: 430,
        // date: '2026-03-03'
      }
    ];
  }
}