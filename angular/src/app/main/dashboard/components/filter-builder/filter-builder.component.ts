import {
    Component,
    EventEmitter,
    Injector,
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
    FilterMatchMode,
    LookupState,
    SelectOption
} from '../../models/dashboard.model';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-filter-builder',
    templateUrl: './filter-builder.component.html',
    styleUrls: ['./filter-builder.component.scss'],
    providers: [ExtraAttributeDataService]
})
export class FilterBuilderComponent   extends AppComponentBase implements OnChanges {

    @Input() fields: FilterBuilderField[] = [];
    @Input() conditions: FilterBuilderCondition[] = [];  
    @Input() matchMode: FilterMatchMode = 'all';
    @Input() filterTree: FilterConditionGroup | null = null;

    @Output() applyTree = new EventEmitter<FilterConditionGroup>();
    @Output() matchModeChange = new EventEmitter<FilterMatchMode>();
    @Output() cancel = new EventEmitter<void>();

    rootGroup: FilterConditionGroup = { type: 'group', matchMode: 'all', children: [] };

    private dropdownOptionsCache = new Map<string, SelectOption[]>();
    private dropdownOptionsCacheKeys = new Map<string, string>();

   readonly matchOptions: SelectOption[] = [
    { label: this.l('All'), value: 'all' },
    { label: this.l('Any'), value: 'any' }
];

readonly booleanOptions: SelectOption[] = [
    { label: this.l('Yes'), value: true },
    { label: this.l('No'), value: false }
];

private readonly comparisonOperators: SelectOption[] = [
    { label: this.l('Equal'), value: 'eq' },
    { label: this.l('NotEqual'), value: 'neq' },
    { label: this.l('LessThan'), value: 'lt' },
    { label: this.l('LessThanOrEqual'), value: 'lte' },
    { label: this.l('GreaterThan'), value: 'gt' },
    { label: this.l('GreaterThanOrEqual'), value: 'gte' }
];

private readonly textOperators: SelectOption[] = [
    { label: this.l('Equal'), value: 'eq' },
    { label: this.l('NotEqual'), value: 'neq' },
    { label: this.l('Contains'), value: 'contains' },
    { label: this.l('DoesNotContain'), value: 'notcontains' },
    { label: this.l('StartsWith'), value: 'startswith' },
    { label: this.l('EndsWith'), value: 'endswith' }
];

private readonly equalityOperators: SelectOption[] = [
    { label: this.l('Equal'), value: 'eq' },
    { label: this.l('NotEqual'), value: 'neq' }
];

private readonly dateOperators: SelectOption[] = [
    { label: this.l('IsIn'), value: 'in' },
    { label: this.l('IsNotIn'), value: 'notin' },
    { label: this.l('Equal'), value: 'eq' },
    { label: this.l('NotEqual'), value: 'neq' },
    { label: this.l('Before'), value: 'lt' },
    { label: this.l('BeforeOrEqual'), value: 'lte' },
    { label: this.l('After'), value: 'gt' },
    { label: this.l('AfterOrEqual'), value: 'gte' }
];

private readonly nullOperators: SelectOption[] = [
    { label: this.l('IsSet'), value: 'isnotnull' },
    { label: this.l('IsNotSet'), value: 'isnull' }
];

readonly datePeriodOptions: SelectOption[] = [
    { label: this.l('Today'), value: 'today' },
    { label: this.l('Last7Days'), value: 'last7days' },
    { label: this.l('Last30Days'), value: 'last30days' },
    { label: this.l('MonthToDate'), value: 'monthToDate' },
    { label: this.l('LastMonth'), value: 'lastMonth' },
    { label: this.l('YearToDate'), value: 'yearToDate' },
    { label: this.l('Last365Days'), value: 'last365days' },
    { label: this.l('DateRange'), value: 'dateRange' }
];

    // ---- Lookup fields 
    private readonly lookupPageSize = 10;
    private lookups = new Map<string, LookupState>();

    private staticVisible = new Map<string, number>();
    private lastRuleId = 0;

    constructor(
         injector: Injector,
        private dynamicApi: DynamicApiDispatcherService,
        private extraAttributeData: ExtraAttributeDataService
    ) { 
        super(injector);

    }

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

    // Load lookup options for previously saved conditions
    this.loadSavedLookupOptions(this.rootGroup);
}

private loadSavedLookupOptions(group: FilterConditionGroup): void {
    for (const node of group.children) {

        if (node.type === 'group') {
            this.loadSavedLookupOptions(node);
            continue;
        }

        const field = this.getField(node.field);

        if (!field || !this.usesApiLookup(field)) {
            continue;
        }

        const state = this.lookups.get(field.name);

        if (!state?.isLoaded && !state?.isLoading) {
            this.loadLookupOptions(field, false);
        }
    }
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

    private createRule(): FilterConditionRule {
        return { type: 'rule', field: '', operator: 'eq', value: null };
    }

    addRule(group: FilterConditionGroup): void {
        group.children.push(this.createRule());
    }

    addRuleAfter(group: FilterConditionGroup, index: number): void {
        group.children.splice(index + 1, 0, this.createRule());
    }

    get hasNestedGroup(): boolean {
        return this.rootGroup.children.some(node => node.type === 'group');
    }

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

    private getField(fieldName: string): FilterBuilderField | undefined {
        return this.fields.find(field => field.name === fieldName);
    }

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

        const field = this.getField(rule.field);
        if (!field) {
            return;
        }

        // start static lists from the first page again
        this.staticVisible.delete(field.name);

        // load the API options right away for lookup fields
        if (this.usesApiLookup(field)) {
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
    // DROPDOWN VALUES
    //
    // A field gets its dropdown values from ONE of these, checked in this order:
    //   1. validEntries                     -> "MSRP|A|B|C|D" split into options
    //   2. dataSource.service + .api        -> dynamic API
    //   3. isLookup + entityObjectTypeCode  -> getExtraAttributeLookupDataWithPaging(code, ...)
    //   4. options / paginationSetting.list -> fixed options
    // =====================================================

    private hasValidEntries(field: FilterBuilderField): boolean {
        return !!field.validEntries?.toString().trim();
    }

    private hasDynamicSource(field: FilterBuilderField): boolean {
        return !!field.dataSource?.service && !!field.dataSource?.api;
    }

    private getLookupCode(field: FilterBuilderField): string {
        return (field.entityObjectTypeCode ?? '').toString().trim();
    }

    private usesApiLookup(field: FilterBuilderField | undefined): boolean {
        if (!field) {
            return false;
        }

        const isEntityLookup = !!field.isLookup && this.getLookupCode(field) !== '';

        return this.hasDynamicSource(field) || isEntityLookup;
    }

    /** True when the value is picked from a list instead of typed. */
    isOptionField(rule: FilterBuilderRule): boolean {
        const field = this.getField(rule.field);

        if (!field) {
            return false;
        }

        const hasFixedOptions = !!field.options?.length || !!field.paginationSetting?.list?.length;

        return field.isLookup === true
            || this.hasValidEntries(field)
            || this.hasDynamicSource(field)
            || hasFixedOptions;
    }

    // ---- static options (valid entries / fixed lists) ----

    /** "MSRP|A|B|C|D" -> ['MSRP', 'A', 'B', 'C', 'D'] */
    private splitPipe(text: string): string[] {
        return text.split('|').map(part => part.trim()).filter(Boolean);
    }

    /** Builds the full static option list. Pipe-delimited text is always split into separate options. */
    private getStaticOptions(field: FilterBuilderField): SelectOption[] {
        // 1) valid entries
        if (this.hasValidEntries(field)) {
            return this.splitPipe(field.validEntries!.toString())
                .map(text => ({ label: text, value: text }));
        }

        // 2) fixed options
        const fixed: any[] = field.paginationSetting?.list?.length
            ? field.paginationSetting.list
            : (field.options ?? []);

        const result: SelectOption[] = [];

        for (const item of fixed) {
            const value = item?.value ?? item?.label ?? item;
            const label = item?.label ?? item?.value ?? item;

            if (value === null || value === undefined || value === '') {
                continue;
            }

            // the value itself may be "MSRP|A|B|C|D"
            if (typeof value === 'string' && value.includes('|')) {
                this.splitPipe(value).forEach(text => result.push({ label: text, value: text }));
            } else {
                result.push({ label: String(label).trim(), value });
            }
        }

        return result;
    }

    // ---- options shown in the dropdown ----

    private getValueOptions(rule: FilterBuilderRule): SelectOption[] {
        const field = this.getField(rule.field);

        if (!field) {
            return [];
        }

        if (this.usesApiLookup(field)) {
            return this.lookups.get(field.name)?.items ?? [];
        }

        // everything else: static options
        return this.getStaticOptions(field);
    }

    getValueOptionsWithSelection(rule: FilterBuilderRule): SelectOption[] {
    const field = this.getField(rule.field);

    if (!field) {
        return [];
    }

    let options = this.getValueOptions(rule);

    if (!this.usesApiLookup(field)) {
        const visibleCount =
            this.staticVisible.get(field.name) ?? this.lookupPageSize;

        options = options.slice(0, visibleCount);
    }

    const selectedValue = rule.value;

    const hasSelectedValue =
        selectedValue !== null &&
        selectedValue !== undefined &&
        selectedValue !== '';

    if (hasSelectedValue) {
        const selectedOption = options.find(
            option => String(option.value) === String(selectedValue)
        );

        if (selectedOption) {
            // Use the actual option value to preserve PrimeNG selection.
            // This also handles numeric/string ID differences.
            if (rule.value !== selectedOption.value) {
                rule.value = selectedOption.value;
            }
        } else {
            // Temporary fallback until the API returns the selected item.
            options = [
                {
                    label: String(selectedValue),
                    value: selectedValue
                },
                ...options
            ];
        }
    }

    const cacheKey = JSON.stringify({
        field: field.name,
        options: options.map(option => [
            option.label,
            option.value
        ])
    });

    const ruleId = this.getRuleId(rule);

    if (this.dropdownOptionsCacheKeys.get(ruleId) === cacheKey) {
        return this.dropdownOptionsCache.get(ruleId)!;
    }

    this.dropdownOptionsCacheKeys.set(ruleId, cacheKey);
    this.dropdownOptionsCache.set(ruleId, options);

    return options;
}

    // ---- loading state and "Load More" ----

    isLookupLoading(rule: FilterBuilderRule): boolean {
        return !!this.lookups.get(rule.field)?.isLoading;
    }

    hasMoreLookupOptions(rule: FilterBuilderRule): boolean {
        const field = this.getField(rule.field);

        if (!field) {
            return false;
        }

        if (this.usesApiLookup(field)) {
            const state = this.lookups.get(field.name);
            return !!state && state.isLoaded && !state.isLoading && state.items.length < state.totalCount;
        }

        // static field: more options hidden?
        const visibleCount = this.staticVisible.get(field.name) ?? this.lookupPageSize;
        return this.getStaticOptions(field).length > visibleCount;
    }

    /** Called when the dropdown opens: loads the first page for API fields (only once). */
    onLookupOpen(rule: FilterBuilderRule): void {
        const field = this.getField(rule.field);

        if (!field || !this.usesApiLookup(field)) {
            return;
        }

        const state = this.lookups.get(field.name);

        if (!state?.isLoaded && !state?.isLoading) {
            this.loadLookupOptions(field, false);
        }
    }

    loadMoreLookupOptions(rule: FilterBuilderRule): void {
        const field = this.getField(rule.field);

        if (!field) {
            return;
        }
        if (this.usesApiLookup(field)) {
            this.loadLookupOptions(field, true);
            return;
        }

        // static field: show 10 more
        const visibleCount = this.staticVisible.get(field.name) ?? this.lookupPageSize;
        this.staticVisible.set(field.name, visibleCount + this.lookupPageSize);
    }

    private loadLookupOptions(field: FilterBuilderField, append: boolean): void {
        const previous = this.lookups.get(field.name);
        if (previous?.isLoading) return;
        if (append && previous?.isLoaded && previous.items.length >= previous.totalCount) return;

        const existingItems = append ? (previous?.items ?? []) : [];
        const skipCount = existingItems.length;

        this.lookups.set(field.name, {
            items: existingItems,
            totalCount: previous?.totalCount ?? 0,
            isLoading: true,
            isLoaded: previous?.isLoaded ?? false
        });

        // ---- Lookup by entityObjectTypeCode (e.g. SHIPVIA) ----
        const code = this.getLookupCode(field);

        if (field.isLookup && code) {

            this.extraAttributeData
                .getExtraAttributeLookupDataWithPaging(code, skipCount, this.lookupPageSize)
                .pipe(finalize(() => this.setLookupLoading(field.name, false)))
                .subscribe({
                    next: (result: any) => {
                        const records: any[] = result?.items ?? result?.result?.items ?? [];

                        const newItems: SelectOption[] = records
                            .map(item => ({
                                label: String(item.label ?? item.name ?? item.description ?? item.code ?? item.value ?? item.id ?? ''),
                                value: item.value ?? item.id
                            }))
                            .filter(item => item.value !== null && item.value !== undefined);

                        // keep one item per value
                        const unique = new Map<string, SelectOption>();
                        [...existingItems, ...newItems].forEach(item => unique.set(String(item.value), item));

                        this.lookups.set(field.name, {
                            items: [...unique.values()],
                            totalCount: Number(
                                result?.totalCount ?? result?.result?.totalCount ?? (skipCount + newItems.length)
                            ),
                            isLoading: false,
                            isLoaded: true
                        });
                    },
                    error: error => console.error('[Filter Builder] Entity lookup failed:', code, error)
                });

            return;
        }

        // ---- Lookup by dynamic API (dataSource.service / dataSource.api) ----
        if (!this.hasDynamicSource(field)) {
            this.lookups.delete(field.name);
            return;
        }

        const source = field.dataSource!;
        const serviceName = source.service.endsWith('ServiceProxy')
            ? source.service
            : `${source.service}ServiceProxy`;

        this.dynamicApi.dispatch(serviceName, source.api, {
            skipCount,
            maxResultCount: this.lookupPageSize
        }).pipe(finalize(() => this.setLookupLoading(field.name, false)))
            .subscribe({
                next: (result: any) => this.onLookupLoaded(field, existingItems, result),
                error: (error: any) => console.error('[Filter Builder] Lookup failed:', field.name, error)
            });
    }

    private onLookupLoaded(field: FilterBuilderField, existingItems: SelectOption[], result: any): void {
        const source = field.dataSource!;
        const records: any[] = result?.items ?? result?.result?.items ?? [];

        const labelPath = source.parameter || 'name';
      const valuePath =
    (source as any).valueParameter ||
    source.valueField ||
    'account.id';

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