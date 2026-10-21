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
    FilterBuilderCondition,
    FilterBuilderField,
    FilterConditionGroup,
    FilterConditionNode,
    FilterConditionRule,
    FilterMatchMode,
    SpreadsheetDataBatch,
    SpreadsheetSheetDataSource
} from '../../models/dashboard.model';

type NestedListName = 'orWithList' | 'andWithList';

@Component({
    selector: 'app-spreadsheet-data-panel',
    templateUrl: './spreadsheet-data-panel.component.html',
    styleUrls: ['./spreadsheet-data-panel.component.scss'],
    providers: [ConfirmationService]
})
export class SpreadsheetDataPanelComponent extends AppComponentBase implements OnChanges {

    // ---- Inputs / outputs ----
    @Input() visible = false;
    @Input() editSource: SpreadsheetSheetDataSource | null = null;
    @Input() targetSheetName = '';
    @Input() targetSheetHasData = false;

    @Output() close = new EventEmitter<void>();
    @Output() batchLoaded = new EventEmitter<SpreadsheetDataBatch>();
    @Output() loadingFailed = new EventEmitter<any>();
    @Output() dataSourceCleared = new EventEmitter<string>();

    // ---- Settings ----
    private readonly batchSize = 10;

    private readonly tableIcons: Record<string, string> = {
        AppContacts: 'fa fa-address-book',
        APPFields: 'fa fa-list-alt',
        AppFieldsHistory: 'fa fa-history',
        AppTableFields: 'fa fa-table',
        AppItems: 'fa fa-box',
        AppItemsLists: 'fa fa-list',
        AppMessages: 'fa fa-envelope',
        Articles: 'fa fa-file-alt',
        'News Digest': 'fa fa-newspaper',
        SingleImage: 'fa fa-image',
        SingleVideo: 'fa fa-video',
        Text: 'fa fa-font',
        AppTransactionDetails: 'fa fa-list-ul',
        AppTransactionHeaders: 'fa fa-exchange-alt'
    };

    private readonly operatorLabels: Record<string, string> = {
        eq: '=',
        neq: '≠',
        gt: '>',
        gte: '>=',
        lt: '<',
        lte: '<=',
        contains: 'contains',
        notcontains: 'does not contain',
        startswith: 'starts with',
        endswith: 'ends with',
        in: 'is in',
        notin: 'is not in'
    };

    // ---- Wizard state ----
    step: 1 | 2 = 1;
    isEditMode = false;
    isAdding = false;
    isLoadingTables = false;
    isLoadingColumns = false;

    // ---- Step 1: table ----
    tables: string[] = [];
    pendingTable: string | null = null;   // highlighted in step 1, not confirmed yet

    // ---- Step 2: columns, filters, destination ----
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

    // =====================================================
    // OPEN / RESET
    // =====================================================

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['visible'] || !this.visible) {
            return;
        }

        if (this.editSource) {
            void this.loadEditSource();
            return;
        }

        this.isEditMode = false;
        this.loadTables();
        this.reset();
    }

    reset(): void {
        this.step = 1;
        this.isEditMode = false;
        this.insertAsNewSheet = true;
        this.isLoadingColumns = false;
        this.pendingTable = null;
        this.selectedTable = '';
        this.showFilterDialog = false;
        this.clearTableSelection();
    }

    /** Clears everything that depends on the selected table. */
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

    // =====================================================
    // STEP 1: TABLES
    // =====================================================

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

    getTableIcon(tableName: string): string {
        return this.tableIcons[tableName] || 'fa fa-database';
    }

    chooseTable(table: string): void {
        this.pendingTable = table;
    }

    goToColumnsStep(): void {
        if (this.pendingTable) {
            void this.openTable(this.pendingTable);
        }
    }

    backToTables(): void {
        if (this.isAdding || this.isEditMode) {
            return;
        }

        this.step = 1;
        this.selectedTable = '';
        this.clearTableSelection();
    }

    // =====================================================
    // STEP 2: COLUMNS
    // =====================================================

    private async openTable(table: string): Promise<void> {
        if (!table || this.isLoadingColumns) {
            return;
        }

        this.selectedTable = table;
        this.clearTableSelection();
        this.step = 2;

        await this.loadTableFields(table);
    }

    /** Loads the table columns and the matching filter fields. Returns false when it fails. */
    private async loadTableFields(table: string): Promise<boolean> {
        this.isLoadingColumns = true;

        try {
            const fields: ExtraAttribute[] = await firstValueFrom(
                this.appDashboardService.getTableFieldsList(table)
            );

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
            options: this.mapValidEntries(field.validEntries),
            acceptMultipleValues: field.acceptMultipleValues === true
        };
    }

    private mapValidEntries(entries: any): Array<{ label: string; value: any }> {
        if (!entries) {
            return [];
        }

        let values = entries;

        if (typeof values === 'string') {
            try {
                values = JSON.parse(values);
            } catch {
                values = values.split(',').map((value: string) => value.trim());
            }
        }

        if (!Array.isArray(values)) {
            return [];
        }

        return values.map((item: any) => {
            if (typeof item !== 'object' || item === null) {
                return { label: String(item), value: item };
            }

            return {
                label: String(
                    item.label ?? item.description ?? item.name ?? item.text ?? item.value ?? item.code ?? item.id
                ),
                value: item.value ?? item.code ?? item.id ?? item.name
            };
        });
    }

    isColumnSelected(column: ExtraAttribute): boolean {
        return this.selectedColumns.some(selected => selected.attributeId === column.attributeId);
    }

    toggleColumn(column: ExtraAttribute, event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;

        if (!isChecked) {
            this.selectedColumns = this.selectedColumns.filter(
                selected => selected.attributeId !== column.attributeId
            );
            return;
        }

        if (!this.isColumnSelected(column)) {
            this.selectedColumns = [...this.selectedColumns, column];
        }
    }

    selectAllColumns(): void {
        this.selectedColumns = [...this.tableColumns];
    }

    clearColumns(): void {
        this.selectedColumns = [];
    }

    // =====================================================
    // STEP 2: FILTERS
    // =====================================================

    /** The filter tree to show in the summary, or null when nothing is applied. */
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
        return JSON.parse(JSON.stringify(tree)) as FilterConditionGroup;
    }

    // ---- labels for the summary ----

    getConditionFieldLabel(fieldName: string): string {
        const field = this.filterBuilderFields.find(item => item.name === fieldName);
        return field?.label || fieldName;
    }

    getConditionOperatorLabel(operator: string): string {
        return this.operatorLabels[operator] || operator;
    }

    getConditionValueLabel(condition: FilterBuilderCondition): string {
        const value = condition.value;

        if (value === null || value === undefined || value === '') {
            return '""';
        }

        const field = this.filterBuilderFields.find(item => item.name === condition.field);
        const option = field?.options?.find(item => String(item.value) === String(value));

        if (option) {
            return option.label;
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return String(value);
    }

    // =====================================================
    // EDIT MODE
    // =====================================================

    private async loadEditSource(): Promise<void> {
        const source = this.editSource?.source;

        if (!source) {
            return;
        }

        this.isEditMode = true;
        this.insertAsNewSheet = false;
        this.showFilterDialog = false;
        this.selectedTable = source.sourceKey || source.type;
        this.clearTableSelection();

        const isLoaded = await this.loadTableFields(this.selectedTable);

        if (!isLoaded) {
            return;
        }

        const savedColumnNames: string[] = source.columns ?? [];

        this.selectedColumns = this.tableColumns.filter(column => savedColumnNames.includes(column.name));
        this.filterTree = this.restoreSavedFilterTree(source.filters, source.mode === 'any' ? 'any' : 'all');
        this.step = 2;

        this.cdr.detectChanges();
    }

    /**
     * Returns the saved nested tree. Older data only has flat conditions
     * (with andWithList[n].* / orWithList[n].* keys), so those are converted to a tree.
     */
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

            this.restoreNestedGroup(root, condition, 'andWithList', 'all');
            this.restoreNestedGroup(root, condition, 'orWithList', 'any');
        }

        return root;
    }

    private restoreNestedGroup(
        root: FilterConditionGroup,
        condition: any,
        listName: NestedListName,
        matchMode: FilterMatchMode
    ): void {
        const fieldKey = new RegExp(`^${listName}\\[(\\d+)\\]\\.field$`);

        const indexes = Object.keys(condition)
            .map(key => key.match(fieldKey))
            .filter((match): match is RegExpMatchArray => !!match)
            .map(match => Number(match[1]))
            .sort((a, b) => a - b);

        const children: FilterConditionNode[] = [];

        for (const index of indexes) {
            const prefix = `${listName}[${index}]`;
            const field = condition[`${prefix}.field`];

            if (field) {
                children.push({
                    type: 'rule',
                    field,
                    operator: condition[`${prefix}.operator`] || 'eq',
                    value: condition[`${prefix}.value`]
                });
            }
        }

        if (children.length) {
            root.children.push({ type: 'group', matchMode, children });
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
                `Are you sure you want to clear all data and remove ` +
                `the linked data source from "${sheetName}"? ` +
                `Click Save on the spreadsheet to persist this change.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-text p-button-secondary',
            rejectButtonStyleClass: 'p-button-text p-button-transparent',
            accept: () => this.dataSourceCleared.emit(sheetName)
        });
    }

    // =====================================================
    // FILTER TREE -> API CONDITIONS
    // =====================================================

    private buildApiConditions(): DynamicCondition[] {
        return this.filterTree ? this.nodesToConditions(this.filterTree.children) : [];
    }

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

            // A group belongs to the condition before it.
            // If there is none, the first rule of the group becomes that condition.
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
        const rules: FilterConditionRule[] = [];

        for (const node of group.children) {
            if (node.type === 'rule') {
                rules.push(node);
            } else {
                rules.push(...this.flattenRules(node));
            }
        }

        return rules;
    }

    private ruleToCondition(rule: { field: string; operator: string; value: any }): DynamicCondition {
        const condition = new DynamicCondition();
        condition.field = rule.field;
        condition.operator = rule.operator;
        condition.value = this.formatConditionValue(rule.value);
        return condition;
    }

    /**
     * The generated proxy sends arrays as "[object Object]", so nested conditions
     * are added as flat keys (orWithList[0].field ...) that ASP.NET model binding understands.
     */
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

        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
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
        const destinationSheetName = this.isEditMode ? this.editSource?.sheetName : this.targetSheetName;
        const replacesExistingSheet = this.isEditMode || !this.insertAsNewSheet;

        if (replacesExistingSheet && !destinationSheetName) {
            this.notify.warn('Please select a destination worksheet.');
            return;
        }

        if (!this.isEditMode && !this.insertAsNewSheet && this.targetSheetHasData) {
            const isConfirmed = window.confirm(
                `The worksheet "${destinationSheetName}" already contains data.\n\n` +
                'Inserting this list will replace its existing contents and linked data source, if any.\n\n' +
                'Do you want to continue?'
            );

            if (!isConfirmed) {
                return;
            }
        }

        if (!this.selectedTable || !this.selectedColumns.length || this.isAdding) {
            return;
        }

        const selectedFields = this.selectedColumns
            .map(column => column.name)
            .filter((name): name is string => !!name);

        // The Id column is always loaded.
        const requestedFields = selectedFields.some(name => name.toLowerCase() === 'id')
            ? [...selectedFields]
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
                        this.batchSize
                    )
                );

                const records: any[] = result?.items ?? [];
                const total = Number(result?.totalCount ?? 0);

                if (!records.length) {
                    break;
                }

                loaded += records.length;

                const isLastBatch = records.length < this.batchSize || (total > 0 && loaded >= total);

                this.batchLoaded.emit({
                    table: this.selectedTable,
                    fields: [...selectedFields],
                    selectedColumns: [...this.selectedColumns],
                    conditions: [...conditions],
                    matchMode,
                    filterTree: this.filterTree,
                    insertAsNewSheet: !this.isEditMode && this.insertAsNewSheet,
                    targetSheetName: destinationSheetName,
                    rows: this.buildRows(records),
                    loaded,
                    total,
                    isFirstBatch,
                    isLastBatch
                } as SpreadsheetDataBatch & {
                    matchMode: FilterMatchMode;
                    filterTree: FilterConditionGroup | null;
                    insertAsNewSheet: boolean;
                    targetSheetName?: string;
                });

                await this.waitForPaint();

                isFirstBatch = false;
                skip += records.length;

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

            columnNames.forEach(name => {
                row[name] = this.readValue(record, name);
            });

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
        return new Promise(resolve => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
    }
}