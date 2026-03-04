// widget-types.ts
export type ChartKind =
  | 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'calculation' |'calc';

export type EntityName = 'transactions' | 'items' | 'accounts';

export type FieldRole = 'measure' | 'dimension' | 'datetime' | 'time';

export interface EntityField {
  name: string;                // e.g. "amount"
  label: string;               // e.g. "Amount"
  type: 'number'|'string'|'date';
  role: FieldRole;
}

export type Operator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'notContains' | 'in' | 'between';

export interface FilterDef {
  field: string;               // field name
  label: string;               // rendered label
  operators: Operator[];       // allowed operators
  // value widgets inferred from field type
}

// export interface ChartConfig {
//   id: string;
//   chartType: ChartKind;
//   entity: EntityName;

//   // chart fields
//   measure?: string;               // optional now (not for calculation)
//   dimension?: string;
//   dateFrom?: Date | string | null;
//   dateTo?: Date | null;
//   filters?: Array<{ field: string; op: Operator; value: any }>;

//   // calculation fields
//   calculation?: CalculationConfig;

//   time?: TimeConfig;
// }
export type Agg = 'count'|'sum'|'avg'|'min'|'max';

export interface TimeRange {

  from?: string | Date | null;
  to?: string | Date | null;
}

export interface TimeConfig {
  timezone?: string;
  bucket?: TimeBucket;
  range?: TimeRange;
}

export interface CalcConfig {
  agg: Agg;
  field?: string | null;
  label?: string | null;
  format?: 'number'|'currency'|'percent';
}

export interface BarConfig {
  x: string;            // category field
  y: string;            // measure field OR optional if count
  stacked?: boolean;
}

export interface LineConfig {
  timeField: string;    // date/datetime field
  agg: Agg;
  field?: string | null;
  seriesField?: string | null;
  bucket: TimeBucket;
}


export interface ChartConfig {
  id: string;
  chartType: ChartKind;
  entity: EntityName;

  // common
  filters?: Array<{ field: string; op: Operator; value: any }>;
  time?: TimeConfig;

  // generic charts (pie/doughnut)
  measure?: string;
  dimension?: string;

  // specialized
  calculation?: CalcConfig;
  bar?: BarConfig;
  line?: LineConfig;

  // optional extras
  dimensionValues?: any[];

    dateFrom?: Date | string | null;
  dateTo?: Date | null;

}
export type CalcAgg = 'count' | 'sum' | 'avg' | 'min' | 'max';

export interface CalculationConfig {
  agg: CalcAgg;            // count / sum / avg / ...
  field?: string | null;   // needed for sum/avg/min/max, not needed for count
  label?: string | null;   // optional display label
  format?: 'number' | 'currency' | 'percent'; // optional formatting
}
export interface QueryResult {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}


export type TimeBucket = 'hour'|'day'|'week'|'month'|'quarter'|'year';
export type TimePreset = 'last7Days'|'last30Days'|'last90Days'|'thisMonth'|'custom';

export interface TimeRange {
  preset?: TimePreset;              // quick presets
  from?: string | Date | null;      // for custom
  to?: string | Date | null;        // for custom
}

export interface TimeConfig {
  timezone?: string;                // Africa/Cairo
  bucket?: TimeBucket;              // day / month ...
  range?: TimeRange;                // preset or custom
}



