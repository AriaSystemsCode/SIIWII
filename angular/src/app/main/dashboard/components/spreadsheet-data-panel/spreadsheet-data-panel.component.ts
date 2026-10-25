import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
    AppDashboardServiceProxy,
    DynamicCondition,
    ExtraAttribute
} from '@shared/service-proxies/service-proxies';
import {
    FilterBuilderField,
    FilterConditionGroup,
    FilterConditionNode,
    FilterConditionRule,
    FilterMatchMode,
    SpreadsheetDataBatch,
    SpreadsheetSheetDataSource
} from '../../models/dashboard.model';
import { BatchEvent, NestedListName } from '../../models/spreadsheet.model';

const NESTED_LISTS: { name: NestedListName; matchMode: FilterMatchMode }[] = [
    { name: 'andWithList', matchMode: 'all' },
    { name: 'orWithList', matchMode: 'any' }
];

const OPERATOR_LABELS: Record<string, string> = {
    eq: '=', neq: '≠', gt: '>', gte: '>=', lt: '<', lte: '<=',
    contains: 'contains', notcontains: 'does not contain',
    startswith: 'starts with', endswith: 'ends with',
    in: 'is in', notin: 'is not in'
};

const BATCH_SIZE = 10;

@Component({
    selector: 'app-spreadsheet-data-panel',
    templateUrl: './spreadsheet-data-panel.component.html',
    styleUrls: ['./spreadsheet-data-panel.component.scss'],
    providers: [ConfirmationService]
})
export class SpreadsheetDataPanelComponent extends AppComponentBase implements OnChanges {

    @Input() visible = false;
    @Input() editSource: SpreadsheetSheetDataSource | null = null;
    @Input() targetSheetName = '';
    @Input() targetSheetHasData = false;

    @Output() close = new EventEmitter<void>();
    @Output() batchLoaded = new EventEmitter<SpreadsheetDataBatch>();
    @Output() loadingFailed = new EventEmitter<any>();
    @Output() dataSourceCleared = new EventEmitter<string>();

    // ---- Panel state ----
    isEditMode = false;
    isAdding = false;
    isLoadingTables = false;
    isLoadingColumns = false;

    // ---- Table, columns, filters, destination ----
    tables: string[] = [];
    selectedTable = '';
    tableColumns: ExtraAttribute[] = [];
    selectedColumns: ExtraAttribute[] = [];
    filterBuilderFields: FilterBuilderField[] = [];
    filterTree: FilterConditionGroup | null = null;
    showFilterDialog = false;
    insertAsNewSheet = true;

    constructor(
        injector: Injector,
        private appDashboardService: AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService
    ) {
        super(injector);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['visible'] || !this.visible) {
            return;
        }

        if (this.editSource) {
            void this.loadEditSource();
            return;
        }

        this.reset();
        this.loadTables();
    }

    reset(): void {
        this.isEditMode = false;
        this.insertAsNewSheet = true;
        this.isLoadingColumns = false;
        this.selectedTable = '';
        this.showFilterDialog = false;
        this.clearTableSelection();
    }

    private clearTableSelection(): void {
        this.tableColumns = [];
        this.selectedColumns = [];
        this.filterBuilderFields = [];
        this.filterTree = null;
    }

    closePanel(): void {
        if (this.isAdding) {
            return;
        }

        this.reset();
        this.close.emit();
    }

    private loadTables(): void {
        this.isLoadingTables = true;

        this.appDashboardService.getTablesList().subscribe({
            next: (result: any) => {
                this.tables = Array.isArray(result) ? result : [];
                this.isLoadingTables = false;
                this.cdr.detectChanges();
            },
            error: error => {
                this.isLoadingTables = false;
                this.loadingFailed.emit(error);
                this.cdr.detectChanges();
            }
        });
    }

    async onTableSelectionChange(table: string | null): Promise<void> {
        if (this.isEditMode || this.isAdding || this.isLoadingColumns) {
            return;
        }

        this.selectedTable = table || '';
        this.clearTableSelection();

        if (table && !(await this.loadTableFields(table))) {
            this.selectedTable = '';
        }
    }

    private async loadTableFields(table: string): Promise<boolean> {
        this.isLoadingColumns = true;

        try {
            const fields = await firstValueFrom(this.appDashboardService.getTableFieldsList(table));

            this.tableColumns = fields ?? [];
            this.filterBuilderFields = this.tableColumns.map(field => this.toFilterField(field));
            return true;

        } catch (error) {
            this.clearTableSelection();
            this.loadingFailed.emit(error);
            return false;

        } finally {
            this.isLoadingColumns = false;
            this.cdr.detectChanges();
        }
    }

    private toFilterField(field: ExtraAttribute): FilterBuilderField {
        return {
            name: field.name,
            label: field.description || field.name,
            dataType: field.dataType || 'String--Textbox',
            acceptMultipleValues: field.acceptMultipleValues === true,
            isLookup: field.isLookup === true,
            entityObjectTypeCode: field.entityObjectTypeCode ?? null,
            validEntries: field.validEntries ?? null,
            dataSource: field.dataSource ?? null,
            options: this.toOptions(field.validEntries)
        };
    }

    /** validEntries can be "A|B|C", a JSON array, or an array of objects. */
    private toOptions(entries: any): Array<{ label: string; value: any }> {
        let items = entries;

        if (typeof items === 'string') {
            const text = items.trim();

            try {
                items = text.startsWith('[') ? JSON.parse(text) : text.split('|');
            } catch {
                items = text.split('|');
            }
        }

        if (!Array.isArray(items)) {
            return [];
        }

        return items
            .map(item => {
                if (item === null || typeof item !== 'object') {
                    const text = String(item).trim();
                    return { label: text, value: text };
                }

                return {
                    label: String(item.label ?? item.description ?? item.name ?? item.text ?? item.value ?? item.code ?? item.id ?? ''),
                    value: item.value ?? item.code ?? item.id ?? item.name
                };
            })
            .filter(option => option.label !== '');
    }

    isColumnSelected(column: ExtraAttribute): boolean {
        return this.selectedColumns.some(selected => selected.attributeId === column.attributeId);
    }

    toggleColumn(column: ExtraAttribute, event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;

        this.selectedColumns = isChecked
            ? (this.isColumnSelected(column) ? this.selectedColumns : [...this.selectedColumns, column])
            : this.selectedColumns.filter(selected => selected.attributeId !== column.attributeId);
    }

    selectAllColumns(): void {
        this.selectedColumns = [...this.tableColumns];
    }

    clearColumns(): void {
        this.selectedColumns = [];
    }

    get filterPreview(): FilterConditionGroup | null {
        return this.filterTree?.children?.length ? this.filterTree : null;
    }

    get hasFilters(): boolean {
        return !!this.filterPreview;
    }

    openFilterDialog(): void {
        if (!this.isAdding) {
            this.showFilterDialog = true;
        }
    }

    closeFilterDialog(): void {
        this.showFilterDialog = false;
    }

    onApplyTree(tree: FilterConditionGroup): void {
        this.filterTree = this.copyTree(tree);
        this.showFilterDialog = false;
    }

    private copyTree(tree: FilterConditionGroup): FilterConditionGroup {
        return JSON.parse(JSON.stringify(tree));
    }

    // ---- labels for the read-only filter summary ----

    getConditionFieldLabel(fieldName: string): string {
        return this.filterBuilderFields.find(field => field.name === fieldName)?.label || fieldName;
    }

    getConditionOperatorLabel(operator: string): string {
        return OPERATOR_LABELS[operator] || operator;
    }

    getConditionValueLabel(condition: FilterConditionRule): string {
        const value = condition.value;

        if (value === null || value === undefined || value === '') {
            return '""';
        }

        const field = this.filterBuilderFields.find(item => item.name === condition.field);
        const option = field?.options?.find(item => String(item.value) === String(value));

        if (option) {
            return option.label;
        }

        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    }

    private async loadEditSource(): Promise<void> {
        const source = this.editSource?.source;

        this.isEditMode = true;
        this.insertAsNewSheet = false;
        this.showFilterDialog = false;
        this.selectedTable = source?.sourceKey || source?.type || '';
        this.tables = this.selectedTable ? [this.selectedTable] : [];
        this.clearTableSelection();

        if (!source || !this.selectedTable || !(await this.loadTableFields(this.selectedTable))) {
            this.cdr.detectChanges();
            return;
        }

        const savedColumns: string[] = source.columns ?? [];
        this.selectedColumns = this.tableColumns.filter(column => savedColumns.includes(column.name));
        this.filterTree = this.restoreSavedFilterTree(source.filters, source.mode === 'any' ? 'any' : 'all');

        this.cdr.detectChanges();
    }

    /** Returns the saved tree. Older data only has flat conditions, which are converted to a tree. */
    private restoreSavedFilterTree(filters: any, fallbackMode: FilterMatchMode): FilterConditionGroup | null {
        if (filters?.filterTree?.type === 'group') {
            return this.copyTree(filters.filterTree);
        }

        const conditions: any[] = filters?.conditions ?? [];

        if (!conditions.length) {
            return null;
        }

        const root: FilterConditionGroup = {
            type: 'group',
            matchMode: filters?.matchMode ?? fallbackMode,
            children: []
        };

        for (const condition of conditions) {
            root.children.push({
                type: 'rule',
                field: condition.field,
                operator: condition.operator || 'eq',
                value: condition.value
            });

            this.restoreNestedGroups(root, condition);
        }

        return root;
    }

    /** Turns "andWithList[n].*" / "orWithList[n].*" keys of one condition into nested groups. */
    private restoreNestedGroups(root: FilterConditionGroup, condition: any): void {
        for (const { name, matchMode } of NESTED_LISTS) {
            const fieldKey = new RegExp(`^${name}\\[(\\d+)\\]\\.field$`);

            const children: FilterConditionNode[] = Object.keys(condition)
                .map(key => key.match(fieldKey))
                .filter((match): match is RegExpMatchArray => !!match)
                .map(match => Number(match[1]))
                .sort((a, b) => a - b)
                .filter(index => !!condition[`${name}[${index}].field`])
                .map(index => ({
                    type: 'rule' as const,
                    field: condition[`${name}[${index}].field`],
                    operator: condition[`${name}[${index}].operator`] || 'eq',
                    value: condition[`${name}[${index}].value`]
                }));

            if (children.length) {
                root.children.push({ type: 'group', matchMode, children });
            }
        }
    }

    clearDataSource(): void {
        const sheetName = this.editSource?.sheetName;

        if (this.isAdding || !this.isEditMode || !sheetName) {
            return;
        }

        this.confirmationService.confirm({
            key: 'clearDataSourceConfirm',
            header: 'Clear Data Source',
            message:
                `Are you sure you want to clear all data and remove the linked data source from "${sheetName}"? ` +
                'Click Save on the spreadsheet to persist this change.',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-text p-button-secondary',
            rejectButtonStyleClass: 'p-button-text p-button-transparent',
            accept: () => this.dataSourceCleared.emit(sheetName)
        });
    }

    private buildApiConditions(): DynamicCondition[] {
        return this.filterTree ? this.nodesToConditions(this.filterTree.children) : [];
    }

    /** Rules become conditions. A nested group is attached to the previous condition as and/or children. */
    private nodesToConditions(nodes: FilterConditionNode[]): DynamicCondition[] {
        const conditions: DynamicCondition[] = [];

        for (const node of nodes) {
            if (node.type === 'rule') {
                conditions.push(this.ruleToCondition(node));
                continue;
            }

            const rules = this.flattenRules(node);

            if (!rules.length) {
                continue;
            }

            const listName: NestedListName = node.matchMode === 'any' ? 'orWithList' : 'andWithList';

            // a group with no condition before it uses its first rule as the parent
            let parent = conditions[conditions.length - 1];
            if (!parent) {
                parent = this.ruleToCondition(rules.shift()!);
                conditions.push(parent);
            }

            rules.forEach(rule => this.addNestedCondition(parent, listName, this.ruleToCondition(rule)));
        }

        return conditions;
    }

    private flattenRules(group: FilterConditionGroup): FilterConditionRule[] {
        return group.children.flatMap(node => node.type === 'rule' ? [node] : this.flattenRules(node));
    }

    private ruleToCondition(rule: { field: string; operator: string; value: any }): DynamicCondition {
        const condition = new DynamicCondition();
        condition.field = rule.field;
        condition.operator = rule.operator;
        condition.value = this.formatConditionValue(rule.value);
        return condition;
    }

    /** Nested conditions are added as flat keys: orWithList[0].field, orWithList[0].operator ... */
    private addNestedCondition(parent: DynamicCondition, listName: NestedListName, child: DynamicCondition): void {
        const fieldKey = new RegExp(`^${listName}\\[(\\d+)\\]\\.field$`);
        const nextIndex = Object.keys(parent).filter(key => fieldKey.test(key)).length;

        Object.keys(child).forEach(key => {
            const value = (child as any)[key];

            if (value !== undefined && value !== null) {
                (parent as any)[`${listName}[${nextIndex}].${key}`] = value;
            }
        });
    }

    /** Dates become "yyyy-MM-dd", everything else becomes a string. */

    private formatConditionValue(value: any): string {
        if (!(value instanceof Date)) {
            return String(value);
        }

        const month = ('0' + (value.getMonth() + 1)).slice(-2);
        const day = ('0' + value.getDate()).slice(-2);

        return `${value.getFullYear()}-${month}-${day}`;
    }


    // =====================================================
    // LOAD DATA INTO THE SPREADSHEET
    // =====================================================

    get submitButtonLabel(): string {
        if (this.isAdding) {
            return this.isEditMode ? 'Applying' : 'Adding';
        }

        if (this.isEditMode) {
            return 'ApplyChanges';
        }

        return this.insertAsNewSheet ? 'AddAsNewSheet' : 'InsertIntoCurrentSheet';
    }

    async addSheet(): Promise<void> {
        if (!this.selectedTable || !this.selectedColumns.length || this.isAdding) {
            return;
        }

        const sheetName = this.isEditMode ? this.editSource?.sheetName : this.targetSheetName;
        const replacesSheet = this.isEditMode || !this.insertAsNewSheet;

        if (replacesSheet && !sheetName) {
            this.notify.warn('Please select a destination worksheet.');
            return;
        }

        if (!this.isEditMode && !this.insertAsNewSheet && this.targetSheetHasData) {
            const isConfirmed = window.confirm(
                `The worksheet "${sheetName}" already contains data.\n\n` +
                'Inserting this list will replace its existing contents and linked data source, if any.\n\n' +
                'Do you want to continue?'
            );

            if (!isConfirmed) {
                return;
            }
        }

        const selectedFields = this.selectedColumns.map(column => column.name).filter(name => !!name);

        // The Id column is always loaded.
        const requestedFields = selectedFields.some(name => name.toLowerCase() === 'id')
            ? selectedFields
            : [...selectedFields, 'Id'];

        const conditions = this.buildApiConditions();
        const matchMode: FilterMatchMode = this.filterTree?.matchMode ?? 'all';

        let skip = 0;
        let loaded = 0;
        let isFirstBatch = true;

        this.isAdding = true;

        try {
            while (true) {
                const result: any = await firstValueFrom(
                    this.appDashboardService.getAllTableData(
                        this.appSession?.tenantId,
                        this.selectedTable,
                        requestedFields,
                        conditions,
                        undefined,
                        matchMode === 'any',
                        undefined,
                        skip,
                        BATCH_SIZE
                    )
                );

                const records: any[] = result?.items ?? [];
                const total = Number(result?.totalCount ?? 0);

                if (!records.length) {
                    break;
                }

                loaded += records.length;
                skip += records.length;

                const isLastBatch = records.length < BATCH_SIZE || (total > 0 && loaded >= total);

                const batch: BatchEvent = {
                    table: this.selectedTable,
                    fields: [...selectedFields],
                    selectedColumns: [...this.selectedColumns],
                    conditions: [...conditions],
                    matchMode,
                    filterTree: this.filterTree,
                    insertAsNewSheet: !this.isEditMode && this.insertAsNewSheet,
                    targetSheetName: sheetName,
                    rows: this.buildRows(records),
                    loaded,
                    total,
                    isFirstBatch,
                    isLastBatch
                } as BatchEvent;

                this.batchLoaded.emit(batch);

                await this.waitForPaint();
                isFirstBatch = false;

                if (isLastBatch) {
                    break;
                }
            }

            if (loaded === 0) {
                this.notify.info('No records found.');
            }

        } catch (error) {
            console.error('[Spreadsheet Data Panel] load failed:', error);
            this.loadingFailed.emit(error);

        } finally {
            this.isAdding = false;
            this.cdr.detectChanges();
        }
    }

    /** One row per record: Id first, then the selected columns. */
    private buildRows(records: Array<{ [key: string]: any }>): any[] {
        const columnNames = this.selectedColumns
            .map(column => column.name)
            .filter(name => !!name && name.toLowerCase() !== 'id');

        return records.map(record => {
            const row: any = { Id: this.readValue(record, 'Id') };

            columnNames.forEach(name => row[name] = this.readValue(record, name));

            return row;
        });
    }

    /** Reads a property ignoring the letter case of its name. */
    private readValue(record: any, key: string): any {
        if (!record || !key) {
            return '';
        }

        const actualKey = key in record
            ? key
            : Object.keys(record).find(property => property.toLowerCase() === key.toLowerCase());

        return actualKey === undefined ? '' : this.toCellValue(record[actualKey]);
    }

    /** Converts any API value into something a spreadsheet cell can show. */
    private toCellValue(value: any): any {
        if (value === null || value === undefined) {
            return '';
        }

        if (['string', 'number', 'boolean'].includes(typeof value)) {
            return value;
        }

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? String(value) : value.toLocaleDateString();
        }

        if (Array.isArray(value)) {
            return value.map(item => this.toCellValue(item)).join(', ');
        }

        if (typeof value === 'object') {
            return value.name ?? value.label ?? value.value ?? JSON.stringify(value);
        }

        return String(value);
    }

    /** Lets the browser paint between two batches so the spreadsheet stays responsive. */
    private waitForPaint(): Promise<void> {
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
}