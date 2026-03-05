import { Injectable } from '@angular/core';
import { ChartConfig, EntityField, EntityName, FilterDef } from './widget-types';

type AnyRow = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class EntityMetaService {

  // ---------------------------
  // Mock data (replace later with BE)
  // ---------------------------
  private data: Record<EntityName, AnyRow[]> = {
    transactions: [
      { id: 1, amount: 1200, quantity: 5, createdAt: '2026-03-01', completedAt: '2026-03-03', status: 'Draft',  seller: 'ACME' },
      { id: 2, amount: 800,  quantity: 2, createdAt: '2026-03-02', completedAt: null,         status: 'Open',   seller: 'ACME' },
      { id: 3, amount: 430,  quantity: 1, createdAt: '2026-03-03', completedAt: '2026-03-04', status: 'Closed', seller: 'Delta' },
      { id: 4, amount: 990,  quantity: 4, createdAt: '2026-03-03', completedAt: null,         status: 'Open',   seller: 'Global' },
      { id: 5, amount: 150,  quantity: 1, createdAt: '2026-03-04', completedAt: null,         status: 'Draft',  seller: 'Delta' },
    ],
    items: [
      { id: 1, quantity: 10, category: 'Shoes' },
      { id: 2, quantity: 4,  category: 'Bags' },
      { id: 3, quantity: 7,  category: 'Shoes' },
      { id: 4, quantity: 2,  category: 'Accessories' },
    ],
    accounts: [
      { id: 1, type: 'Supplier',  'number of rows': 1 },
      { id: 2, type: 'Buyer',     'number of rows': 1 },
      { id: 3, type: 'Supplier',  'number of rows': 1 },
    ],
  };

  // ---------------------------
  // Meta
  // ---------------------------
  getEntities(): EntityName[] { return ['transactions', 'items', 'accounts']; }

  getFields(entity: EntityName): EntityField[] {
    switch (entity) {
      case 'transactions':
        return [
          { name: 'amount',      label: 'Amount',         type: 'number', role: 'measure'   },
          { name: 'quantity',    label: 'Quantity',       type: 'number', role: 'measure'   },
          { name: 'createdAt',   label: 'Created date',   type: 'date',   role: 'datetime'  },
          { name: 'completedAt', label: 'Completed date', type: 'date',   role: 'datetime'  },
          { name: 'status',      label: 'Status',         type: 'string', role: 'dimension' },
          { name: 'seller',      label: 'Seller',         type: 'string', role: 'dimension' },
        ];

      case 'items':
        return [
          { name: 'quantity', label: 'Quantity', type: 'number', role: 'measure'   },
          { name: 'category', label: 'Category', type: 'string', role: 'dimension' },
        ];

      case 'accounts':
        return [
          { name: 'number of rows', label: 'Number of rows', type: 'number', role: 'measure'   },
          { name: 'type',           label: 'Type',           type: 'string', role: 'dimension' },
        ];
    }
  }

  getFilters(entity: EntityName): FilterDef[] {
    const fields = this.getFields(entity);
    return fields.map(f => ({
      field: f.name,
      label: f.label,
      operators: f.type === 'number'
        ? ['eq','ne','gt','gte','lt','lte','between']
        : f.type === 'date'
        ? ['between','gte','lte','eq']
        : ['eq','ne','contains','notContains','in']
    }));
  }

  // ---------------------------
  // ✅ Main query
  // returns: { rows, labels, datasets } OR { value, rows }
  // ---------------------------
  runQuery(cfg: ChartConfig): any {
    const entity = cfg.entity as EntityName;
    const src = this.data[entity] ?? [];
    const rows = this.applyAllFilters(src, cfg);

    // Always return rows for Data tab
    const base = { rows };

    // CALC
    if (cfg.chartType === 'calculation') {
      const calc = (cfg as any).calculation;
      const agg = calc?.agg ?? 'count';
      const field = calc?.field;

      const value = this.aggregateValue(rows, agg, field);
      return { ...base, value };
    }

    // BAR (cfg.bar.x dimension + cfg.bar.y measure OR count)
    if (cfg.chartType === 'bar') {
      const bar = (cfg as any).bar;
      const dim = bar?.x;
      const measure = Array.isArray(bar?.y) ? bar.y[0] : bar?.y; // you sometimes store array
      const agg = measure ? 'sum' : 'count';

      const { labels, data } = this.groupAgg(rows, dim, agg, measure);
      return {
        ...base,
        labels,
        datasets: [{ label: agg === 'count' ? 'Count' : measure, data }]
      };
    }

    // LINE (if you want: dimension=series, measure=value)
    if (cfg.chartType === 'line') {
      // simplest mock: if cfg.dimension exists => group by it, else count
      const dim = (cfg as any).dimension;
      const measure = (cfg as any).measure;
      const agg = measure ? 'sum' : 'count';

      const { labels, data } = this.groupAgg(rows, dim, agg, measure);
      return {
        ...base,
        labels,
        datasets: [{ label: dim ?? 'Total', data }]
      };
    }

    // PIE / DOUGHNUT / DEFAULT
    const dim = (cfg as any).dimension;
    const measure = (cfg as any).measure;
    const agg = measure ? 'sum' : 'count';

    const { labels, data } = this.groupAgg(rows, dim, agg, measure);
    return {
      ...base,
      labels,
      datasets: [{ label: dim ?? 'Total', data }]
    };
  }

  // ---------------------------
  // Filtering helpers
  // ---------------------------
  private applyAllFilters(rows: AnyRow[], cfg: any): AnyRow[] {
    let out = [...rows];

    // 1) date range from cfg.dateFrom / cfg.dateTo (optional)
    if (cfg.dateFrom || cfg.dateTo) {
      // choose a date field if exists (you can improve based on chartType)
      const timeField = cfg.line?.timeField || cfg.lineTimeField || 'createdAt';
      out = out.filter(r => this.inDateRange(r[timeField], cfg.dateFrom, cfg.dateTo));
    }

    // 2) filter builder filters (cfg.filters)
    const filters = Array.isArray(cfg.filters) ? cfg.filters : [];
    for (const f of filters) {
      out = out.filter(r => this.matchFilter(r, f));
    }

    return out;
  }

  private matchFilter(row: AnyRow, f: any): boolean {
    const field = f.field;
    const op = f.op;
    const val = f.value;

    const left = row[field];

    if (op === 'eq') return String(left) === String(val);
    if (op === 'ne') return String(left) !== String(val);

    if (op === 'contains') return String(left ?? '').toLowerCase().includes(String(val ?? '').toLowerCase());
    if (op === 'notContains') return !String(left ?? '').toLowerCase().includes(String(val ?? '').toLowerCase());

    if (op === 'gt') return Number(left) > Number(val);
    if (op === 'gte') return Number(left) >= Number(val);
    if (op === 'lt') return Number(left) < Number(val);
    if (op === 'lte') return Number(left) <= Number(val);

    if (op === 'between') {
      const [a, b] = Array.isArray(val) ? val : [val?.from, val?.to];
      // number between
      if (typeof left === 'number') return Number(left) >= Number(a) && Number(left) <= Number(b);
      // date between
      return this.inDateRange(left, a, b);
    }

    if (op === 'in') {
      const arr = Array.isArray(val) ? val : [];
      return arr.map(String).includes(String(left));
    }

    return true;
  }

  private inDateRange(raw: any, from: any, to: any): boolean {
    if (!raw) return false;

    const d = new Date(raw).getTime();
    if (Number.isNaN(d)) return false;

    const f = from ? new Date(from).getTime() : null;
    const t = to ? new Date(to).getTime() : null;

    if (f != null && d < f) return false;
    if (t != null && d > t) return false;
    return true;
  }

  // ---------------------------
  // Aggregation helpers
  // ---------------------------
  private aggregateValue(rows: AnyRow[], agg: string, field?: string | null): number {
    if (agg === 'count') return rows.length;

    const nums = rows.map(r => Number(r[field!])).filter(n => !Number.isNaN(n));

    if (!nums.length) return 0;
    if (agg === 'sum') return nums.reduce((a, b) => a + b, 0);
    if (agg === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length;
    if (agg === 'min') return Math.min(...nums);
    if (agg === 'max') return Math.max(...nums);

    return 0;
  }

  private groupAgg(
    rows: AnyRow[],
    dim: string | undefined,
    agg: 'count' | 'sum',
    measure?: string
  ): { labels: any[]; data: number[] } {
  
    if (!dim) {
      const total =
        agg === 'count'
          ? rows.length
          : rows.reduce((s, r) => s + (Number(r[measure!]) || 0), 0);
  
      return { labels: ['Total'], data: [total] };
    }
  
    const map = new Map<string, number>();
  
    for (const r of rows) {
      const key = String(r[dim] ?? '—');
      const inc = agg === 'count' ? 1 : (Number(r[measure!]) || 0);
  
      map.set(key, (map.get(key) || 0) + inc);
    }
  
    const labels = Array.from(map.keys());
    const data = labels.map(l => map.get(l) || 0);
  
    return { labels, data };
  }
}