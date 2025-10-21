// widget-types.ts
export type ChartKind =
  | 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter';

export type EntityName = 'transactions' | 'items' | 'accounts';

export type FieldRole = 'measure' | 'dimension' | 'datetime';

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

export interface ChartConfig {
  id: string;                  // widget type id or your generic id
  chartType: ChartKind;
  entity: EntityName;
  measure: string;             // required numeric
  dimension?: string;          // optional group-by
  dateFrom?: Date | null;
  dateTo?: Date | null;
  filters?: Array<{ field: string; op: Operator; value: any }>;
}

export interface QueryResult {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}
