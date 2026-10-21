
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
    FilterConditionGroup,
    FilterConditionNode,
    FilterConditionRule,
    FilterMatchMode
} from '../../models/dashboard.model';
import { DynamicApiDispatcherService }
    from '@shared/dynamicApiDispatcherService ';

import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-filter-builder',
    templateUrl: './filter-builder.component.html',
    styleUrls: ['./filter-builder.component.scss']
})
export class FilterBuilderComponent implements OnChanges {

    @Input() fields: FilterBuilderField[] = [];
    @Input() conditions: FilterBuilderCondition[] = [];
    @Input() matchMode: FilterMatchMode = 'all';
    @Input() filterTree: FilterConditionGroup | null = null;

    @Output() apply = new EventEmitter<FilterBuilderCondition[]>();
    @Output() cancel = new EventEmitter<void>();
    @Output() conditionsChange = new EventEmitter<FilterBuilderCondition[]>();
    @Output() matchModeChange = new EventEmitter<FilterMatchMode>();
    @Output() filterTreeChange = new EventEmitter<FilterConditionGroup>();
    @Output() applyTree = new EventEmitter<FilterConditionGroup>();

    rootGroup: FilterConditionGroup = {
        type: 'group',
        matchMode: 'all',
        children: []
    };

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

    readonly nullOperators = [
        { label: 'Is Set', value: 'isnotnull' },
        { label: 'Is Not Set', value: 'isnull' }
    ];

    constructor(
        private dynamicApi: DynamicApiDispatcherService
    ) { }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    ngOnChanges(changes: SimpleChanges): void {

        if (
            changes['filterTree'] ||
            changes['conditions'] ||
            changes['fields'] ||
            changes['matchMode']
        ) {

            if (this.filterTree) {
                this.rootGroup = this.restoreGroup(this.filterTree);
            } else {
                this.rootGroup = {
                    type: 'group',
                    matchMode: this.matchMode,
                    children: (this.conditions || []).map(condition => ({
                        type: 'rule' as const,
                        field: condition.field,
                        operator: condition.operator || 'eq',
                        value: this.restoreValue(
                            condition.field,
                            condition.value
                        )
                    }))
                };
            }
        }
    }

    private restoreGroup(
        group: FilterConditionGroup
    ): FilterConditionGroup {

        return {
            type: 'group',
            matchMode: group.matchMode,
            children: group.children.map(node => {

                if (node.type === 'group') {
                    return this.restoreGroup(node);
                }

                return {
                    ...node,
                    value: this.restoreValue(
                        node.field,
                        node.value
                    ),
                    dateRange: node.dateRange?.map(
                        date => new Date(date)
                    )
                };
            })
        };
    }

    // =====================================================
    // GROUP MANAGEMENT
    // =====================================================

    createConditionRule(): FilterConditionRule {
        return {
            type: 'rule',
            field: '',
            operator: 'eq',
            value: null
        };
    }

    addRuleToGroup(group: FilterConditionGroup): void {
        group.children.push(this.createConditionRule());
    }

    addRuleAfterInGroup(
        group: FilterConditionGroup,
        index: number
    ): void {

        group.children.splice(
            index + 1,
            0,
            this.createConditionRule()
        );
    }

    // Only one nested group is allowed, directly under the root group.
    get hasNestedGroup(): boolean {
        return this.rootGroup.children.some(node => node.type === 'group');
    }

    // The branching icon adds a group containing exactly one rule.
    addGroupAfter(group: FilterConditionGroup, index: number): void {
        if (group !== this.rootGroup || this.hasNestedGroup) {
            return;
        }

        group.children.splice(index + 1, 0, {
            type: 'group',
            matchMode: 'all',
            children: [this.createConditionRule()]
        });
    }

    removeGroupItem(
        group: FilterConditionGroup,
        index: number
    ): void {

        group.children.splice(index, 1);
    }

    isGroup(
        node: FilterConditionNode
    ): node is FilterConditionGroup {

        return node.type === 'group';
    }

    isRule(
        node: FilterConditionNode
    ): node is FilterConditionRule {

        return node.type === 'rule';
    }

    asGroup(
        node: FilterConditionNode
    ): FilterConditionGroup {

        return node as FilterConditionGroup;
    }

    asRule(
        node: FilterConditionNode
    ): FilterConditionRule {

        return node as FilterConditionRule;
    }

    // =====================================================
    // FIELD / OPERATOR
    // =====================================================

    onFieldChange(rule: FilterBuilderRule): void {

        rule.operator = 'eq';
        rule.value = null;
        rule.datePeriod = undefined;
        rule.dateRange = [];

        const field = this.getField(rule);

        if (field?.dataSource) {
            this.onLookupOpen(rule);
        }
    }

    onOperatorChange(rule: FilterBuilderRule): void {
        rule.datePeriod = undefined;
        rule.dateRange = [];

        rule.value = this.isNullOperator(rule)
            ? rule.operator
            : null;
    }

    getField(
        rule: FilterBuilderRule
    ): FilterBuilderField | undefined {

        return this.fields.find(
            field => field.name === rule.field
        );
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

    getOperators(
        rule: FilterBuilderRule
    ): Array<{ label: string; value: string }> {

        let operators: Array<{ label: string; value: string }>;

        if (this.isOptionField(rule)) {
            operators = this.booleanOperators;
        } else {
            const type = this.getType(rule);

            if (type === 'boolean' || type === 'list') {
                operators = this.booleanOperators;
            } else if (type === 'date') {
                operators = this.dateOperators;
            } else if (type === 'number') {
                operators = this.comparisonOperators;
            } else {
                operators = this.textOperators;
            }
        }

        return [...operators, ...this.nullOperators];
    }
    getValueOptionsWithSelection(
        rule: FilterBuilderRule
    ): Array<{ label: string; value: any }> {

        const options = this.getValueOptions(rule);

        if (
            rule.value === null ||
            rule.value === undefined ||
            rule.value === ''
        ) {
            return options;
        }

        const exists = options.some(
            option => String(option.value) === String(rule.value)
        );

        if (exists) {
            return options;
        }

        return [
            {
                label: String(rule.value),
                value: rule.value
            },
            ...options
        ];
    }

    isNullOperator(rule: FilterBuilderRule): boolean {
        return rule.operator === 'isnull' ||
            rule.operator === 'isnotnull';
    }
    hasValidEntries(rule: FilterBuilderRule): boolean {
        return !!this.getField(rule)?.options?.length;
    }

    // =====================================================
    // RESTORE VALUES
    // =====================================================

    private restoreValue(
        fieldName: string,
        value: any
    ): any {

        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return value;
        }

        const rule: FilterBuilderRule = {
            field: fieldName,
            operator: 'eq',
            value
        };

        if (this.getType(rule) === 'date') {

            const date = value instanceof Date
                ? value
                : new Date(value);

            return isNaN(date.getTime())
                ? null
                : date;
        }

        return value;
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    isValid(rule: FilterBuilderRule): boolean {

        // Field and operator are required
        if (!rule.field || !rule.operator) {
            return false;
        }

        // Validate operator
        const allowedOperators = this.getOperators(rule)
            .map(operator => operator.value);

        if (!allowedOperators.includes(rule.operator)) {
            return false;
        }

        // IMPORTANT:
        // Is Set / Is Not Set do not require a value input
        if (this.isNullOperator(rule)) {
            return true;
        }

        // Date period validation
        if (this.isDatePeriodOperator(rule)) {
            return this.getDateRange(rule) !== null;
        }

        // Normal value validation
        if (
            rule.value === null ||
            rule.value === undefined ||
            rule.value === ''
        ) {
            return false;
        }

        // Number validation
        if (this.getType(rule) === 'number') {
            return Number.isFinite(Number(rule.value));
        }

        // Date validation
        if (this.getType(rule) === 'date') {

            const date = rule.value instanceof Date
                ? rule.value
                : new Date(rule.value);

            return !isNaN(date.getTime());
        }

        return true;
    }

    private isGroupValid(
        group: FilterConditionGroup
    ): boolean {

        return group.children.every(node => {

            if (node.type === 'group') {
                return this.isGroupValid(node);
            }

            return this.isValid(node);
        });
    }

    get canApply(): boolean {
        return this.isGroupValid(this.rootGroup);
    }

    // =====================================================
    // DATE HANDLING
    // =====================================================

    isDatePeriodOperator(
        rule: FilterBuilderRule
    ): boolean {

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

    getDateRange(
        rule: FilterBuilderRule
    ): Date[] | null {

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
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                    ),
                    end
                ];

            case 'lastMonth':
                return [
                    new Date(
                        today.getFullYear(),
                        today.getMonth() - 1,
                        1
                    ),
                    this.endOfDay(
                        new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            0
                        )
                    )
                ];

            case 'yearToDate':
                return [
                    new Date(
                        today.getFullYear(),
                        0,
                        1
                    ),
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
                        this.startOfDay(
                            new Date(rule.dateRange[0])
                        ),
                        this.endOfDay(
                            new Date(rule.dateRange[1])
                        )
                    ]
                    : null;

            default:
                return null;
        }
    }

    formatDateValue(date: Date): string {

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            date.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // =====================================================
    // FORMAT RULE VALUE
    // =====================================================

    private formatValue(
        rule: FilterBuilderRule
    ): any {

        if (this.getType(rule) === 'date') {

            const date = rule.value instanceof Date
                ? rule.value
                : new Date(rule.value);

            return this.formatDateValue(date);
        }

        if (this.getType(rule) === 'number') {
            return Number(rule.value);
        }

        return rule.value;
    }

    // =====================================================
    // BUILD NESTED FILTER TREE
    // =====================================================

    private buildFilterTree(
        group: FilterConditionGroup
    ): FilterConditionGroup {

        const children: FilterConditionNode[] = [];

        for (const node of group.children) {

            if (node.type === 'group') {

                children.push(
                    this.buildFilterTree(node)
                );

                continue;
            }

            if (!this.isValid(node)) {
                continue;
            }
            // Is Set / Is Not Set
            if (this.isNullOperator(node)) {

                children.push({
                    type: 'rule',
                    field: node.field,
                    operator: node.operator,
                    value: node.operator
                });

                continue;
            }

            if (this.isDatePeriodOperator(node)) {

                const range = this.getDateRange(node);

                if (!range) {
                    continue;
                }

                const start = this.formatDateValue(
                    range[0]
                );

                const end = this.formatDateValue(
                    range[1]
                );

                children.push({
                    type: 'group',
                    matchMode: node.operator === 'in'
                        ? 'all'
                        : 'any',
                    children: [
                        {
                            type: 'rule',
                            field: node.field,
                            operator: node.operator === 'in'
                                ? 'gte'
                                : 'lt',
                            value: start
                        },
                        {
                            type: 'rule',
                            field: node.field,
                            operator: node.operator === 'in'
                                ? 'lte'
                                : 'gt',
                            value: end
                        }
                    ]
                });

                continue;
            }

            children.push({
                type: 'rule',
                field: node.field,
                operator: node.operator,
                value: this.formatValue(node)
            });
        }

        return {
            type: 'group',
            matchMode: group.matchMode,
            children
        };
    }

    applyFilters(): void {

        if (!this.canApply) {
            return;
        }
        const tree = this.buildFilterTree(this.rootGroup);
        this.matchMode = tree.matchMode;
        this.matchModeChange.emit(tree.matchMode);
        this.applyTree.emit(tree);
    }

    private nextRuleId = 0;

    getRuleId(rule: FilterBuilderRule): string {
        const item = rule as FilterBuilderRule & {
            _uiId?: string;
        };

        if (!item._uiId) {
            item._uiId = `filter-rule-${++this.nextRuleId}`;
        }

        return item._uiId;
    }

    typePlaceholder = 'Select value';

    lookupOptions = new Map<string, {
        items: Array<{ label: string; value: any }>;
        totalCount: number;
        loading: boolean;
        loaded: boolean;
    }>();

    private lookupRequests = new Set<string>();

    private fieldKey(field: FilterBuilderField): string {
        return field.name;
    }

    private getByPath(obj: any, path: string): any {
        return String(path || '')
            .split('.')
            .reduce((current, key) => current?.[key], obj);
    }

    isOptionField(rule: FilterBuilderRule): boolean {

        const field = this.getField(rule);

        if (!field) {
            return false;
        }

        const hasValidEntries =
            !!field.validEntries?.trim();

        const hasDynamicApi =
            !!field.dataSource?.service &&
            !!field.dataSource?.api;

        const hasStaticOptions =
            !!field.options?.length ||
            !!field.paginationSetting?.list?.length;

        return (
            field.isLookup === true ||
            hasValidEntries ||
            hasDynamicApi ||
            hasStaticOptions
        );
    }

    getValueOptions(
        rule: FilterBuilderRule
    ): Array<{ label: string; value: any }> {

        const field = this.getField(rule);

        if (!field) {
            return [];
        }

        // Same priority as dynamicInputs:
        // validEntries without a dataSource is a static list.
        if (field.validEntries?.trim() && !field.dataSource) {
            return field.validEntries
                .split('|')
                .map(value => value.trim())
                .filter(Boolean)
                .map(value => ({
                    label: value,
                    value
                }));
        }

        const cached = this.lookupOptions.get(
            this.fieldKey(field)
        );

        if (cached) {
            return cached.items;
        }

        const options =
            field.paginationSetting?.list?.length
                ? field.paginationSetting.list
                : field.options ?? [];

        return options.map((option: any) => ({
            label: String(option.label ?? option.value ?? ''),
            value: option.value
        }));
    }

    isLookupLoading(rule: FilterBuilderRule): boolean {
        const field = this.getField(rule);

        return field
            ? !!this.lookupOptions.get(
                this.fieldKey(field)
            )?.loading
            : false;
    }

    hasMoreLookupOptions(rule: FilterBuilderRule): boolean {
        const field = this.getField(rule);

        if (!field?.dataSource) {
            return false;
        }

        const state = this.lookupOptions.get(
            this.fieldKey(field)
        );

        return !!state &&
            !state.loading &&
            state.items.length < state.totalCount;
    }

    onLookupOpen(rule: FilterBuilderRule): void {
        const field = this.getField(rule);

        if (!field?.dataSource) {
            return;
        }

        const state = this.lookupOptions.get(
            this.fieldKey(field)
        );

        if (!state?.loaded && !state?.loading) {
            this.loadLookupOptions(field, false);
        }
    }

    loadMoreLookupOptions(rule: FilterBuilderRule): void {
        const field = this.getField(rule);

        if (field?.dataSource) {
            this.loadLookupOptions(field, true);
        }
    }

    private loadLookupOptions(
        field: FilterBuilderField,
        append: boolean
    ): void {

        const source = field.dataSource;

        if (!source?.service || !source?.api) {
            return;
        }

        const key = this.fieldKey(field);

        if (this.lookupRequests.has(key)) {
            return;
        }

        const previous = this.lookupOptions.get(key);

        if (
            append &&
            previous?.loaded &&
            previous.items.length >= previous.totalCount
        ) {
            return;
        }

        const existingItems = append
            ? previous?.items ?? []
            : [];

        const skipCount = existingItems.length;
        const maxResultCount = 10;

        this.lookupRequests.add(key);

        this.lookupOptions.set(key, {
            items: existingItems,
            totalCount: previous?.totalCount ?? 0,
            loading: true,
            loaded: previous?.loaded ?? false
        });

        const serviceName =
            source.service.endsWith('ServiceProxy')
                ? source.service
                : `${source.service}ServiceProxy`;

        this.dynamicApi.dispatch(
            serviceName,
            source.api,
            {
                skipCount,
                maxResultCount
            }
        )
            .pipe(
                finalize(() => {
                    this.lookupRequests.delete(key);

                    const current = this.lookupOptions.get(key);

                    if (current) {
                        this.lookupOptions.set(key, {
                            ...current,
                            loading: false
                        });
                    }
                })
            )
            .subscribe({
                next: (result: any) => {

                    const records: any[] =
                        result?.items ??
                        result?.result?.items ??
                        [];

                    const labelPath =
                        source.parameter || 'name';

                    // dynamicInputs currently uses item.account.id.
                    // Preserve that as the fallback, but allow
                    // different dynamic API response shapes.
                    const valuePath =
                        source.valueField || 'account.id';

                    const newOptions = records.map(
                        (item: any) => {

                            const label = this.getByPath(
                                item,
                                labelPath
                            );

                            const value =
                                this.getByPath(item, valuePath) ??
                                item.id ??
                                item.value;

                            return {
                                label: String(label ?? value ?? ''),
                                value
                            };
                        }
                    ).filter(option =>
                        option.value !== null &&
                        option.value !== undefined
                    );

                    const combined = new Map<string, {
                        label: string;
                        value: any;
                    }>();

                    [...existingItems, ...newOptions].forEach(
                        option => {
                            combined.set(
                                String(option.value),
                                option
                            );
                        }
                    );

                    this.lookupOptions.set(key, {
                        items: Array.from(combined.values()),
                        totalCount: Number(
                            result?.totalCount ??
                            result?.result?.totalCount ??
                            newOptions.length
                        ),
                        loading: false,
                        loaded: true
                    });
                },

                error: (error: any) => {
                    console.error(
                        '[Filter Builder] Lookup loading failed:',
                        field.name,
                        error
                    );
                }
            });
    }

    clearFilters(): void {
        this.rootGroup.children = [];
    }

    close(): void {
        this.cancel.emit();
    }
}
