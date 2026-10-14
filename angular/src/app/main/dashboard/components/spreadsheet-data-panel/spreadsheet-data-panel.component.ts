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
    SpreadsheetDataBatch,
    SpreadsheetSheetDataSource
} from '../../models/dashboard.model';
@Component({
    selector: 'app-spreadsheet-data-panel',
    templateUrl: './spreadsheet-data-panel.component.html',
    styleUrls: ['./spreadsheet-data-panel.component.scss']
})
export class SpreadsheetDataPanelComponent
    extends AppComponentBase
    implements OnChanges {
    @Input() visible = false;
    @Input() editSource: SpreadsheetSheetDataSource | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() batchLoaded = new EventEmitter<SpreadsheetDataBatch>();
    @Output() loadingFailed = new EventEmitter<any>();
    readonly batchSize = 10;
    step: 1 | 2 = 1;
    tables: string[] = [];
    selectedTable = '';
    tableColumns: ExtraAttribute[] = [];
    selectedColumns: ExtraAttribute[] = [];
    filterValues: Record<string, any> = {};
    filters: any[] = [];
    filterFields: ExtraAttribute[] = [];
    activeFilterValues: any[] = [];
    // Optional override for backend-specific field/operator mapping.
    @Input() filterFieldKey: 'code' | 'name' = 'code';
    @Input() conditionFactory: ((filter: any) => DynamicCondition) | null = null;


    isEditMode = false;

    onFilterValuesChanged(values: any[]): void {
        this.activeFilterValues = values;
    }
    isAdding = false;
    isLoadingTables = false;
    isLoadingColumns = false;
    tableIcons: Record<string, string> = {
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

    filterBuilderFields: FilterBuilderField[] = [];

    selectedConditions: FilterBuilderCondition[] = [];
    showFilterDialog = false;
    selectedMatchMode: 'all' | 'any' = 'all';
    constructor(
        injector: Injector,
        private appDashboardService:
            AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef,
    ) {
        super(injector);
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            if (this.editSource) {
                void this.loadEditSource();
            } else {
                this.isEditMode = false;
                this.getTablesList()
                this.reset();
            }
        }
    }

    private async loadEditSource(): Promise<void> {
        if (!this.editSource?.source) {
            return;
        }

        const source = this.editSource.source;

        this.isEditMode = true;
        this.showFilterDialog = false;
        this.selectedTable = source.sourceKey || source.type;

        const savedColumns: string[] = [...(source.columns ?? [])];

       const filters = source.filters as {
    conditions?: FilterBuilderCondition[];
    matchMode?: 'all' | 'any';
} | null;

        const savedConditions: FilterBuilderCondition[] =
            (filters?.conditions ?? []).map(condition => ({
                field: condition.field,
                operator: condition.operator,
                value: condition.value
            }));

        this.selectedColumns = [];
        this.selectedConditions = [];
        this.tableColumns = [];
        this.filterBuilderFields = [];

        try {
            await this.loadEditTableFields(this.selectedTable);

            this.selectedColumns = this.tableColumns.filter(column =>
                savedColumns.includes(column.name)
            );

            this.selectedConditions = savedConditions;
this.selectedMatchMode =
    source.mode === 'any' ? 'any' : 'all';

this.step = 2;

            this.cdr.detectChanges();
        } catch (error) {
            console.error('Failed to load existing list data:', error);
            this.loadingFailed.emit(error);
        }
    }
    private async loadEditTableFields(tableName: string): Promise<void> {
        this.isLoadingColumns = true;

        try {
            const result: ExtraAttribute[] = await firstValueFrom(
                this.appDashboardService.getTableFieldsList(tableName)
            );

            this.tableColumns = result ?? [];
            this.filterFields = [...this.tableColumns];

            this.filterBuilderFields = this.tableColumns.map(field => ({
                name: field.name,
                label: field.description || field.name,
                dataType: field.dataType || 'String--Textbox',
                options: this.mapValidEntries(field.validEntries),
                acceptMultipleValues: field.acceptMultipleValues === true
            }));
        } finally {
            this.isLoadingColumns = false;
        }
    }
    getTablesList(): void {
        this.isLoadingTables = true;
        this.appDashboardService
            .getTablesList()
            .subscribe({
                next: (result: any) => {
                    this.tables =
                        Array.isArray(result)
                            ? result
                            : [];
                    this.isLoadingTables = false;
                    this.cdr.detectChanges();
                },
                error: error => {
                    this.isLoadingTables = false;
                    this.loadingFailed.emit(
                        error
                    );
                    this.cdr.detectChanges();
                }
            });
    }
    selectTable(table: string): void {
        if (!table || this.isLoadingColumns) {
            return;
        }
        this.selectedTable = table;
        this.tableColumns = [];
        this.selectedColumns = [];
        this.filterValues = {};
        this.filters = [];
        this.filterFields = [];
        this.activeFilterValues = [];
        this.step = 2;
        this.isLoadingColumns = true;
        this.appDashboardService
            .getTableFieldsList(table)
            .subscribe({
                next: (
                    result: ExtraAttribute[]
                ) => {
                    this.tableColumns = result ?? [];
                    // this.selectedColumns = [...this.tableColumns];
                    this.filterFields = [...this.tableColumns];

                    this.filterBuilderFields = this.filterFields.map((field: any) => ({
                        name: field.name,
                        label: field.description || field.name,
                        dataType: field.dataType || 'String--Textbox',
                        options: this.mapValidEntries(field.validEntries),
                        acceptMultipleValues: field.acceptMultipleValues === true
                    }));
                    this.isLoadingColumns = false;
                    this.cdr.detectChanges();
                },
                error: error => {
                    this.tableColumns = [];
                    this.selectedColumns = [];
                    this.isLoadingColumns = false;
                    this.loadingFailed.emit(
                        error
                    );
                    this.cdr.detectChanges();
                }
            });
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
                return {
                    label: String(item),
                    value: item
                };
            }

            return {
                label: String(
                    item.label ??
                    item.description ??
                    item.name ??
                    item.text ??
                    item.value ??
                    item.code ??
                    item.id
                ),
                value:
                    item.value ??
                    item.code ??
                    item.id ??
                    item.name
            };
        });
    }
   backToEntities(): void {
    if (this.isAdding || this.isEditMode) {
        return;
    }

    this.step = 1;
    this.selectedTable = '';
    this.tableColumns = [];
    this.selectedColumns = [];
    this.filterValues = {};
    this.filters = [];
    this.filterFields = [];
    this.activeFilterValues = [];
}
    getColumnKey(column: ExtraAttribute): string {
        return column?.name ?? '';
    }
    getColumnLabel(
        column: ExtraAttribute
    ): string {
        return column?.description ?? '';
    }
    isColumnSelected(
        column: ExtraAttribute
    ): boolean {
        return this.selectedColumns.some(
            selected =>
                selected.attributeId ===
                column.attributeId
        );
    }
    toggleColumn(
        column: ExtraAttribute,
        event: Event
    ): void {
        const input =
            event.target as HTMLInputElement;
        if (input.checked) {
            if (
                !this.selectedColumns.some(
                    selected =>
                        selected.attributeId ===
                        column.attributeId
                )
            ) {
                this.selectedColumns = [
                    ...this.selectedColumns,
                    column
                ];
            }
            return;
        }
        this.selectedColumns =
            this.selectedColumns.filter(
                selected =>
                    selected.attributeId !==
                    column.attributeId
            );
    }
    selectAllColumns(): void {
        this.selectedColumns = [
            ...this.tableColumns
        ];
    }
    clearColumns(): void {
        this.selectedColumns = [];
    }


    getConditionFieldLabel(fieldName: string): string {
    const field = this.filterBuilderFields.find(
        f => f.name === fieldName
    );

    return field?.label || fieldName;
}

getConditionOperatorLabel(operator: string): string {
    const operators: Record<string, string> = {
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

    return operators[operator] || operator;
}

getConditionValueLabel(condition: FilterBuilderCondition): string {
    const value = condition.value;

    if (value === null || value === undefined || value === '') {
        return '""';
    }

    const field = this.filterBuilderFields.find(
        f => f.name === condition.field
    );

    const option = field?.options?.find(
        o => String(o.value) === String(value)
    );

    if (option) return option.label;

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}


    private gatherConditions(): DynamicCondition[] {
        return this.selectedConditions.map(condition => {
            const dto = new DynamicCondition();

            dto.field = condition.field;
            dto.operator = condition.operator;
            dto.value = this.formatConditionValue(condition.value);

            return dto;
        });
    }

    /** Dates -> "yyyy-MM-dd", everything else -> string (matches the API format). */
    private formatConditionValue(value: any): string {
        if (value instanceof Date) {
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, '0');
            const d = String(value.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        return String(value);
    }


    async addSheet(): Promise<void> {

        if (
            !this.selectedTable ||
            !this.selectedColumns.length ||
            this.isAdding
        ) {
            return;
        }

        const tenantId = this.appSession?.tenantId;

        const selectedFields: string[] = this.selectedColumns
            .map(column => column.name)
            .filter((field): field is string => !!field);

        const requestFields: string[] = [...selectedFields];

        if (!requestFields.some(field => field.toLowerCase() === 'id')) {
            requestFields.push('Id');
        }

        const conditions = this.gatherConditions();

        let skip = 0;
        let loaded = 0;
        let firstBatch = true;

        this.isAdding = true;

        try {

            while (true) {

                const result: any = await firstValueFrom(
                    this.appDashboardService.getAllTableData(
                        tenantId,
                        this.selectedTable,
                        requestFields,
                        conditions,
                        undefined,
                      this.selectedMatchMode == 'all'?  false : true,
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

                const rows = this.buildRows(records);

                if (firstBatch) {
                    console.log(
                        '[Spreadsheet] Backend columns:',
                        Object.keys(records[0] ?? {})
                    );

                    console.log(
                        '[Spreadsheet] Emitted columns:',
                        Object.keys(rows[0] ?? {})
                    );
                }

                loaded += records.length;

                const isLastBatch =
                    records.length < this.batchSize ||
                    (total > 0 && loaded >= total);

               this.batchLoaded.emit({
    table: this.selectedTable,
    fields: [...selectedFields],
    selectedColumns: [...this.selectedColumns],
    conditions: [...conditions],
    matchMode: this.selectedMatchMode,
    rows,
    loaded,
    total,
    isFirstBatch: firstBatch,
    isLastBatch
} as SpreadsheetDataBatch & {
    matchMode: 'all' | 'any';
});

                await this.waitForPaint();

                firstBatch = false;
                skip += records.length;

                if (isLastBatch) {
                    break;
                }
            }

            if (loaded === 0) {
                this.notify.info('No records found.');
            }

        } catch (error) {
            console.error(
                '[Spreadsheet Data Panel] load failed:',
                error
            );

            this.loadingFailed.emit(error);

        } finally {
            this.isAdding = false;
            this.cdr.detectChanges();
        }
    }


    private buildRows(records: { [key: string]: any }[]): any[] {
        return records.map(record => {
            const row: any = {};

            // Always include Id as the first column.
            row['Id'] = this.getRecordValue(record, 'Id');

            // Include the selected fields after Id.
            this.selectedColumns.forEach(column => {
                const field = this.getColumnKey(column);

                if (!field || field.toLowerCase() === 'id') {
                    return;
                }

                row[field] = this.getRecordValue(record, field);
            });

            return row;
        });
    }
    private getRecordValue(
        record: any,
        key: string
    ): any {
        if (
            !record ||
            !key
        ) {
            return '';
        }
        if (
            record[key] !== undefined
        ) {
            return this.normalizeCellValue(
                record[key]
            );
        }
        const actualKey =
            Object.keys(record)
                .find(
                    property =>
                        property
                            .toLowerCase() ===
                        key.toLowerCase()
                );
        if (!actualKey) {
            return '';
        }
        return this.normalizeCellValue(
            record[actualKey]
        );
    }
    private normalizeCellValue(
        value: any
    ): any {
        if (
            value === null ||
            value === undefined
        ) {
            return '';
        }
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            return value;
        }
        if (value instanceof Date) {
            return this.formatDate(
                value
            );
        }
        if (Array.isArray(value)) {
            return value
                .map(item =>
                    this.normalizeCellValue(
                        item
                    )
                )
                .join(', ');
        }
        if (
            typeof value === 'object'
        ) {
            if (
                value.name !== undefined
            ) {
                return value.name;
            }
            if (
                value.label !== undefined
            ) {
                return value.label;
            }
            if (
                value.value !== undefined
            ) {
                return value.value;
            }
            return JSON.stringify(
                value
            );
        }
        return String(value);
    }

    getTableIcon(
        tableName: string
    ): string {
        return (
            this.tableIcons[
            tableName
            ] ||
            'fa fa-database'
        );
    }
    private formatDate(
        value: any
    ): string {
        if (!value) {
            return '';
        }
        const date =
            new Date(value);
        return Number.isNaN(
            date.getTime()
        )
            ? String(value)
            : date.toLocaleDateString();
    }
    private waitForPaint():
        Promise<void> {
        return new Promise(
            resolve => {
                requestAnimationFrame(
                    () => {
                        requestAnimationFrame(
                            () =>
                                resolve()
                        );
                    }
                );
            }
        );
    }
    closePanel(): void {
        if (this.isAdding) {
            return;
        }
        this.reset();
        this.close.emit();
    }


    openFilterDialog(): void {
        if (this.isAdding) {
            return;
        }

        this.showFilterDialog = true;
    }

    closeFilterDialog(): void {
        this.showFilterDialog = false;
    }

    onFiltersApplied(conditions: FilterBuilderCondition[]): void {
        this.selectedConditions = conditions;
        this.showFilterDialog = false;
    }


    onFilterMatchModeChanged(mode: 'all' | 'any'): void {
        this.selectedMatchMode = mode;
    }
    reset(): void {
        this.step = 1;
        this.selectedTable = '';
        this.tableColumns = [];
        this.selectedColumns = [];
        this.filterValues = {};
        this.filters = [];
        this.filterFields = [];
        this.activeFilterValues = [];
        this.isLoadingColumns = false;
        this.selectedConditions = [];
        this.filterBuilderFields = [];
        this.selectedMatchMode = 'all';
        this.showFilterDialog = false;
        this.isEditMode = false;
    }


selectedTableForNext: string | null = null;

chooseTable(table: string): void {
    this.selectedTableForNext = table;
}

goToColumnsStep(): void {
    if (!this.selectedTableForNext) return;

    // Existing function loads columns and moves to step 2
    this.selectTable(this.selectedTableForNext);
}

}
