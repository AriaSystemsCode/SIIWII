import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output
} from '@angular/core';
import { finalize } from 'rxjs/operators';

import { DynamicApiDispatcherService } from '@shared/dynamicApiDispatcherService ';
import {
    FilterBuilderCondition,
    FilterBuilderField,
    FilterBuilderRule,
    FilterConditionGroup,
    FilterConditionNode,
    FilterConditionRule,
    FilterMatchMode
} from '../../models/dashboard.model';

type SelectOption = { label: string; value: any };

interface LookupState {
    items: SelectOption[];
    totalCount: number;
    isLoading: boolean;
    isLoaded: boolean;
}

@Component({
    selector: 'app-filter-builder',
    templateUrl: './filter-builder.component.html',
    styleUrls: ['./filter-builder.component.scss']
})
export class FilterBuilderComponent implements OnChanges {

    // ---- Inputs / outputs ----
    @Input() fields: FilterBuilderField[] = [];
    @Input() conditions: FilterBuilderCondition[] = [];   // flat conditions, used when there is no tree
    @Input() matchMode: FilterMatchMode = 'all';
    @Input() filterTree: FilterConditionGroup | null = null;

    @Output() applyTree = new EventEmitter<FilterConditionGroup>();
    @Output() matchModeChange = new EventEmitter<FilterMatchMode>();
    @Output() cancel = new EventEmitter<void>();

    /** The filter being edited. Nested groups live inside `children`. */
    rootGroup: FilterConditionGroup = { type: 'group', matchMode: 'all', children: [] };

    // ---- Dropdown options ----
    readonly matchOptions: SelectOption[] = [
        { label: 'all', value: 'all' },
        { label: 'any', value: 'any' }
    ];

    readonly booleanOptions: SelectOption[] = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    private readonly comparisonOperators: SelectOption[] = [
        { label: 'Equal', value: 'eq' },
        { label: 'Not equal', value: 'neq' },
        { label: 'Less than', value: 'lt' },
        { label: 'Less than or equal', value: 'lte' },
        { label: 'Greater than', value: 'gt' },
        { label: 'Greater than or equal', value: 'gte' }
    ];

    private readonly textOperators: SelectOption[] = [
        { label: 'Equal', value: 'eq' },
        { label: 'Not equal', value: 'neq' },
        { label: 'Contains', value: 'contains' },
        { label: 'Does not contain', value: 'notcontains' },
        { label: 'Starts with', value: 'startswith' },
        { label: 'Ends with', value: 'endswith' }
    ];

    private readonly equalityOperators: SelectOption[] = [
        { label: 'Equal', value: 'eq' },
        { label: 'Not equal', value: 'neq' }
    ];

    private readonly dateOperators: SelectOption[] = [
        { label: 'Is in', value: 'in' },
        { label: 'Is not in', value: 'notin' },
        { label: 'Equal', value: 'eq' },
        { label: 'Not equal', value: 'neq' },
        { label: 'Before', value: 'lt' },
        { label: 'Before or equal', value: 'lte' },
        { label: 'After', value: 'gt' },
        { label: 'After or equal', value: 'gte' }
    ];

    private readonly nullOperators: SelectOption[] = [
        { label: 'Is Set', value: 'isnotnull' },
        { label: 'Is Not Set', value: 'isnull' }
    ];

    readonly datePeriodOptions: SelectOption[] = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: 'last7days' },
        { label: 'Last 30 days', value: 'last30days' },
        { label: 'Month to date', value: 'monthToDate' },
        { label: 'Last month', value: 'lastMonth' },
        { label: 'Year to date', value: 'yearToDate' },
        { label: 'Last 365 days', value: 'last365days' },
        { label: 'Date range', value: 'dateRange' }
    ];

    // ---- Lookup fields (dropdown values loaded from an API) ----
    private readonly lookupPageSize = 10;
    private lookups = new Map<string, LookupState>();

    // ---- Unique ids for the inputs ----
    private lastRuleId = 0;

    constructor(private dynamicApi: DynamicApiDispatcherService) { }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    ngOnChanges(): void {
        this.rootGroup = this.filterTree
            ? this.restoreGroup(this.filterTree)
            : {
                type: 'group',
                matchMode: this.matchMode,
                children: (this.conditions || []).map(condition => ({
                    type: 'rule' as const,
                    field: condition.field,
                    operator: condition.operator || 'eq',
                    value: this.restoreValue(condition.field, condition.value)
                }))
            };
    }

    /** Copies a saved group and turns saved date strings back into Date objects. */
    private restoreGroup(group: FilterConditionGroup): FilterConditionGroup {
        return {
            type: 'group',
            matchMode: group.matchMode,
            children: group.children.map(node => {
                if (node.type === 'group') {
                    return this.restoreGroup(node);
                }

                return {
                    ...node,
                    value: this.restoreValue(node.field, node.value),
                    dateRange: node.dateRange?.map(date => new Date(date))
                };
            })
        };
    }

    private restoreValue(fieldName: string, value: any): any {
        if (value === null || value === undefined || value === '') {
            return value;
        }

        if (this.getFieldType(fieldName) !== 'date') {
            return value;
        }

        const date = value instanceof Date ? value : new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    // =====================================================
    // ADD / REMOVE CONDITIONS AND GROUPS
    // =====================================================

    private createRule(): FilterConditionRule {
        return { type: 'rule', field: '', operator: 'eq', value: null };
    }

    addRule(group: FilterConditionGroup): void {
        group.children.push(this.createRule());
    }

    addRuleAfter(group: FilterConditionGroup, index: number): void {
        group.children.splice(index + 1, 0, this.createRule());
    }

    /** Only one nested group is allowed, directly under the root group. */
    get hasNestedGroup(): boolean {
        return this.rootGroup.children.some(node => node.type === 'group');
    }

    /** Adds a nested group that contains one empty condition. */
    addNestedGroupAfter(group: FilterConditionGroup, index: number): void {
        if (group !== this.rootGroup || this.hasNestedGroup) {
            return;
        }

        group.children.splice(index + 1, 0, {
            type: 'group',
            matchMode: 'all',
            children: [this.createRule()]
        });
    }

    removeNode(group: FilterConditionGroup, index: number): void {
        group.children.splice(index, 1);
    }

    clearFilters(): void {
        this.rootGroup.children = [];
    }

    // ---- type helpers used by the template ----

    isGroup(node: FilterConditionNode): node is FilterConditionGroup {
        return node.type === 'group';
    }

    isRule(node: FilterConditionNode): node is FilterConditionRule {
        return node.type === 'rule';
    }

    asGroup(node: FilterConditionNode): FilterConditionGroup {
        return node as FilterConditionGroup;
    }

    asRule(node: FilterConditionNode): FilterConditionRule {
        return node as FilterConditionRule;
    }

    getRuleId(rule: FilterBuilderRule): string {
        const item = rule as FilterBuilderRule & { _uiId?: string };

        if (!item._uiId) {
            item._uiId = `filter-rule-${++this.lastRuleId}`;
        }

        return item._uiId;
    }

    // =====================================================
    // FIELD / OPERATOR / VALUE TYPE
    // =====================================================

    private getField(fieldName: string): FilterBuilderField | undefined {
        return this.fields.find(field => field.name === fieldName);
    }

    /** Groups the many data type names into: date, number, boolean, list or string. */
    private getFieldType(fieldName: string): 'date' | 'number' | 'boolean' | 'list' | 'string' {
        const type = (this.getField(fieldName)?.dataType || '').trim().toLowerCase();
        const startsWith = (...prefixes: string[]) => prefixes.some(prefix => type.startsWith(prefix));

        if (startsWith('date') || type.includes('datetime') || type.includes('timestamp')) {
            return 'date';
        }

        if (startsWith('integer', 'numeric', 'decimal', 'number', 'float', 'double') || type.includes('currency')) {
            return 'number';
        }

        if (startsWith('boolean', 'bool', 'bit')) {
            return 'boolean';
        }

        if (startsWith('list') || type.includes('dropdown')) {
            return 'list';
        }

        return 'string';
    }

    getValueType(rule: FilterBuilderRule): string {
        return this.getFieldType(rule.field);
    }

    onFieldChange(rule: FilterBuilderRule): void {
        rule.operator = 'eq';
        rule.value = null;
        rule.datePeriod = undefined;
        rule.dateRange = [];

        if (this.getField(rule.field)?.dataSource) {
            this.onLookupOpen(rule);
        }
    }

    onOperatorChange(rule: FilterBuilderRule): void {
        rule.datePeriod = undefined;
        rule.dateRange = [];
        rule.value = this.isNullOperator(rule) ? rule.operator : null;
    }

    getOperators(rule: FilterBuilderRule): SelectOption[] {
        const type = this.getValueType(rule);

        let operators: SelectOption[];

        if (this.isOptionField(rule) || type === 'boolean' || type === 'list') {
            operators = this.equalityOperators;
        } else if (type === 'date') {
            operators = this.dateOperators;
        } else if (type === 'number') {
            operators = this.comparisonOperators;
        } else {
            operators = this.textOperators;
        }

        return [...operators, ...this.nullOperators];
    }

    /** "Is Set" / "Is Not Set" need no value. */
    isNullOperator(rule: FilterBuilderRule): boolean {
        return rule.operator === 'isnull' || rule.operator === 'isnotnull';
    }

    // =====================================================
    // DATE PERIODS
    // =====================================================

    /** "Is in" / "Is not in" on a date field use a period instead of one date. */
    isDatePeriodOperator(rule: FilterBuilderRule): boolean {
        return this.getValueType(rule) === 'date' && ['in', 'notin'].includes(rule.operator);
    }

    onDatePeriodChange(rule: FilterBuilderRule): void {
        rule.value = null;
        rule.dateRange = [];
    }

    private startOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    }

    private endOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }

    /** Returns [start, end] for the chosen period, or null when it is not complete. */
    private getDateRange(rule: FilterBuilderRule): Date[] | null {
        const today = this.startOfDay(new Date());
        const endOfToday = this.endOfDay(new Date());

        const daysAgo = (days: number): Date => {
            const date = new Date(today);
            date.setDate(date.getDate() - days);
            return date;
        };

        switch (rule.datePeriod) {
            case 'today':
                return [today, endOfToday];

            case 'last7days':
                return [daysAgo(6), endOfToday];

            case 'last30days':
                return [daysAgo(29), endOfToday];

            case 'monthToDate':
                return [new Date(today.getFullYear(), today.getMonth(), 1), endOfToday];

            case 'lastMonth':
                return [
                    new Date(today.getFullYear(), today.getMonth() - 1, 1),
                    this.endOfDay(new Date(today.getFullYear(), today.getMonth(), 0))
                ];

            case 'yearToDate':
                return [new Date(today.getFullYear(), 0, 1), endOfToday];

            case 'last365days':
                return [daysAgo(364), endOfToday];

            case 'dateRange': {
                const [from, to] = rule.dateRange ?? [];

                return from && to
                    ? [this.startOfDay(new Date(from)), this.endOfDay(new Date(to))]
                    : null;
            }

            default:
                return null;
        }
    }

    /** yyyy-MM-dd */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private isRuleValid(rule: FilterBuilderRule): boolean {
        if (!rule.field || !rule.operator) {
            return false;
        }

        const allowedOperators = this.getOperators(rule).map(operator => operator.value);

        if (!allowedOperators.includes(rule.operator)) {
            return false;
        }

        if (this.isNullOperator(rule)) {
            return true;
        }

        if (this.isDatePeriodOperator(rule)) {
            return this.getDateRange(rule) !== null;
        }

        if (rule.value === null || rule.value === undefined || rule.value === '') {
            return false;
        }

        const type = this.getValueType(rule);

        if (type === 'number') {
            return Number.isFinite(Number(rule.value));
        }

        if (type === 'date') {
            const date = rule.value instanceof Date ? rule.value : new Date(rule.value);
            return !isNaN(date.getTime());
        }

        return true;
    }

    private isGroupValid(group: FilterConditionGroup): boolean {
        return group.children.every(node =>
            node.type === 'group' ? this.isGroupValid(node) : this.isRuleValid(node)
        );
    }

    get canApply(): boolean {
        return this.isGroupValid(this.rootGroup);
    }

    // =====================================================
    // APPLY / CLOSE
    // =====================================================

    applyFilters(): void {
        if (!this.canApply) {
            return;
        }

        const tree = this.buildFilterTree(this.rootGroup);

        this.matchModeChange.emit(tree.matchMode);
        this.applyTree.emit(tree);
    }

    close(): void {
        this.cancel.emit();
    }

    /** Converts the edited group into the clean tree that is saved and sent to the API. */
    private buildFilterTree(group: FilterConditionGroup): FilterConditionGroup {
        const children: FilterConditionNode[] = [];

        for (const node of group.children) {
            if (node.type === 'group') {
                children.push(this.buildFilterTree(node));
                continue;
            }

            if (!this.isRuleValid(node)) {
                continue;
            }

            if (this.isNullOperator(node)) {
                children.push({ type: 'rule', field: node.field, operator: node.operator, value: node.operator });
                continue;
            }

            if (this.isDatePeriodOperator(node)) {
                const period = this.buildDatePeriodGroup(node);

                if (period) {
                    children.push(period);
                }
                continue;
            }

            children.push({
                type: 'rule',
                field: node.field,
                operator: node.operator,
                value: this.formatRuleValue(node)
            });
        }

        return { type: 'group', matchMode: group.matchMode, children };
    }

    /**
     * "is in"     -> date >= start AND date <= end
     * "is not in" -> date <  start OR  date >  end
     */
    private buildDatePeriodGroup(rule: FilterBuilderRule): FilterConditionGroup | null {
        const range = this.getDateRange(rule);

        if (!range) {
            return null;
        }

        const isIn = rule.operator === 'in';

        return {
            type: 'group',
            matchMode: isIn ? 'all' : 'any',
            children: [
                { type: 'rule', field: rule.field, operator: isIn ? 'gte' : 'lt', value: this.formatDate(range[0]) },
                { type: 'rule', field: rule.field, operator: isIn ? 'lte' : 'gt', value: this.formatDate(range[1]) }
            ]
        };
    }

    private formatRuleValue(rule: FilterBuilderRule): any {
        const type = this.getValueType(rule);

        if (type === 'date') {
            return this.formatDate(rule.value instanceof Date ? rule.value : new Date(rule.value));
        }

        if (type === 'number') {
            return Number(rule.value);
        }

        return rule.value;
    }

    // =====================================================
    // DROPDOWN VALUES (valid entries, static options, API lookups)
    // =====================================================

    /** True when the value is picked from a list instead of typed. */
    isOptionField(rule: FilterBuilderRule): boolean {
        const field = this.getField(rule.field);

        if (!field) {
            return false;
        }

        const hasValidEntries = !!field.validEntries?.trim();
        const hasDynamicApi = !!field.dataSource?.service && !!field.dataSource?.api;
        const hasStaticOptions = !!field.options?.length || !!field.paginationSetting?.list?.length;

        return field.isLookup === true || hasValidEntries || hasDynamicApi || hasStaticOptions;
    }

    private getValueOptions(rule: FilterBuilderRule): SelectOption[] {
        const field = this.getField(rule.field);

        if (!field) {
            return [];
        }

        // "a|b|c" without an API is a fixed list.
        if (field.validEntries?.trim() && !field.dataSource) {
            return field.validEntries
                .split('|')
                .map(value => value.trim())
                .filter(Boolean)
                .map(value => ({ label: value, value }));
        }

        const loaded = this.lookups.get(field.name);

        if (loaded) {
            return loaded.items;
        }

        const options = field.paginationSetting?.list?.length
            ? field.paginationSetting.list
            : field.options ?? [];

        return options.map((option: any) => ({
            label: String(option.label ?? option.value ?? ''),
            value: option.value
        }));
    }

    /** Same options, plus the current value when it has not been loaded yet (so it is still shown). */
    getValueOptionsWithSelection(rule: FilterBuilderRule): SelectOption[] {
        const options = this.getValueOptions(rule);

        if (rule.value === null || rule.value === undefined || rule.value === '') {
            return options;
        }

        const isInOptions = options.some(option => String(option.value) === String(rule.value));

        return isInOptions
            ? options
            : [{ label: String(rule.value), value: rule.value }, ...options];
    }

    isLookupLoading(rule: FilterBuilderRule): boolean {
        return !!this.lookups.get(rule.field)?.isLoading;
    }

    hasMoreLookupOptions(rule: FilterBuilderRule): boolean {
        if (!this.getField(rule.field)?.dataSource) {
            return false;
        }

        const state = this.lookups.get(rule.field);

        return !!state && !state.isLoading && state.items.length < state.totalCount;
    }

    onLookupOpen(rule: FilterBuilderRule): void {
        const field = this.getField(rule.field);

        if (!field?.dataSource) {
            return;
        }

        const state = this.lookups.get(field.name);

        if (!state?.isLoaded && !state?.isLoading) {
            this.loadLookupOptions(field, false);
        }
    }

    loadMoreLookupOptions(rule: FilterBuilderRule): void {
        const field = this.getField(rule.field);

        if (field?.dataSource) {
            this.loadLookupOptions(field, true);
        }
    }

    private loadLookupOptions(field: FilterBuilderField, append: boolean): void {
        const source = field.dataSource;

        if (!source?.service || !source?.api) {
            return;
        }

        const previous = this.lookups.get(field.name);

        if (previous?.isLoading) {
            return;
        }

        if (append && previous?.isLoaded && previous.items.length >= previous.totalCount) {
            return;
        }

        const existingItems = append ? previous?.items ?? [] : [];

        this.lookups.set(field.name, {
            items: existingItems,
            totalCount: previous?.totalCount ?? 0,
            isLoading: true,
            isLoaded: previous?.isLoaded ?? false
        });

        const serviceName = source.service.endsWith('ServiceProxy')
            ? source.service
            : `${source.service}ServiceProxy`;

        this.dynamicApi
            .dispatch(serviceName, source.api, {
                skipCount: existingItems.length,
                maxResultCount: this.lookupPageSize
            })
            .pipe(finalize(() => this.setLookupLoading(field.name, false)))
            .subscribe({
                next: (result: any) => this.onLookupLoaded(field, existingItems, result),
                error: (error: any) =>
                    console.error('[Filter Builder] Lookup loading failed:', field.name, error)
            });
    }

    private onLookupLoaded(field: FilterBuilderField, existingItems: SelectOption[], result: any): void {
        const source = field.dataSource!;
        const records: any[] = result?.items ?? result?.result?.items ?? [];

        const labelPath = source.parameter || 'name';
        const valuePath = source.valueField || 'account.id';   // same default as dynamicInputs

        const newItems: SelectOption[] = records
            .map(record => {
                const label = this.getByPath(record, labelPath);
                const value = this.getByPath(record, valuePath) ?? record.id ?? record.value;

                return { label: String(label ?? value ?? ''), value };
            })
            .filter(option => option.value !== null && option.value !== undefined);

        // keep one item per value
        const uniqueItems = new Map<string, SelectOption>();
        [...existingItems, ...newItems].forEach(item => uniqueItems.set(String(item.value), item));

        this.lookups.set(field.name, {
            items: Array.from(uniqueItems.values()),
            totalCount: Number(result?.totalCount ?? result?.result?.totalCount ?? newItems.length),
            isLoading: false,
            isLoaded: true
        });
    }

    private setLookupLoading(fieldName: string, isLoading: boolean): void {
        const state = this.lookups.get(fieldName);

        if (state) {
            this.lookups.set(fieldName, { ...state, isLoading });
        }
    }

    /** getByPath(item, 'account.id') -> item.account.id */
    private getByPath(object: any, path: string): any {
        return String(path || '')
            .split('.')
            .reduce((current, key) => current?.[key], object);
    }
}