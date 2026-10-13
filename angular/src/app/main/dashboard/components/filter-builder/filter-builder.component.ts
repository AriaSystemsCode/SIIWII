
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FilterBuilderCondition,
  FilterBuilderField,
  FilterBuilderRule,
  FilterMatchMode
} from '../../models/dashboard.model';

@Component({
  selector: 'app-filter-builder',
  templateUrl: './filter-builder.component.html',
  styleUrls: ['./filter-builder.component.scss']
})
export class FilterBuilderComponent implements OnChanges {

  @Input() fields: FilterBuilderField[] = [];
  @Input() conditions: FilterBuilderCondition[] = [];
  @Input() matchMode: FilterMatchMode = 'all';

  @Output() apply = new EventEmitter<FilterBuilderCondition[]>();
  @Output() cancel = new EventEmitter<void>();
  @Output() conditionsChange = new EventEmitter<FilterBuilderCondition[]>();
  @Output() matchModeChange = new EventEmitter<FilterMatchMode>();

  rules: FilterBuilderRule[] = [];

  readonly matchOptions = [
    { label: 'all', value: 'all' },
    { label: 'any', value: 'any' }
  ];

  readonly booleanOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  readonly comparisonOperators = [
    { label: 'Equal', value: 'eq' },
    { label: 'Not equal', value: 'neq' },
    { label: 'Less than', value: 'lt' },
    { label: 'Less than or equal', value: 'lte' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Greater than or equal', value: 'gte' }
  ];

  readonly textOperators = [
    { label: 'Equal', value: 'eq' },
    { label: 'Not equal', value: 'neq' },
    { label: 'Contains', value: 'contains' },
    { label: 'Does not contain', value: 'notcontains' },
    { label: 'Starts with', value: 'startswith' },
    { label: 'Ends with', value: 'endswith' }
  ];

  readonly booleanOperators = [
    { label: 'Equal', value: 'eq' },
    { label: 'Not equal', value: 'neq' }
  ];



  readonly dateOperators = [
    { label: 'Is in', value: 'in' },
    { label: 'Is not in', value: 'notin' },
    { label: 'Equal', value: 'eq' },
    { label: 'Not equal', value: 'neq' },
    { label: 'Before', value: 'lt' },
    { label: 'Before or equal', value: 'lte' },
    { label: 'After', value: 'gt' },
    { label: 'After or equal', value: 'gte' }
  ];

  readonly datePeriodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Month to date', value: 'monthToDate' },
    { label: 'Last month', value: 'lastMonth' },
    { label: 'Year to date', value: 'yearToDate' },
    { label: 'Last 365 days', value: 'last365days' },
    { label: 'Date range', value: 'dateRange' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conditions'] || changes['fields']) {
      this.rules = (this.conditions || []).map(condition => ({
        field: condition.field,
        operator: condition.operator || 'eq',
        value: this.restoreValue(condition.field, condition.value)
      }));
    }
  }

  addRule(): void {
    this.rules.push(this.createRule());
  }

  addRuleAfter(index: number): void {
    this.rules.splice(index + 1, 0, this.createRule());
  }

  removeRule(index: number): void {
    this.rules.splice(index, 1);
  }

  private createRule(): FilterBuilderRule {
    return {
      field: '',
      operator: 'eq',
      value: null
    };
  }

  onFieldChange(rule: FilterBuilderRule): void {
    rule.operator = 'eq';
    rule.value = null;
  }

  onOperatorChange(rule: FilterBuilderRule): void {
    rule.value = null;
  }

  getField(rule: FilterBuilderRule): FilterBuilderField | undefined {
    return this.fields.find(field => field.name === rule.field);
  }

  getType(rule: FilterBuilderRule): string {
    const field = this.getField(rule);

    const type = (field?.dataType || '')
      .trim()
      .toLowerCase();

    if (
      type.startsWith('date') ||
      type.includes('datetime') ||
      type.includes('timestamp')
    ) {
      return 'date';
    }

    if (
      type.startsWith('integer') ||
      type.startsWith('numeric') ||
      type.startsWith('decimal') ||
      type.startsWith('number') ||
      type.startsWith('float') ||
      type.startsWith('double') ||
      type.includes('currency')
    ) {
      return 'number';
    }

    if (
      type.startsWith('boolean') ||
      type.startsWith('bool') ||
      type.startsWith('bit')
    ) {
      return 'boolean';
    }

    if (
      type.startsWith('list') ||
      type.includes('dropdown')
    ) {
      return 'list';
    }

    return 'string';
  }

  getOperators(rule: FilterBuilderRule): Array<{
    label: string;
    value: string;
  }> {
    const type = this.getType(rule);

    if (type === 'boolean' || type === 'list') {
      return this.booleanOperators;
    }

    if (type === 'date') {
      return this.dateOperators;
    }

    if (type === 'number') {
      return this.comparisonOperators;
    }

    return this.textOperators;
  }

  hasValidEntries(rule: FilterBuilderRule): boolean {
    return !!this.getField(rule)?.options?.length;
  }

  private restoreValue(fieldName: string, value: any): any {
    if (value === null || value === undefined || value === '') {
      return value;
    }

    const rule: FilterBuilderRule = {
      field: fieldName,
      operator: 'eq',
      value
    };

    if (this.getType(rule) === 'date') {
      const date = value instanceof Date ? value : new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return value;
  }

  isValid(rule: FilterBuilderRule): boolean {
    if (!rule.field || !rule.operator) {
      return false;
    }

    const allowedOperators = this.getOperators(rule)
      .map(operator => operator.value);

    if (!allowedOperators.includes(rule.operator)) {
      return false;
    }
    if (this.isDatePeriodOperator(rule)) {
      return this.getDateRange(rule) !== null;
    }
    if (
      rule.value === null ||
      rule.value === undefined ||
      rule.value === ''
    ) {
      return false;
    }

    if (this.getType(rule) === 'number') {
      return Number.isFinite(Number(rule.value));
    }

    if (this.getType(rule) === 'date') {
      const date = rule.value instanceof Date
        ? rule.value
        : new Date(rule.value);

      return !isNaN(date.getTime());
    }

    return true;
  }

  get canApply(): boolean {
    return this.rules.every(rule => this.isValid(rule));
  }

  private formatValue(rule: FilterBuilderRule): any {
    if (this.getType(rule) === 'date') {
      const date = rule.value instanceof Date
        ? rule.value
        : new Date(rule.value);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    if (this.getType(rule) === 'number') {
      return Number(rule.value);
    }

    return rule.value;
  }

  buildConditions(): FilterBuilderCondition[] {
    const conditions: FilterBuilderCondition[] = [];

    for (const rule of this.rules) {
      if (!this.isValid(rule)) {
        continue;
      }

      if (this.isDatePeriodOperator(rule)) {
        const range = this.getDateRange(rule);

        if (!range) {
          continue;
        }

        if (rule.operator === 'in') {
          conditions.push(
            {
              field: rule.field,
              operator: 'gte',
              value: this.formatDateValue(range[0])
            },
            {
              field: rule.field,
              operator: 'lte',
              value: this.formatDateValue(range[1])
            }
          );
        } else {
          conditions.push(
            {
              field: rule.field,
              operator: 'lt',
              value: this.formatDateValue(range[0])
            },
            {
              field: rule.field,
              operator: 'gt',
              value: this.formatDateValue(range[1])
            }
          );
        }

        continue;
      }

      conditions.push({
        field: rule.field,
        operator: rule.operator,
        value: this.formatValue(rule)
      });
    }

    return conditions;
  }
  isDatePeriodOperator(rule: FilterBuilderRule): boolean {
    return this.getType(rule) === 'date' &&
      ['in', 'notin'].includes(rule.operator);
  }

  onDatePeriodChange(rule: FilterBuilderRule): void {
    rule.value = null;
    rule.dateRange = [];
  }

  private startOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    );
  }

  private endOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23, 59, 59, 999
    );
  }

  getDateRange(rule: FilterBuilderRule): Date[] | null {
    const today = this.startOfDay(new Date());
    const end = this.endOfDay(new Date());

    let start: Date;

    switch (rule.datePeriod) {
      case 'today':
        return [today, end];

      case 'last7days':
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        return [start, end];

      case 'last30days':
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        return [start, end];

      case 'monthToDate':
        return [
          new Date(today.getFullYear(), today.getMonth(), 1),
          end
        ];

      case 'lastMonth':
        return [
          new Date(today.getFullYear(), today.getMonth() - 1, 1),
          this.endOfDay(
            new Date(today.getFullYear(), today.getMonth(), 0)
          )
        ];

      case 'yearToDate':
        return [
          new Date(today.getFullYear(), 0, 1),
          end
        ];

      case 'last365days':
        start = new Date(today);
        start.setDate(start.getDate() - 364);
        return [start, end];

      case 'dateRange':
        return rule.dateRange?.length === 2 &&
          rule.dateRange[0] &&
          rule.dateRange[1]
          ? [
            this.startOfDay(rule.dateRange[0]),
            this.endOfDay(rule.dateRange[1])
          ]
          : null;

      default:
        return null;
    }
  }

  formatDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }



  applyFilters(): void {
    if (!this.canApply) {
      return;
    }

    const conditions = this.buildConditions();

    this.conditionsChange.emit(conditions);
    this.matchModeChange.emit(this.matchMode);
    this.apply.emit(conditions);
  }

  clearFilters(): void {
    this.rules = [];
  }

  close(): void {
    this.cancel.emit();
  }
}
