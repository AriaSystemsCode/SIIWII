import {
    ChangeDetectorRef,
    Component,
    Injector,
    OnInit,
    ViewChild
} from '@angular/core';

import {
    AbstractControl,
    FormBuilder,
    FormGroup
} from '@angular/forms';

import { Paginator } from 'primeng/paginator';
import { SelectItem } from 'primeng/api';

import { finalize, firstValueFrom } from 'rxjs';

import {
    SpreadsheetComponent as SyncfusionSpreadsheetComponent,
    SheetModel
} from '@syncfusion/ej2-angular-spreadsheet';

import {
    AppTransactionServiceProxy,
    SycEntityObjectStatusesServiceProxy,
    SycEntityObjectTypesServiceProxy
} from '@shared/service-proxies/service-proxies';

import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import {
    TransactionInformationComponent
} from '../../app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component';

import {
    TransactionCartMode
} from '../../enums/TransactionCartMode';

import {
    DisplayOption,
    FieldListService,
    GroupingBarService,
    PivotChartService,
    IDataSet
} from '@syncfusion/ej2-angular-pivotview';


interface TransactionSpreadsheetRow {
    TransactionNumber: string;
    TransactionType: string;
    Seller: string;
    Buyer: string;
    Status: string;
    CreatedDate: string;
    CompleteDate: string;
    Reference: string;
    Creator: string;
    Currency: string;
    Quantity: number;
    Amount: number;
}

@Component({
    selector: 'appTransBrowse',
    templateUrl: './appTransBrowse.component.html',
    styleUrls: ['./appTransBrowse.component.scss'],
    animations: [appModuleAnimation()],
      providers: [
        FieldListService,
        GroupingBarService,
        PivotChartService
    ]
})
export class AppTransactionsBrowseComponent
    extends AppComponentBase
    implements OnInit {

    // =====================================================
    // VIEW CHILDREN
    // =====================================================

    @ViewChild('shoppingCartModal', { static: true })
    shoppingCartModal: TransactionInformationComponent;

    @ViewChild('dataTable', { static: true })
    dataTable: any;

    @ViewChild('paginator', { static: true })
    paginator: Paginator;

    @ViewChild('dataDetailTable', { static: true })
    dataDetailTable: any;

    @ViewChild('spreadsheet')
    spreadsheet?: SyncfusionSpreadsheetComponent;

    @ViewChild('pivotView')
    pivotView: any;

    // =====================================================
    // FILTERS / PAGE STATE
    // =====================================================

    filterForm: FormGroup;

    pageMainFilters: any[] = [];
    showMainFiltersOptions = true;
    showAddButton = true;
    defaultMainFilter: any;

    filterText = '';

    roles: any[] = [];
    modalheaderName: string;
    formType: string;
    orderNo: string;
    fullName = '';
    display = false;

    filterTransType: SelectItem[] = [];
    filterStatus: SelectItem[] = [];

    loading = false;
    advancedFiltersAreShown = false;

    sellerNameFilter = '';
    buyerNameFilter = '';
    codeFilter = '';

    statusFilter: number;

    maxCreateDateFilter: moment.Moment;
    minCreateDateFilter: moment.Moment;
    maxCompleteDateFilter: moment.Moment;
    minCompleteDateFilter: moment.Moment;

    orderId = 0;

    showHeader = true;
    showDetails = false;

    selectedProduct: any;

    variationDetails: any[] = [];

    transactionTypeFilter: number;
    transactionNumberFilter = '';
    variationCodeFilter = '';
    referenceNumberFilter = '';

    minPrice: number;
    maxPrice: number;
    minAmount: number;
    maxAmount: number;

    totalRecords = 0;
    page = 0;
    rowsPerPage = 10;

    sortField: string | undefined;
    sortOrder: number | undefined;

    isAmountReset = false;
    isReset = false;
    isTypeReset = false;

    currentLang: string;
    isArabic = false;

    // =====================================================
    // TABLE SELECTION
    // =====================================================

    selectedTransactions: any[] = [];

    // =====================================================
    // SPREADSHEET STATE
    // =====================================================

    showSpreadsheetDialog = false;

    spreadsheetRows: TransactionSpreadsheetRow[] = [];

    sheets: SheetModel[] = [];

    spreadsheetOpenUrl =
    'https://services.syncfusion.com/angular/production/api/spreadsheet/open';

spreadsheetSaveUrl =
    'https://services.syncfusion.com/angular/production/api/spreadsheet/save';


    isOpeningSavedSpreadsheet = false;
    savedSpreadsheets: SavedSpreadsheet[] = [];
    currentSavedSpreadsheetId: number | null = null;

    // =====================================================
    // SPREADSHEET PERFORMANCE
    // =====================================================

    readonly spreadsheetScrollSettings: any = {
        enableVirtualization: true,
        isFinite: false
    };

    /**
     * Disables SUM / AVG / COUNT / MIN / MAX calculations when the user
     * selects a very large range. Bind with [showAggregate]="false".
     */
    readonly spreadsheetShowAggregate = false;

    /**
     * Open-All and full refresh are loaded from the existing GetAll API in
     * smaller requests until the BE delta-refresh endpoint is available.
     */
    // TEST with 39 records: 10 => 4 requests (10 + 10 + 10 + 9).
    // Production: change this to 500 or 1000 after verification.
    private readonly spreadsheetBatchSize = 10;

    spreadsheetLoadingProgress = 0;
    spreadsheetLoadingMessage = '';
    spreadsheetStillLoading = false;
    spreadsheetLoadedCount = 0;
    spreadsheetTotalCount = 0;

    /**
     * Keep formulas/styles/charts because they are part of the user's saved
     * analysis. Images and notes are not used by this transaction workbook,
     * so excluding them reduces save/open JSON work.
     *
     * Cast through any when calling saveAsJson/openFromJson because this
     * project is pinned to Syncfusion 20.4.x while the newer typing exposes
     * SerializationOptions explicitly.
     */
    private readonly spreadsheetJsonSerializationOptions: any = {
        ignoreImage: true,
        ignoreNote: true
    };

    private previousSpreadsheetCalculationMode: any = null;

    // =====================================================
    // ODOO-STYLE ADD DATA SOURCE
    // =====================================================
    showSpreadsheetDataPanel = false;
    addDataStep: 1 | 2 = 1;
    selectedAddDataEntityKey: string | null = null;
    addDataDefinition: SpreadsheetEntityDefinition | null = null;
    selectedAddDataColumns: string[] = [];
    addDataFilters: Record<string, any> = {};
    addingSpreadsheetData = false;

    readonly spreadsheetEntityDefinitions: SpreadsheetEntityDefinition[] = [
        { sourceKey: 'TRANSACTIONS', displayName: 'Transactions', icon: 'fa fa-exchange-alt',
          columns: [
            { key:'TransactionNumber', label:'Transaction Number', type:'string', defaultSelected:true },
            { key:'TransactionType', label:'Transaction Type', type:'string', defaultSelected:true },
            { key:'Seller', label:'Seller', type:'string', defaultSelected:true },
            { key:'Buyer', label:'Buyer', type:'string', defaultSelected:true },
            { key:'Status', label:'Status', type:'string', defaultSelected:true },
            { key:'CreatedDate', label:'Created Date', type:'date', defaultSelected:true },
            { key:'CompleteDate', label:'Complete Date', type:'date' },
            { key:'Reference', label:'Reference', type:'string' },
            { key:'Creator', label:'Creator', type:'string' },
            { key:'Currency', label:'Currency', type:'string' },
            { key:'Quantity', label:'Quantity', type:'number', defaultSelected:true },
            { key:'Amount', label:'Amount', type:'number', defaultSelected:true }
          ],
          filters: [
            { key:'search', label:'Search', type:'string' },
            { key:'codeFilter', label:'Transaction Number', type:'string' },
            { key:'sellerNameFilter', label:'Seller', type:'string' },
            { key:'buyerNameFilter', label:'Buyer', type:'string' },
            { key:'statusFilter', label:'Status', type:'statusLookup' },
            { key:'minCreateDateFilter', label:'Created From', type:'date' },
            { key:'maxCreateDateFilter', label:'Created To', type:'date' },
            { key:'referenceNumberFilter', label:'Reference', type:'string' }
          ] },
        { sourceKey:'ITEMS', displayName:'Items', icon:'fa fa-box',
          columns: [
            { key:'Code', label:'Code', type:'string', defaultSelected:true },
            { key:'Name', label:'Name', type:'string', defaultSelected:true },
            { key:'Brand', label:'Brand', type:'string', defaultSelected:true },
            { key:'AvailableQuantity', label:'Available Quantity', type:'number', defaultSelected:true },
            { key:'Price', label:'Price', type:'number', defaultSelected:true }
          ],
          filters: [
            { key:'search', label:'Search', type:'string' },
            { key:'brandId', label:'Brand', type:'number' },
            { key:'onlyAvailableStock', label:'Available Stock Only', type:'boolean' }
          ] }
    ];

    // =====================================================
    // PIVOT / ANALYSIS STATE
    // =====================================================

    showPivotDialog = false;

    pivotData: IDataSet[] = [];



    pivotDisplayOption = {
        view: 'Both',
        primary: 'Table'
    } as DisplayOption;

    pivotReportOptions = [
        { label: 'Transactions by Seller', value: 'transactionsBySeller' },
        { label: 'Transactions by Buyer', value: 'transactionsByBuyer' },
        { label: 'Sales Orders Count', value: 'salesOrderCount' },
        { label: 'Purchase Orders Count', value: 'purchaseOrderCount' },
        { label: 'Sales Orders by Seller', value: 'salesOrdersBySeller' },
        { label: 'Purchase Orders by Seller', value: 'purchaseOrdersBySeller' },
        {
            label: 'Sales Orders per Week - Current Month',
            value: 'salesOrdersPerWeekCurrentMonth'
        }
    ];

    selectedPivotReport = 'transactionsBySeller';

    pivotChartTypes = [
        { label: 'Column', value: 'Column' },
        { label: 'Bar', value: 'Bar' },
        { label: 'Line', value: 'Line' },
        { label: 'Area', value: 'Area' },
        { label: 'Pie', value: 'Pie' },
        { label: 'Doughnut', value: 'Doughnut' },
        { label: 'Funnel', value: 'Funnel' },
        { label: 'Pyramid', value: 'Pyramid' }
    ];

    selectedPivotChartType = 'Column';

    pivotAggregateTypes = [
        'Sum',
        'Count',
        'DistinctCount',
        'Avg',
        'Min',
        'Max'
    ];

    pivotChartSettings: any = {
        chartSeries: {
            type: 'Column'
        },
            height: '280',
        title: 'Pivot Chart',
        enableMultipleAxis: false
    };

    pivotDataSourceSettings: any = {
    dataSource: [],

    rows: [],
    columns: [],
    values: [],
    filters: [],

    enableSorting: true,
    allowLabelFilter: true,
    allowValueFilter: true
};


currentSpreadsheetFilters: any = null;
    // Legacy/current active-sheet source. Kept for backward compatibility.
    currentSpreadsheetSource: SpreadsheetDataSource | null = null;

    // NEW: every Spreadsheet tab owns its own source + filters.
    // This metadata is stored OUTSIDE Syncfusion workbookJson.
    sheetDataSources: SpreadsheetSheetDataSource[] = [];

    // Watches Syncfusion's active sheet because EJ2 20.4.x does not reliably
    // emit a usable Angular event when the user clicks a sheet tab.
    private spreadsheetSheetWatcher: any = null;
    private lastSpreadsheetActiveSheetIndex = -1;

    showSpreadsheetDestinationDialog = false;
    pendingSpreadsheetOpenMode: 'SelectedRecords' | 'AllRecords' = 'SelectedRecords';
    pendingSpreadsheetDestination: 'new' | 'existing' = 'new';
    pendingExistingSpreadsheetId: number | null = null;
    private progressiveTargetSheetName = 'Transactions';

    sheetAnalyses: SavedSheetAnalysis[] = [];
    currentPivotSheetName: string | null = null;


    constructor(
        injector: Injector,
        private _appTransactionServiceProxy:
            AppTransactionServiceProxy,
        private _formBuilder: FormBuilder,
        private _sycEntityObjectTypesServiceProxy:
            SycEntityObjectTypesServiceProxy,
        private _sycEntityObjectStatusesAppService:
            SycEntityObjectStatusesServiceProxy,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);

        this.tenantRoleService.loadRoles();
    }

    // =====================================================
    // LIFECYCLE
    // =====================================================

    ngOnInit(): void {
        this.currentLang =
            abp.utils.getCookieValue(
                'Abp.Localization.CultureName'
            );

        this.isArabic =
            this.currentLang === 'ar' ||
            this.currentLang === 'ar-EG';

        this.showHeader = true;

        this.setPageMainFilters();
        this.initFilterForm();
        this.loadSavedSpreadsheets();
    }

    // =====================================================
    // ODOO-STYLE: ENTITY -> COLUMNS -> FILTERS -> NEW TAB
    // =====================================================
    openAddSpreadsheetData(): void {
        this.addDataStep = 1;
        this.selectedAddDataEntityKey = null;
        this.addDataDefinition = null;
        this.selectedAddDataColumns = [];
        this.addDataFilters = {};
        this.showSpreadsheetDataPanel = true;
        this.cdr.detectChanges();
    }

    closeSpreadsheetDataPanel(): void {
        this.showSpreadsheetDataPanel = false;
    }

    onSpreadsheetEntityDropdownChange(sourceKey: string | null): void {
        if (!sourceKey) {
            this.selectedAddDataEntityKey = null;
            this.addDataDefinition = null;
            this.selectedAddDataColumns = [];
            this.addDataFilters = {};
            this.addDataStep = 1;
            return;
        }

        this.selectSpreadsheetEntity(sourceKey);
    }

    private spreadsheetDataSourceClickHandler: ((event: Event) => void) | null = null;

    private bindSpreadsheetDataSourceRibbonClick(): void {
        this.unbindSpreadsheetDataSourceRibbonClick();

        this.spreadsheetDataSourceClickHandler = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            const button = target.closest(
                '#siiwii_spreadsheet_data_source, [id*="siiwii_spreadsheet_data_source"]'
            ) as HTMLElement | null;

            if (!button) return;

            event.preventDefault();
            event.stopPropagation();
            this.openAddSpreadsheetData();
        };

        document.addEventListener('click', this.spreadsheetDataSourceClickHandler, true);
    }

    private unbindSpreadsheetDataSourceRibbonClick(): void {
        if (!this.spreadsheetDataSourceClickHandler) return;

        document.removeEventListener('click', this.spreadsheetDataSourceClickHandler, true);
        this.spreadsheetDataSourceClickHandler = null;
    }

    /**
     * Adds Siiwii's Data Source command to Syncfusion's native Insert ribbon.
     * Syncfusion 20.4.x exposes addToolbarItems at runtime even when typings
     * differ between patch versions, therefore the call is intentionally `any`.
     */
    private addSpreadsheetDataSourceRibbonCommand(): void {
        if (!this.spreadsheet) {
            return;
        }

        const spreadsheet: any = this.spreadsheet as any;

        if (typeof spreadsheet.addToolbarItems !== 'function') {
            console.warn('[Spreadsheet] addToolbarItems is not available in this Syncfusion build.');
            return;
        }

        try {
            spreadsheet.addToolbarItems(
                'Insert',
                [
                    {
                        id: 'siiwii_spreadsheet_data_source',
                        type: 'Button',
                        text: 'siiwii list',
                        tooltipText: 'Insert Siiwii data source',
                        prefixIcon: 'e-icons e-database',
                        click: () => this.openAddSpreadsheetData()
                    }
                ],
                0
            );
        } catch (error) {
            console.warn('[Spreadsheet] Unable to add Data Source ribbon command:', error);
        }
    }

    onSpreadsheetRibbonClick(args: any): void {
        const itemId =
            args?.item?.id ??
            args?.originalEvent?.target?.id ??
            args?.target?.id ??
            '';

        if (String(itemId).includes('siiwii_spreadsheet_data_source')) {
            this.openAddSpreadsheetData();
        }
    }

    selectSpreadsheetEntity(sourceKey: string): void {
        const definition = this.spreadsheetEntityDefinitions.find(x => x.sourceKey === sourceKey);
        if (!definition) return;
        this.selectedAddDataEntityKey = sourceKey; this.addDataDefinition = definition;
        this.selectedAddDataColumns = definition.columns.filter(x => x.defaultSelected).map(x => x.key);
        this.addDataFilters = {}; this.addDataStep = 2;
    }

    backToSpreadsheetEntitySelection(): void {
        this.addDataStep = 1; this.selectedAddDataEntityKey = null;
        this.addDataDefinition = null; this.selectedAddDataColumns = []; this.addDataFilters = {};
    }

    isAddDataColumnSelected(key: string): boolean { return this.selectedAddDataColumns.includes(key); }

    toggleAddDataColumnEvent(key: string, event: any): void {
        this.toggleAddDataColumn(key, !!event?.target?.checked);
    }

    toggleAddDataColumn(key: string, checked: boolean): void {
        if (checked) {
            if (!this.selectedAddDataColumns.includes(key)) this.selectedAddDataColumns = [...this.selectedAddDataColumns, key];
        } else this.selectedAddDataColumns = this.selectedAddDataColumns.filter(x => x !== key);
    }

    selectAllAddDataColumns(): void { this.selectedAddDataColumns = this.addDataDefinition?.columns.map(x => x.key) ?? []; }
    clearAddDataColumns(): void { this.selectedAddDataColumns = []; }

    private getUniqueSpreadsheetSheetName(baseName: string): string {
        const names = new Set((this.spreadsheet?.sheets ?? []).map((x:any) => String(x?.name ?? '').trim()));
        let name = baseName, i = 2; while (names.has(name)) name = `${baseName} (${i++})`; return name;
    }

    private buildSelectedTransactionSpreadsheetRows(records: any[]): any[] {
        const selected = new Set(this.selectedAddDataColumns);
        return records.map(record => {
            const fullRow:any = this.mapTransactionToSpreadsheetRow(record); const row:any = {};
            (this.addDataDefinition?.columns ?? []).forEach(column => {
                if (selected.has(column.key)) row[column.label] = fullRow[column.key];
            });
            return row;
        });
    }

    async insertConfiguredDataAsNewTab(): Promise<void> {
    if (!this.spreadsheet || !this.addDataDefinition) {
        return;
    }

    if (!this.selectedAddDataColumns.length) {
        this.notify.warn('Please select at least one column.');
        return;
    }

    const sourceKey = this.addDataDefinition.sourceKey;

    if (sourceKey !== 'TRANSACTIONS') {
        this.notify.warn(
            `${this.addDataDefinition.displayName} data source is not connected yet.`
        );
        return;
    }

    this.addingSpreadsheetData = true;

    try {
        const filters: SpreadsheetFilters = {
            ...(this.addDataFilters as SpreadsheetFilters),
            statusFilter:
                this.addDataFilters.statusFilter == null ||
                Number(this.addDataFilters.statusFilter) === 0
                    ? undefined
                    : Number(this.addDataFilters.statusFilter)
        };

        const records =
            await this.loadSpreadsheetTransactionsInBatches(filters);

        const rows =
            this.buildSelectedTransactionSpreadsheetRows(records);

        const sheetName =
            this.getUniqueSpreadsheetSheetName(
                this.addDataDefinition.displayName
            );

        const newSheet: any = {
            name: sheetName,
            ranges: [{
                dataSource: rows,
                startCell: 'A1',
                showFieldAsHeader: true
            }]
        };

        (this.spreadsheet as any).insertSheet([newSheet]);

        // EJ2 20.4.x needs time to finish creating the SheetModel.
        // Do not force dataBind() here; charts use the same overlay/workbook model.
        await this.yieldToBrowser();
        await this.yieldToBrowser();

        const spreadsheetSheets: any[] =
            (this.spreadsheet as any).sheets ?? [];

        const insertedSheetIndex =
            spreadsheetSheets.findIndex(
                (sheet: any) => sheet?.name === sheetName
            );

        if (insertedSheetIndex < 0) {
            throw new Error(
                `Inserted sheet "${sheetName}" was not found.`
            );
        }

        const insertedSheet =
            spreadsheetSheets[insertedSheetIndex];

        this.upsertSheetDataSource({
            sheetId: insertedSheet?.id,
            sheetName,
            source: {
                type: this.addDataDefinition.displayName,
                sourceKey,
                mode: 'AllRecords',
                columns: [...this.selectedAddDataColumns],
                filters: { ...filters }
            }
        });

        (this.spreadsheet as any).activeSheetIndex =
            insertedSheetIndex;

        await this.yieldToBrowser();
        await this.yieldToBrowser();

        this.syncActiveSheetSourceToUi();
        this.showSpreadsheetDataPanel = false;
        this.refreshSpreadsheetLayout();

        this.notify.success(
            `${sheetName} added successfully.`
        );
    } catch (error) {
        console.error(
            '[Spreadsheet Add Data] failed:',
            error
        );

        this.notify.error(
            'Unable to add the data source to the Spreadsheet.'
        );
    } finally {
        this.addingSpreadsheetData = false;
        this.cdr.detectChanges();
    }
}

async openPivotAnalysis(
    savedAnalysis?: SavedSheetAnalysis
): Promise<void> {

    if (!this.spreadsheet) {
        this.notify.warn('Spreadsheet is not ready.');
        return;
    }

    try {
        // ==========================================
        // 1. GET CURRENT SPREADSHEET SHEET
        // ==========================================
        const sheet = this.spreadsheet.getActiveSheet();

        if (!sheet) {
            this.notify.warn('No active spreadsheet found.');
            return;
        }

        this.currentPivotSheetName = sheet.name;

        // ==========================================
        // 2. GET USED RANGE
        // ==========================================
        const lastRowIndex = sheet.usedRange?.rowIndex ?? 0;
        const lastColIndex = sheet.usedRange?.colIndex ?? 0;

        if (lastRowIndex < 1 || lastColIndex < 0) {
            this.notify.warn('Spreadsheet has no data.');
            return;
        }

        const lastRow = lastRowIndex + 1;
        const lastColumn = this.getColumnName(lastColIndex);
        const range = `${sheet.name}!A1:${lastColumn}${lastRow}`;

        console.log('Pivot source sheet:', sheet.name);
        console.log('Pivot source range:', range);

        // ==========================================
        // 3. READ CURRENT SHEET DATA
        // ==========================================
        const spreadsheetData = await this.spreadsheet.getData(range);

        // ==========================================
        // 4. CONVERT CURRENT SHEET TO PIVOT DATA
        // ==========================================
        this.pivotData = this.convertSpreadsheetToPivotData(
            spreadsheetData,
            lastRowIndex,
            lastColIndex
        ) as IDataSet[];

        if (!this.pivotData.length) {
            this.notify.warn('No spreadsheet records found.');
            return;
        }

        const fieldMapping = this.createDynamicPivotFieldMapping(
            this.pivotData
        );

        // ==========================================
        // 5. NEW PIVOT OR RESTORE SAVED PIVOT
        // ==========================================
        this.pivotDataSourceSettings = {
            dataSource: this.pivotData,
            rows: savedAnalysis
                ? this.clonePivotSetting(savedAnalysis.pivot.rows)
                : [],
            columns: savedAnalysis
                ? this.clonePivotSetting(savedAnalysis.pivot.columns)
                : [],
            values: savedAnalysis
                ? this.clonePivotSetting(savedAnalysis.pivot.values)
                : [],
            filters: savedAnalysis
                ? this.clonePivotSetting(savedAnalysis.pivot.filters)
                : [],
            filterSettings: savedAnalysis
                ? this.clonePivotSetting(
                    savedAnalysis.pivot.filterSettings ?? []
                )
                : [],
            sortSettings: savedAnalysis
                ? this.clonePivotSetting(
                    savedAnalysis.pivot.sortSettings ?? []
                )
                : [],
            enableSorting: true,
            allowLabelFilter: true,
            allowValueFilter: true,
            fieldMapping
        };

        // ==========================================
        // 6. RESTORE SAVED CHART SETTINGS
        // ==========================================
        if (savedAnalysis) {
            this.selectedPivotChartType =
                savedAnalysis.chart?.type || 'Column';

            this.pivotChartSettings = {
                ...this.pivotChartSettings,
                height: '280',
                title:
                    savedAnalysis.chart?.title ||
                    `${sheet.name} Pivot Chart`,
                enableMultipleAxis:
                    savedAnalysis.chart?.enableMultipleAxis ?? false,
                chartSeries: {
                    ...(this.pivotChartSettings?.chartSeries ?? {}),
                    type: this.selectedPivotChartType
                }
            };
        } else {
            this.selectedPivotChartType = 'Column';

            this.pivotChartSettings = {
                ...this.pivotChartSettings,
                height: '280',
                title: `${sheet.name} Pivot Chart`,
                chartSeries: {
                    ...(this.pivotChartSettings?.chartSeries ?? {}),
                    type: 'Column'
                }
            };
        }

        // ==========================================
        // 7. OPEN PIVOT DIALOG
        // ==========================================
        this.showPivotDialog = false;
        this.cdr.detectChanges();

        setTimeout(() => {
            this.showPivotDialog = true;
            this.cdr.detectChanges();
        });

    } catch (error) {
        console.error(
            'Unable to build Pivot from Spreadsheet:',
            error
        );

        this.notify.error('Failed to read spreadsheet data.');
    }
}

private convertSpreadsheetToPivotData(
    data: any,
    lastRowIndex: number,
    lastColIndex: number
): any[] {

    const rows: any[][] = [];


    // ==========================================
    // READ CELL VALUES INTO MATRIX
    // ==========================================

    for (
        let rowIndex = 0;
        rowIndex <= lastRowIndex;
        rowIndex++
    ) {

        const row: any[] = [];

        for (
            let colIndex = 0;
            colIndex <= lastColIndex;
            colIndex++
        ) {

            const cellAddress =
                `${this.getColumnName(
                    colIndex
                )}${rowIndex + 1}`;


            const cell =
                data.get
                    ? data.get(
                        cellAddress
                    )
                    : data[
                        cellAddress
                    ];


            let value =
                cell?.value;


            // If formula exists and calculated value exists,
            // value is normally already the calculated value.

            if (
                value === undefined ||
                value === null
            ) {
                value = '';
            }


            row.push(
                value
            );
        }

        rows.push(
            row
        );
    }


    if (!rows.length) {
        return [];
    }


    // ==========================================
    // FIRST ROW = HEADERS
    // ==========================================

    const headers =
        rows[0].map(
            (
                header,
                index
            ) => {

                const text =
                    String(
                        header ?? ''
                    ).trim();

                return text ||
                    `Column${index + 1}`;
            }
        );


    console.log(
        'Spreadsheet Headers:',
        headers
    );


    // ==========================================
    // OTHER ROWS = RECORDS
    // ==========================================

    const records =
        rows
            .slice(1)
            .filter(row =>
                row.some(
                    value =>
                        value !== '' &&
                        value !== null &&
                        value !== undefined
                )
            )
            .map(row => {

                const record: any =
                    {};

                headers.forEach(
                    (
                        header,
                        index
                    ) => {

                  record[header] =
    this.normalizePivotValue(
        row[index],
        header
    );
                    }
                );

                return record;
            });


    return records;
}
onPivotEnginePopulated(): void {

    if (!this.pivotView) {
        return;
    }

    const settings =
        this.pivotView.dataSourceSettings;

    if (!settings?.values?.length) {
        return;
    }

    let changed = false;

    settings.values.forEach(
        (field: any) => {

            const fieldName =
                String(field.name ?? '')
                    .replace(/\s/g, '')
                    .toLowerCase();

            if (
                fieldName ===
                    'transactionnumber' &&
                field.type !== 'Count'
            ) {
                field.type = 'Count';
                field.caption =
                    'Transaction Count';

                changed = true;
            }
        }
    );

    if (changed) {
        this.pivotView.dataSourceSettings =
            settings;
    }
}
private normalizePivotValue(
    value: any,
    fieldName?: string
): any {

    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    // ==========================================
    // IDENTIFIER FIELDS MUST STAY STRING
    // ==========================================

    const normalizedField =
        String(fieldName ?? '')
            .replace(/\s/g, '')
            .toLowerCase();

    if (
        normalizedField === 'transactionnumber'
    ) {
        return String(value).trim();
    }

    // ==========================================
    // BOOLEAN
    // ==========================================

    if (typeof value === 'boolean') {
        return value;
    }

    // ==========================================
    // NUMBER
    // ==========================================

    if (typeof value === 'number') {
        return value;
    }

    const text =
        String(value).trim();

    if (!text) {
        return '';
    }

    // ==========================================
    // NUMERIC VALUE
    // ==========================================

    const numericValue =
        Number(text);

    if (
        !Number.isNaN(numericValue)
    ) {
        return numericValue;
    }

    return text;
}

private createDynamicPivotFieldMapping(
    records: any[]
): any[] {

    if (!records?.length) {
        return [];
    }

    const firstRecord = records[0];

    return Object.keys(firstRecord).map(fieldName => {

        const values = records
            .map(record => record[fieldName])
            .filter(value =>
                value !== '' &&
                value !== null &&
                value !== undefined
            );

        const isTransactionNumber =
            fieldName
                .replace(/\s/g, '')
                .toLowerCase() ===
            'transactionnumber';

        const isNumeric =
            !isTransactionNumber &&
            values.length > 0 &&
            values.every(
                value =>
                    typeof value === 'number'
            );

        return {
            name: fieldName,
            caption: fieldName,

            dataType:
                isNumeric
                    ? 'number'
                    : 'string',

            // IMPORTANT
            // TransactionNumber should COUNT,
            // not SUM.
            type:
                isTransactionNumber
                    ? 'Count'
                    : undefined
        };
    });
}


private clonePivotSetting(
    value: any
): any {

    return JSON.parse(
        JSON.stringify(
            value ?? []
        )
    );
}
async savePivotToDashboard(): Promise<void> {

    if (!this.pivotView || !this.spreadsheet) {
        this.notify.warn('Pivot analysis or Spreadsheet is not ready.');
        return;
    }

    if (!this.currentSavedSpreadsheetId) {
        this.notify.warn('Save the Spreadsheet first.');
        return;
    }

    const sourceSheetName =
        this.currentPivotSheetName ||
        this.spreadsheet.getActiveSheet()?.name;

    if (!sourceSheetName) {
        this.notify.warn('Spreadsheet sheet is not available.');
        return;
    }

    // Keep the reusable Pivot definition in sheetAnalyses.
    this.saveCurrentSheetAnalysis();

    try {
        const pivotMatrix = this.getPivotResultMatrix();

        if (!pivotMatrix.length || !pivotMatrix[0]?.length) {
            this.notify.warn('Pivot result does not contain chartable data.');
            return;
        }

        const lastRow = pivotMatrix.length;
        const lastColumn = pivotMatrix.reduce(
            (max: number, row: any[]) => Math.max(max, row?.length ?? 0),
            0
        );

        if (lastRow < 2 || lastColumn < 2) {
            this.notify.warn('Pivot result needs at least two columns/rows for a chart.');
            return;
        }

        // PivotView and Spreadsheet are separate EJ2 controls. A PivotView chart
        // cannot be Ctrl+C/Ctrl+X directly into Spreadsheet. Convert the current
        // Pivot result into Spreadsheet cells ON Dashboard, then create a native
        // Spreadsheet chart from that LOCAL Dashboard range.
        //
        // Keeping the source range on Dashboard avoids the EJ2 20.4.x
        // cross-sheet SpreadsheetChart.processChartRange()/undefined.rows crash.
        const dashboardRange = await this.writePivotResultToDashboard(
            sourceSheetName,
            pivotMatrix
        );

        await this.insertNativeChartOnDashboard({
            type: this.mapPivotChartTypeToSpreadsheet(this.selectedPivotChartType),
            range: dashboardRange,
            title: this.pivotChartSettings?.title || `${sourceSheetName} Pivot Chart`
        });

        // It is now a REAL Spreadsheet chart. The user can select it on Dashboard
        // and use Ctrl+C / Ctrl+X / Ctrl+V like any other Spreadsheet chart.
        this.saveSpreadsheetLocal();
        this.notify.success(
            'Pivot chart copied to Dashboard. You can now move or copy it normally.'
        );

    } catch (error) {
        console.error('Copy Pivot chart to Dashboard failed:', error);
        this.notify.error('Unable to copy Pivot chart to Dashboard.');
    }
}

/**
 * Writes the current Pivot result into a reserved area of the Dashboard sheet
 * and returns a LOCAL Spreadsheet range (for example AZ1:BH20).
 *
 * We intentionally do not use a _Pivot_* helper sheet here. Syncfusion 20.4.x
 * can crash when insertChart() processes a range from another sheet.
 */
private async writePivotResultToDashboard(
    sourceSheetName: string,
    matrix: any[][]
): Promise<string> {
    if (!this.spreadsheet) {
        throw new Error('Spreadsheet is not ready.');
    }

    this.ensureDashboardSheet();

    const dashboard = await this.waitForSpreadsheetSheet('Dashboard');
    if (!dashboard) {
        throw new Error('Dashboard sheet could not be created.');
    }

    await this.activateSpreadsheetSheet('Dashboard');

    const spreadsheet: any = this.spreadsheet as any;

    // Reserve blocks far to the right so Pivot source cells do not interfere
    // with the visible dashboard/chart area. Each saved Pivot gets its own block.
    const analysisIndex = Math.max(
        0,
        this.sheetAnalyses.findIndex(
            item => String(item?.sheetName ?? '') === String(sourceSheetName)
        )
    );

    const startColumnNumber = 52 + (analysisIndex * 20); // AZ, BT, ...
    const maxColumns = matrix.reduce(
        (max: number, row: any[]) => Math.max(max, row?.length ?? 0),
        0
    );

    const startColumn = this.getSpreadsheetColumnName(startColumnNumber);
    const endColumn = this.getSpreadsheetColumnName(
        startColumnNumber + Math.max(maxColumns, 1) - 1
    );

    // Clear only this Pivot's reserved Dashboard block before rewriting it.
    const clearLastRow = Math.max(
        matrix.length + 20,
        Number(dashboard?.usedRange?.rowIndex ?? 0) + 1
    );

    if (typeof spreadsheet.clear === 'function') {
        try {
            spreadsheet.clear({
                type: 'Clear All',
                range: `${startColumn}1:${endColumn}${clearLastRow}`
            });
        } catch (error) {
            console.warn('[Pivot Dashboard] unable to clear old helper cells', error);
        }
    }

    matrix.forEach((row: any[], rowIndex: number) => {
        (row ?? []).forEach((value: any, colIndex: number) => {
            const cellColumn = this.getSpreadsheetColumnName(
                startColumnNumber + colIndex
            );

            spreadsheet.updateCell(
                { value },
                `${cellColumn}${rowIndex + 1}`
            );
        });
    });

    await this.yieldToBrowser();
    await this.yieldToBrowser();

    const readyDashboard = await this.waitForSpreadsheetSheet('Dashboard');
    if (!readyDashboard?.rows?.length) {
        throw new Error('Dashboard Pivot source cells were not created.');
    }

    const range = `${startColumn}1:${endColumn}${matrix.length}`;

    console.log('[Pivot Dashboard] local chart source created', {
        sourceSheetName,
        range
    });

    return range;
}

/**
 * EJ2 Spreadsheet 20.4.x can leave a null top-level SheetModel after a
 * dynamic insert/open sequence. The chart overlay mouse-up handler calls
 * getActiveSheet(), whose sheets setter then crashes on null.hasOwnProperty().
 *
 * Repair ONLY the top-level sheet collection, and only outside a mouse drag.
 * Do not touch row/cell arrays here.
 */
private repairLiveSpreadsheetSheets(): void {
    if (!this.spreadsheet) {
        return;
    }

    const spreadsheet: any = this.spreadsheet as any;
    const currentSheets: any[] = Array.isArray(spreadsheet.sheets)
        ? spreadsheet.sheets
        : [];

    const validSheets = currentSheets.filter(
        (sheet: any) =>
            !!sheet &&
            typeof sheet === 'object' &&
            Object.keys(sheet).length > 0
    );

    if (validSheets.length === currentSheets.length) {
        return;
    }

    const activeSheetName = spreadsheet.getActiveSheet?.()?.name;

    console.warn('[Spreadsheet] repairing invalid live sheet entries', {
        before: currentSheets.length,
        after: validSheets.length
    });

    // Assign a clean collection once. Never do this while an overlay is being
    // dragged/resized; callers invoke it only during sheet/chart setup.
    spreadsheet.sheets = validSheets;

    let nextIndex = activeSheetName
        ? validSheets.findIndex(
            (sheet: any) => String(sheet?.name ?? '') === String(activeSheetName)
        )
        : Number(spreadsheet.activeSheetIndex ?? 0);

    if (nextIndex < 0 || nextIndex >= validSheets.length) {
        nextIndex = 0;
    }

    spreadsheet.activeSheetIndex = nextIndex;
}

private ensureDashboardSheet(): void {
    if (!this.spreadsheet) {
        return;
    }

    const spreadsheet: any = this.spreadsheet as any;

    // Repair any invalid sheet left by an earlier EJ2 insert/open operation
    // before chart overlays start using getActiveSheet().
    this.repairLiveSpreadsheetSheets();
    const existingIndex = (spreadsheet.sheets ?? []).findIndex(
        (sheet: any) => sheet?.name === 'Dashboard'
    );

    if (existingIndex >= 0) {
        return;
    }

    // insertSheet supports an insertion index at runtime in EJ2 Spreadsheet.
    // Dashboard is presentation-only, therefore DO NOT add sheetDataSources metadata.
    try {
        spreadsheet.insertSheet([{ name: 'Dashboard', rows: [], columns: [] }], 0);
    } catch {
        // Fallback for older 20.4.x patches whose wrapper ignores the index.
        spreadsheet.insertSheet([{ name: 'Dashboard', rows: [], columns: [] }]);
    }

    // insertSheet is synchronous at API level but EJ2 completes parts of its
    // workbook model on the next turn. Repair only after that work finishes.
    setTimeout(() => {
        this.repairLiveSpreadsheetSheets();
    }, 0);
}

private async insertNativeChartOnDashboard(chart: any): Promise<void> {
    if (!this.spreadsheet) {
        throw new Error('Spreadsheet is not ready.');
    }

    const spreadsheet: any = this.spreadsheet as any;

    this.ensureDashboardSheet();

    let dashboardSheet = await this.waitForSpreadsheetSheet('Dashboard');

    if (!dashboardSheet) {
        throw new Error('Dashboard sheet could not be created.');
    }

    // Critical for EJ2 20.4.x chart drag/resize. A null top-level sheet may not
    // fail while rendering, but it crashes Overlay.overlayMouseUpHandler later.
    this.repairLiveSpreadsheetSheets();
    await this.yieldToBrowser();
    dashboardSheet = await this.waitForSpreadsheetSheet('Dashboard');

    if (!dashboardSheet) {
        throw new Error('Dashboard sheet is not available after sheet repair.');
    }

    const range = String(chart?.range ?? '').trim();

    if (!range) {
        throw new Error('Chart source range is empty.');
    }

    // Validate every sheet explicitly referenced by the chart range BEFORE
    // Syncfusion SpreadsheetChart.processChartRange() is allowed to run.
    const referencedSheetNames = this.getChartReferencedSheetNames(range);

    for (const sourceSheetName of referencedSheetNames) {
        const sourceSheet = await this.waitForSpreadsheetSheet(sourceSheetName);

        if (!sourceSheet) {
            throw new Error(
                `Chart source sheet "${sourceSheetName}" is not available.`
            );
        }

        if (!Array.isArray(sourceSheet.rows) || !sourceSheet.rows.length) {
            throw new Error(
                `Chart source sheet "${sourceSheetName}" does not contain rows yet.`
            );
        }
    }

    await this.activateSpreadsheetSheet('Dashboard');

    // Give EJ2 20.4.x additional paint turns after the sheet switch. Chart
    // creation is overlay-based and can otherwise read the previous sheet model.
    await this.yieldToBrowser();
    await this.yieldToBrowser();

    const activeSheet = spreadsheet.getActiveSheet?.();

    if (!activeSheet || activeSheet.name !== 'Dashboard') {
        throw new Error('Dashboard sheet is not active.');
    }

    const model: any = {
        type: chart.type || 'Column',
        theme: chart.theme || 'Material',
        isSeriesInRows: chart.isSeriesInRows ?? false,
        range,
        height: chart.height || 290,
        width: chart.width || 480,
        top: chart.top ?? 20,
        left: chart.left ?? 20
    };

    if (chart.title) {
        model.title = chart.title;
    }

    if (typeof spreadsheet.insertChart !== 'function') {
        throw new Error(
            'insertChart is not available in this Syncfusion Spreadsheet build.'
        );
    }

    console.log('[Dashboard Chart] inserting', {
        activeSheet: activeSheet.name,
        range: model.range,
        sourceSheets: referencedSheetNames
    });

    spreadsheet.insertChart([model]);

    await this.yieldToBrowser();
    await this.yieldToBrowser();

    this.refreshSpreadsheetLayout();
}

private getChartReferencedSheetNames(range: string): string[] {
    const result = new Set<string>();
    const value = String(range ?? '').trim();

    if (!value) {
        return [];
    }

    // IMPORTANT for EJ2 20.4.x:
    // Native chart JSON can store a range like:
    //   Transactions (2)!A1:A12 H1:H12
    // The old regex treated the space as a separator and returned only "(2)".
    // Read the complete text before ! instead.
    const bangIndex = value.indexOf('!');

    if (bangIndex >= 0) {
        let sheetName = value.substring(0, bangIndex).trim();

        if (sheetName.startsWith("'") && sheetName.endsWith("'")) {
            sheetName = sheetName.substring(1, sheetName.length - 1);
        }

        sheetName = sheetName.replace(/''/g, "'").trim();

        if (sheetName) {
            result.add(sheetName);
        }
    }

    return Array.from(result);
}

private quoteSheetName(sheetName: string): string {
    return /[\s'!]/.test(sheetName)
        ? `'${sheetName.replace(/'/g, "''")}'`
        : sheetName;
}

private getPivotHelperSheetName(sourceSheetName: string): string {
    const safe = sourceSheetName.replace(/[\\/?*\[\]:]/g, '_');
    return (`_Pivot_${safe}`).substring(0, 31);
}

private getPivotResultMatrix(): any[][] {
    const pivot: any = this.pivotView as any;
    const values: any[][] =
        pivot?.pivotValues ??
        pivot?.engineModule?.pivotValues ??
        [];

    return (values ?? [])
        .map((row: any[]) =>
            (row ?? []).map((cell: any) => {
                if (cell == null) {
                    return '';
                }

                if (typeof cell !== 'object') {
                    return cell;
                }

                if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
                    return cell.value;
                }

                return cell.formattedText ?? cell.actualText ?? '';
            })
        )
        .filter((row: any[]) => row.some(value => value !== '' && value != null));
}

private async waitForSpreadsheetSheet(
    sheetName: string,
    attempts = 30
): Promise<any> {
    if (!this.spreadsheet) {
        return null;
    }

    const spreadsheet: any = this.spreadsheet as any;

    for (let i = 0; i < attempts; i++) {
        const sheet = (spreadsheet.sheets ?? []).find(
            (item: any) => item?.name === sheetName
        );

        if (sheet) {
            return sheet;
        }

        await this.yieldToBrowser();
    }

    return null;
}

private async activateSpreadsheetSheet(
    sheetName: string
): Promise<number> {
    if (!this.spreadsheet) {
        throw new Error('Spreadsheet is not ready.');
    }

    const spreadsheet: any = this.spreadsheet as any;

    // Keep getActiveSheet()/overlay handlers away from null top-level sheets.
    this.repairLiveSpreadsheetSheets();

    const index = (spreadsheet.sheets ?? []).findIndex(
        (item: any) => item?.name === sheetName
    );

    if (index < 0) {
        throw new Error(`Spreadsheet sheet "${sheetName}" was not found.`);
    }

    spreadsheet.activeSheetIndex = index;
    await this.yieldToBrowser();
    await this.yieldToBrowser();

    return index;
}

private buildSpreadsheetRowsFromMatrix(matrix: any[][]): any[] {
    return (matrix ?? []).map((row: any[]) => ({
        cells: (row ?? []).map((value: any) => ({ value }))
    }));
}

private async upsertPivotHelperSheet(
    sheetName: string,
    matrix: any[][]
): Promise<void> {
    if (!this.spreadsheet) {
        throw new Error('Spreadsheet is not ready.');
    }

    if (!matrix?.length || !matrix.some(row => row?.length)) {
        throw new Error('Pivot helper data is empty.');
    }

    const spreadsheet: any = this.spreadsheet as any;
    let index = (spreadsheet.sheets ?? []).findIndex(
        (sheet: any) => sheet?.name === sheetName
    );

    // IMPORTANT for EJ2 20.4.x:
    // Create the sheet WITH rows already present. Do not insert an empty sheet
    // and immediately ask SpreadsheetChart to read a range from it.
    if (index < 0) {
        const rows = this.buildSpreadsheetRowsFromMatrix(matrix);

        spreadsheet.insertSheet([{
            name: sheetName,
            rows,
            columns: []
        }]);

        const createdSheet = await this.waitForSpreadsheetSheet(sheetName);

        if (!createdSheet) {
            throw new Error(`Pivot helper sheet "${sheetName}" was not created.`);
        }

        index = (spreadsheet.sheets ?? []).findIndex(
            (sheet: any) => sheet?.name === sheetName
        );
    }

    if (index < 0) {
        throw new Error(`Pivot helper sheet "${sheetName}" was not found.`);
    }

    await this.activateSpreadsheetSheet(sheetName);

    const helperSheet: any = spreadsheet.sheets[index];
    const oldLastRow = Number(helperSheet?.usedRange?.rowIndex ?? 0) + 1;
    const oldLastCol = Number(helperSheet?.usedRange?.colIndex ?? 0) + 1;

    if (oldLastRow > 0 && oldLastCol > 0 && typeof spreadsheet.clear === 'function') {
        const oldRange =
            `A1:${this.getSpreadsheetColumnName(oldLastCol)}${oldLastRow}`;

        try {
            spreadsheet.clear({
                type: 'Clear All',
                range: oldRange
            });
        } catch (error) {
            console.warn('Unable to clear old Pivot helper range.', error);
        }
    }

    // Write while the helper sheet is ACTIVE. This is important in 20.4.x.
    matrix.forEach((row: any[], rowIndex: number) => {
        (row ?? []).forEach((value: any, colIndex: number) => {
            spreadsheet.updateCell(
                { value },
                `${this.getSpreadsheetColumnName(colIndex + 1)}${rowIndex + 1}`
            );
        });
    });

    await this.yieldToBrowser();
    await this.yieldToBrowser();

    const readySheet = await this.waitForSpreadsheetSheet(sheetName);

    if (!readySheet || !Array.isArray(readySheet.rows) || !readySheet.rows.length) {
        throw new Error(`Pivot helper sheet "${sheetName}" has no rows.`);
    }
}

private getSpreadsheetColumnName(columnNumber: number): string {
    let n = Math.max(1, Number(columnNumber) || 1);
    let result = '';

    while (n > 0) {
        const remainder = (n - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        n = Math.floor((n - 1) / 26);
    }

    return result;
}

private mapPivotChartTypeToSpreadsheet(type: string): string {
    const map: Record<string, string> = {
        Column: 'Column',
        Bar: 'Bar',
        Line: 'Line',
        Area: 'Area',
        Pie: 'Pie',
        Doughnut: 'Doughnut',
        Scatter: 'Scatter',
        Spline: 'Line',
        SplineArea: 'Area',
        StackingColumn: 'StackingColumn',
        StackingBar: 'StackingBar',
        StackingArea: 'StackingArea'
    };

    return map[type] ?? 'Column';
}



    changePivotChartType(): void {
        if (!this.selectedPivotChartType) {
            return;
        }

        this.pivotChartSettings = {
            ...this.pivotChartSettings,
              height: '280',
            chartSeries: {
                ...(this.pivotChartSettings?.chartSeries ?? {}),
                type: this.selectedPivotChartType
            }
        };

        if (this.pivotView) {
            this.pivotView.chartSettings = this.pivotChartSettings;

            if (typeof this.pivotView.dataBind === 'function') {
                this.pivotView.dataBind();
            }
        }
    }


    private refreshPivot(): void {
        if (!this.pivotView) {
            return;
        }

        this.pivotView.dataSourceSettings = this.pivotDataSourceSettings;

        if (typeof this.pivotView.dataBind === 'function') {
            this.pivotView.dataBind();
        }
    }

 

    // =====================================================
    // FILTER FORM
    // =====================================================

    initFilterForm(): void {
        this.filterForm = this._formBuilder.group({
            search: undefined,

            sellerNameFilter: undefined,
            buyerNameFilter: undefined,
            codeFilter: undefined,
            statusFilter: undefined,

            maxCreateDateFilter: undefined,
            minCreateDateFilter: undefined,

            maxCompleteDateFilter: undefined,
            minCompleteDateFilter: undefined,

            mainFilterType: this.defaultMainFilter,

            transactionTypeFilter: undefined,
            transactionNumberFilter: undefined,

            nameFilter: undefined,
            variationCodeFilter: undefined,
            referenceNumberFilter: undefined,

            minPrice: undefined,
            maxPrice: undefined,
            minAmount: undefined,
            maxAmount: undefined
        });

        if (
            !this.defaultMainFilter ||
            !this.pageMainFilters?.length
        ) {
            return;
        }

        const selectedFilter =
            this.pageMainFilters.find(
                item =>
                    item.id ===
                    this.defaultMainFilter.id
            );

        if (selectedFilter) {
            this.mainFilterCtrl?.setValue(
                selectedFilter
            );
        }
    }

    get mainFilterCtrl(): AbstractControl | null {
        return this.filterForm?.get(
            'mainFilterType'
        );
    }

    setPageMainFilters(): void {
        this.pageMainFilters = [];
        this.filterTransType = [];
        this.filterStatus = [];

        this._sycEntityObjectStatusesAppService
            .getAllSycEntityStatusForTableDropdown(
                'TRANSACTION'
            )
            .subscribe(result => {
                this.filterStatus =
                    result.map(item => ({
                        label: item.displayName,
                        value: item.id
                    }));
            });

        this._sycEntityObjectTypesServiceProxy
            .getSycEntityObjectTypeForObjectAsTableDropdown(
                'TRANSACTION'
            )
            .subscribe(result => {
                this.pageMainFilters = [
                    ...result
                ];

                this.filterTransType =
                    result.map(item => ({
                        label: item.displayName,
                        value: item.id
                    }));

                this.pageMainFilters.unshift({
                    displayName:
                        this.l('MyTransactions'),
                    id: undefined
                });

                this.defaultMainFilter =
                    this.pageMainFilters[0];

                this.initFilterForm();
            });
    }

    selectMainFilter(filter: any): void {
        this.mainFilterCtrl?.setValue(filter);

        this.selectedTransactions = [];

        if (this.showHeader) {
            this.getAppTransactions();
        } else {
            this.getVariationDetail();
        }
    }

    searchTransactions(): void {
        if (this.showHeader) {
            this.getAppTransactions();
        } else {
            this.getVariationDetail();
        }
    }

    onSearch(event: KeyboardEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.searchTransactions();
    }

    showHeaderTransactions(): void {
        this.showHeader = true;
        this.showDetails = false;

        this.filterText = '';
        this.advancedFiltersAreShown = false;

        this.selectedTransactions = [];

        this.initFilterForm();
        this.getAppTransactions();
    }

    showDetailTransactions(): void {
        this.showHeader = false;
        this.showDetails = true;

        this.filterText = '';
        this.advancedFiltersAreShown = false;

        this.selectedTransactions = [];

        this.initFilterForm();
        this.getVariationDetail();
    }

    // =====================================================
    // TRANSACTION HEADER DATA
    // =====================================================

    getAppTransactions(
        event?: {
            first?: number;
            page?: number;
            pageCount?: number;
            rows?: number;
        }
    ): void {
        if (
            this.primengTableHelper.shouldResetPaging(
                event
            )
        ) {
            if (this.paginator) {
                this.paginator.totalRecords =
                    this.primengTableHelper
                        .totalRecordsCount > 0
                        ? this.primengTableHelper
                              .totalRecordsCount
                        : 10;

                this.paginator.changePage(0);
            }

            return;
        }

        this.primengTableHelper
            .showLoadingIndicator();

        const rows =
            event?.rows ??
            this.paginator?.rows ??
            this.primengTableHelper
                .defaultRecordsCountPerPage;

        if (this.paginator) {
            this.paginator.rows = rows;
        }

        const maxResultCount =
            this.primengTableHelper
                .getMaxResultCount(
                    this.paginator,
                    event
                );

        const pageIndex =
            event?.page ??
            Math.floor(
                (event?.first ?? 0) /
                    maxResultCount
            );

        const skipCount =
            pageIndex * maxResultCount;

        const filters =
            this.filterForm?.value ?? {};

        this.loading = true;

        this._appTransactionServiceProxy
            .getAll(
                false,
                0,
                undefined,
                filters.search,
                filters.codeFilter,
                undefined,
                filters.mainFilterType?.id,
                filters.minCreateDateFilter,
                filters.maxCreateDateFilter,
                filters.minCompleteDateFilter,
                filters.maxCompleteDateFilter,
                filters.sellerNameFilter,
                undefined,
                filters.buyerNameFilter,
                undefined,
                filters.statusFilter == null
                    ? undefined
                    : filters.statusFilter,
                false,
                undefined,
                undefined,
                filters.referenceNumberFilter,
                this.primengTableHelper.getSorting(
                    this.dataTable
                ),
                skipCount,
                maxResultCount
            )
            .pipe(
                finalize(() => {
                    this.loading = false;

                    this.primengTableHelper
                        .hideLoadingIndicator();
                })
            )
            .subscribe(result => {
                this.primengTableHelper
                    .totalRecordsCount =
                    result.totalCount;

                this.primengTableHelper.records =
                    result.items;

             
                // this.selectedTransactions = [];
            });
    }

    // =====================================================
    // TRANSACTION SELECTION
    // =====================================================

    onTransactionSelectionChanged(): void {
        this.selectedTransactions = [
            ...(this.selectedTransactions ?? [])
        ];
    }

    clearSelectedTransactions(): void {
        this.selectedTransactions = [];
    }

    openTransaction(record: any): void {
        if (!record?.id) {
            return;
        }

        this.orderId = record.id;

        const mode =
            record.entityObjectStatusCode ===
            'DRAFT'
                ? TransactionCartMode.createOrEdit
                : TransactionCartMode.view;

        this.shoppingCartModal.show(
            this.orderId,
            true,
            true,
            mode
        );
    }

    // =====================================================
    // DETAILS DATA
    // =====================================================

    onSort(event: {
        field: string;
        order: number;
    }): void {
        this.sortField = event.field;
        this.sortOrder = event.order;

        this.getVariationDetail();
    }

    getVariationDetail(
        event?: {
            page?: number;
            rows?: number;
            first?: number;
        }
    ): void {
        this.showMainSpinner();

        if (event) {
            this.rowsPerPage =
                event.rows ??
                this.rowsPerPage;

            this.page =
                event.page ??
                Math.floor(
                    (event.first ?? 0) /
                        this.rowsPerPage
                );
        }

        const skipCount =
            this.page * this.rowsPerPage;

        const filters =
            this.filterForm?.value ?? {};

        const sorting =
            this.sortField
                ? `${this.sortField} ${
                      this.sortOrder === 1
                          ? 'ASC'
                          : 'DESC'
                  }`
                : undefined;

        this._appTransactionServiceProxy
            .getllTransactionVariationsDetail(
                filters.variationCodeFilter,
                filters.mainFilterType?.id ==
                null
                    ? undefined
                    : filters.mainFilterType.id ===
                      723
                    ? 0
                    : 1,
                filters.search,
                filters.transactionNumberFilter,
                filters.minPrice,
                filters.maxPrice,
                filters.minAmount,
                filters.maxAmount,
                sorting,
                skipCount,
                this.rowsPerPage
            )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe({
                next: result => {
                    this.variationDetails =
                        result.items;

                    this.totalRecords =
                        result.totalCount;
                },
                error: error => {
                    console.error(
                        'API Request Failed:',
                        error
                    );

                    this.loading = false;
                }
            });
    }

    resetSort(
        event: MouseEvent,
        field: string
    ): void {
        event.stopPropagation();

        if (this.sortField !== field) {
            return;
        }

        this.sortField = undefined;
        this.sortOrder = undefined;

        if (field === 'amount') {
            this.isAmountReset = true;
        }

        if (field === 'price') {
            this.isReset = true;
        }

        if (field === 'transactionType') {
            this.isTypeReset = true;
        }

        if (this.dataDetailTable) {
            this.dataDetailTable.sortField =
                undefined;

            this.dataDetailTable.sortOrder =
                undefined;

            if (
                typeof this.dataDetailTable
                    .reset === 'function'
            ) {
                this.dataDetailTable.reset();
            }
        }

        this.getVariationDetail();
    }

    // =====================================================
    // RESET
    // =====================================================

    resetList(): void {
        this.sortField = undefined;
        this.sortOrder = undefined;

        this.isAmountReset = false;
        this.isReset = false;
        this.isTypeReset = false;

        this.selectedTransactions = [];

        this.initFilterForm();

        if (
            this.dataTable &&
            typeof this.dataTable.reset ===
                'function'
        ) {
            this.dataTable.reset();
        }

        if (
            this.dataDetailTable &&
            typeof this.dataDetailTable.reset ===
                'function'
        ) {
            this.dataDetailTable.reset();
        }

        this.setMainPageFilter(
            this.defaultMainFilter
        );

        if (this.showHeader) {
            this.getAppTransactions();
        } else {
            this.getVariationDetail();
        }
    }

    setMainPageFilter(filter: any): void {
        const selectedFilter =
            this.pageMainFilters.find(
                item => item.id === filter?.id
            );

        if (selectedFilter) {
            this.mainFilterCtrl?.setValue(
                selectedFilter
            );
        }
    }

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================

    createNewSalesOrder(): void {
        if (
            !this.tenantRoleService.canCreateSO()
        ) {
            this.showNoCreatePermissionAlert();
            return;
        }

        this.roles =
            this.tenantRoleService
                .soRolesOptions;

        this.getOrderNumber(
            'SO',
            'Sales Order'
        );
    }

    createNewPurchaseOrder(): void {
        if (
            !this.tenantRoleService.canCreatePO()
        ) {
            this.showNoCreatePermissionAlert();
            return;
        }

        this.roles =
            this.tenantRoleService
                .poRolesOptions;

        this.getOrderNumber(
            'PO',
            'Purchase Order'
        );
    }

    getOrderNumber(
        transactionType: string,
        transactionName: string
    ): void {
        this.showMainSpinner();

        this._appTransactionServiceProxy
            .getNextOrderNumber(
                transactionType
            )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result: any) => {
                this.orderNo = result;
                this.formType =
                    transactionType;
                this.modalheaderName =
                    transactionName;

                this.fullName =
                    `${this.appSession.user.name} ` +
                    `${this.appSession.user.surname}`;

                this.display = true;
            });
    }

    /*
     * Keep this wrapper if other template or
     * components still call the original typo.
     */
    getOderNumber(
        transactionType: string,
        transactionName: string
    ): void {
        this.getOrderNumber(
            transactionType,
            transactionName
        );
    }

    closeModal(_: any): void {
        this.display = false;
        this.reloadPage();
    }

    reloadPage(): void {
        if (this.paginator) {
            this.paginator.changePage(
                this.paginator.getPage()
            );
        }
    }

    onHideShoppingCartModal(
        shouldRefresh: boolean
    ): void {
        if (shouldRefresh) {
            this.getAppTransactions();
        }
    }

    customFilterCallback(
        filter: (value: any) => void,
        value: any
    ): void {
        filter(value);
    }

    // =====================================================
    // OPEN SELECTED TRANSACTIONS IN SPREADSHEET
    // =====================================================
openSelectedInSpreadsheet(): void {
    if (!this.selectedTransactions?.length) {
        this.notify.warn('Select at least one transaction.');
        return;
    }

    this.pendingSpreadsheetOpenMode = 'SelectedRecords';
    this.pendingSpreadsheetDestination = 'new';
    this.pendingExistingSpreadsheetId = null;
    this.showSpreadsheetDestinationDialog = true;
}

openAllInSpreadsheet(): void {
    if (!Number(this.primengTableHelper.totalRecordsCount ?? 0)) {
        this.notify.warn('No transactions found.');
        return;
    }

    this.pendingSpreadsheetOpenMode = 'AllRecords';
    this.pendingSpreadsheetDestination = 'new';
    this.pendingExistingSpreadsheetId = null;
    this.showSpreadsheetDestinationDialog = true;
}

async confirmSpreadsheetDestination(): Promise<void> {
    let existingSpreadsheet: SavedSpreadsheet | undefined;

    if (this.pendingSpreadsheetDestination === 'existing') {
        existingSpreadsheet = this.savedSpreadsheets.find(
            item => Number(item.id) === Number(this.pendingExistingSpreadsheetId)
        );

        if (!existingSpreadsheet) {
            this.notify.warn('Choose an existing Spreadsheet.');
            return;
        }
    }

    this.showSpreadsheetDestinationDialog = false;

    if (this.pendingSpreadsheetOpenMode === 'SelectedRecords') {
        const filters = this.getCurrentSpreadsheetFilters();
        const selectedIds = this.selectedTransactions
            .map(record => Number(record?.id))
            .filter(id => Number.isFinite(id) && id > 0);

        const source: SpreadsheetDataSource = {
            type: 'Transactions',
            sourceKey: 'TRANSACTIONS',
            mode: 'SelectedRecords',
            selectedIds,
            filters
        };

        if (existingSpreadsheet) {
            await this.addRecordsAsNewTabToSavedSpreadsheet(
                existingSpreadsheet,
                this.selectedTransactions,
                source
            );
        } else {
            this.openRecordsInSpreadsheet(this.selectedTransactions, source);
        }
        return;
    }

    await this.executeOpenAllInSpreadsheet(
        this.pendingSpreadsheetDestination,
        existingSpreadsheet
    );
}



    private mapTransactionToSpreadsheetRow(
        record: any
    ): TransactionSpreadsheetRow {
        return {
            TransactionNumber:
                record.code ?? '',

            TransactionType:
                record.entityObjectTypeCode ===
                'SALESORDER'
                    ? this.l('SalesOrder')
                    : this.l('PurchaseOrder'),

            Seller:
                record.sellerCompanyName ?? '',

            Buyer:
                record.buyerCompanyName ?? '',

            Status:
                record.entityObjectStatusCode ??
                '',

            CreatedDate:
                this.formatSpreadsheetDate(
                    record.creationTime
                ),

            CompleteDate:
                this.formatSpreadsheetDate(
                    record.completeDate
                ),

            Reference:
                record.reference ?? '',

            Creator:
                record.creatorTenantName ?? '',

            Currency:
                record.currencyCode ?? '',

            Quantity:
                Number(
                    record.totalQuantity ?? 0
                ),

            Amount:
                Number(
                    record.totalAmount ?? 0
                )
        };
    }

    private formatSpreadsheetDate(
        value: any
    ): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (
            Number.isNaN(date.getTime())
        ) {
            return String(value);
        }

        return date.toLocaleDateString();
    }

onSpreadsheetCreated(): void {

    if (!this.spreadsheet) {
        return;
    }

    const spreadsheet: any =
        this.spreadsheet as any;

    // Add Siiwii command inside Syncfusion's native Insert ribbon.
    this.addSpreadsheetDataSourceRibbonCommand();
    this.bindSpreadsheetDataSourceRibbonClick();

    /*
     * These are also exposed as template bindings. Setting them here keeps
     * the optimization active even if an older template is used.
     */
    if ('showAggregate' in spreadsheet) {
        spreadsheet.showAggregate = false;
    }

    if ('scrollSettings' in spreadsheet) {
        spreadsheet.scrollSettings = {
            ...(spreadsheet.scrollSettings ?? {}),
            enableVirtualization: true,
            isFinite: false
        };
    }

    // Capture Syncfusion sheet ids so metadata survives sheet renames.
    this.syncSheetDataSourceIdentity();

    // Start watching tab changes BEFORE the early return used while reopening
    // a saved workbook. This is what keeps the Applied Filters UI in sync.
    this.startSpreadsheetSheetWatcher();

    setTimeout(() => {
        this.syncActiveSheetSourceToUi();
    }, 0);

    // this.spreadsheet.freezePanes(1, 0);

    if (this.isOpeningSavedSpreadsheet) {
        return;
    }

    if (!this.spreadsheetRows?.length) {
        return;
    }

    /*
     * Format only the header. Do not format A1:L50000, which would create a
     * large amount of cell/style work.
     */
    this.spreadsheet.cellFormat(
        {
            fontWeight: 'bold',
            textAlign: 'center',
            verticalAlign: 'middle'
        },
        'Transactions!A1:L1'
    );

    const transactionsIndex = this.spreadsheet.sheets.findIndex(
        (sheet: any) => sheet?.name === 'Transactions'
    );

    if (transactionsIndex >= 0) {
        this.spreadsheet.activeSheetIndex = transactionsIndex;
    }

    this.spreadsheet.selectRange('Transactions!A1');

    /*
     * Resize once after creation, never once per row/batch.
     */
    setTimeout(() => {
        this.spreadsheet?.resize();
    });
}


    closeSpreadsheet(): void {
        this.stopSpreadsheetSheetWatcher();
        this.unbindSpreadsheetDataSourceRibbonClick();
        this.showSpreadsheetDataPanel = false;
        this.showSpreadsheetDialog = false;
    }




  



    // =====================================================
    // EXCEL ADDRESS HELPERS
    // =====================================================



    private getColumnName(
        index: number
    ): string {
        let name = '';
        let currentIndex = index + 1;

        while (currentIndex > 0) {
            const remainder =
                (currentIndex - 1) % 26;

            name =
                String.fromCharCode(
                    65 + remainder
                ) + name;

            currentIndex = Math.floor(
                (currentIndex - 1) / 26
            );
        }

        return name;
    }

private async executeOpenAllInSpreadsheet(
    destination: 'new' | 'existing',
    existingSpreadsheet?: SavedSpreadsheet
): Promise<void> {

    const filters =
        this.getCurrentSpreadsheetFilters();

    const source: SpreadsheetDataSource = {
        type: 'Transactions',
        sourceKey: 'TRANSACTIONS',
        mode: 'AllRecords',
        filters
    };

    const currentRecords: any[] =
        this.primengTableHelper.records ?? [];

    const totalCount =
        Number(
            this.primengTableHelper.totalRecordsCount ?? 0
        );

    console.log(
        '[Spreadsheet] Open All',
        {
            currentPageRecords:
                currentRecords.length,
            totalCount,
            filters
        }
    );

    // =====================================================
    // CASE 1:
    // ALL FILTERED DATA IS ALREADY LOADED IN THE TABLE.
    // OPEN IMMEDIATELY - NO EXTRA API CALL.
    // =====================================================
    if (
        totalCount > 0 &&
        currentRecords.length === totalCount
    ) {
        if (destination === 'existing' && existingSpreadsheet) {
            await this.addRecordsAsNewTabToSavedSpreadsheet(
                existingSpreadsheet,
                [...currentRecords],
                source
            );
        } else {
            this.openRecordsInSpreadsheet(
                [...currentRecords],
                source
            );
        }

        return;
    }

    // =====================================================
    // CASE 2:
    // LARGE DATA - OPEN SPREADSHEET AFTER FIRST BATCH,
    // THEN APPEND EACH NEXT 10 RECORDS AS SOON AS IT ARRIVES.
    //
    // Example:
    // request 1: Skip=0  Take=10  -> OPEN + DISPLAY 10
    // request 2: Skip=10 Take=10  -> APPEND 10
    // request 3: Skip=20 Take=10  -> APPEND 10
    // request 4: Skip=30 Take=10  -> APPEND remaining
    // =====================================================

    this.spreadsheetStillLoading = true;
    this.spreadsheetLoadedCount = 0;
    this.spreadsheetTotalCount = totalCount;
    this.spreadsheetLoadingProgress = 0;
    this.spreadsheetLoadingMessage = totalCount > 0
        ? `Loading data... 0 of ${totalCount.toLocaleString()} loaded`
        : 'Loading data...';

    let skipCount = 0;
    let batchNumber = 0;
    let displayedRecordCount = 0;
    let spreadsheetOpened = false;

    try {

        while (true) {

            batchNumber++;

            console.log(
                `[Spreadsheet Open All] requesting batch ${batchNumber}`,
                {
                    skipCount,
                    maxResultCount:
                        this.spreadsheetBatchSize
                }
            );

            const result: any =
                await firstValueFrom(
                    this.getTransactionsForSpreadsheetRefresh(
                        filters,
                        skipCount,
                        this.spreadsheetBatchSize
                    )
                );

            const items: any[] =
                result?.items ?? [];

            console.log(
                `[Spreadsheet Open All] batch ${batchNumber} received`,
                {
                    returned: items.length,
                    skipCount,
                    apiTotalCount:
                        result?.totalCount
                }
            );

            if (!items.length) {

                if (!spreadsheetOpened) {
                    this.notify.warn(
                        'No transactions found.'
                    );
                }

                break;
            }

            // =================================================
            // FIRST BATCH:
            // OPEN THE DIALOG NOW.
            // Do NOT wait for the remaining API requests.
            // =================================================
            if (!spreadsheetOpened) {

                let targetSheetName = 'Transactions';

                if (destination === 'existing' && existingSpreadsheet) {
                    targetSheetName = await this.addRecordsAsNewTabToSavedSpreadsheet(
                        existingSpreadsheet,
                        items,
                        source,
                        false
                    );
                } else {
                    this.openRecordsInSpreadsheet(
                        items,
                        source
                    );
                }

                this.progressiveTargetSheetName = targetSheetName;

                displayedRecordCount =
                    items.length;

                spreadsheetOpened = true;

                const effectiveTotalCount =
                    totalCount || Number(result?.totalCount ?? 0);

                this.spreadsheetTotalCount = effectiveTotalCount;
                this.spreadsheetLoadedCount = displayedRecordCount;

                this.updateOpenAllProgress(
                    displayedRecordCount,
                    effectiveTotalCount
                );

                this.spreadsheetLoadingMessage =
                    effectiveTotalCount > 0
                        ? `Loading more data... ${displayedRecordCount.toLocaleString()} of ${effectiveTotalCount.toLocaleString()} loaded`
                        : `Loading more data... ${displayedRecordCount.toLocaleString()} loaded`;

                this.cdr.detectChanges();

                /*
                 * Angular must render the dialog and create
                 * <ejs-spreadsheet> before we can append batch 2.
                 */
                await this.waitForSpreadsheetReady();

            } else {

                // =============================================
                // NEXT BATCHES:
                // APPEND DIRECTLY TO THE ALREADY OPEN SHEET.
                // =============================================
                const batchRows:
                    TransactionSpreadsheetRow[] =
                    items.map(
                        (record: any) =>
                            this.mapTransactionToSpreadsheetRow(
                                record
                            )
                    );

                this.appendSpreadsheetRefreshBatch(
                    this.progressiveTargetSheetName || 'Transactions',
                    batchRows,
                    displayedRecordCount
                );

                /*
                 * Keep the component-side array in sync too.
                 * The live Spreadsheet is already updated by updateRange().
                 */
                this.spreadsheetRows.push(
                    ...batchRows
                );

                displayedRecordCount +=
                    batchRows.length;

                const effectiveTotalCount =
                    totalCount || Number(result?.totalCount ?? 0);

                this.spreadsheetTotalCount = effectiveTotalCount;
                this.spreadsheetLoadedCount = displayedRecordCount;

                this.updateOpenAllProgress(
                    displayedRecordCount,
                    effectiveTotalCount
                );

                this.spreadsheetLoadingMessage =
                    effectiveTotalCount > 0
                        ? `Loading more data... ${displayedRecordCount.toLocaleString()} of ${effectiveTotalCount.toLocaleString()} loaded`
                        : `Loading more data... ${displayedRecordCount.toLocaleString()} loaded`;

                this.cdr.detectChanges();

                /*
                 * Let Syncfusion paint these 10 rows before
                 * requesting / processing the next batch.
                 */
                await this.yieldToBrowser();
            }

            // Always page:
            // 0 -> 10 -> 20 -> 30 ...
            skipCount +=
                this.spreadsheetBatchSize;

            // A short page means there is no next page.
            if (
                items.length <
                this.spreadsheetBatchSize
            ) {
                break;
            }

            /*
             * If the table already supplied a reliable total,
             * stop once we have requested/displayed that amount.
             */
            if (
                totalCount > 0 &&
                displayedRecordCount >= totalCount
            ) {
                break;
            }
        }

        if (spreadsheetOpened) {

            this.spreadsheetStillLoading = false;
            this.spreadsheetLoadedCount = displayedRecordCount;
            this.spreadsheetLoadingProgress = 100;

            this.spreadsheetLoadingMessage =
                `${displayedRecordCount.toLocaleString()} transactions loaded`;

            this.cdr.detectChanges();

            console.log(
                '[Spreadsheet Open All] finished',
                {
                    displayedRecordCount
                }
            );

            if (destination === 'existing' && existingSpreadsheet) {
                this.saveSpreadsheetLocal();
            }

            /*
             * One final browser turn so the last batch is painted.
             */
            await this.yieldToBrowser();
        }

    } catch (error) {

        console.error(
            'Open all in Spreadsheet failed:',
            error
        );

        /*
         * If batch 1 already opened successfully, keep the rows
         * already displayed instead of closing/wiping the sheet.
         */
        if (spreadsheetOpened) {
            this.notify.warn(
                `${displayedRecordCount.toLocaleString()} records were loaded before the request failed.`
            );
        } else {
            this.notify.error(
                'Unable to load transactions into Spreadsheet.'
            );
        }

    } finally {

        /*
         * Do not use the page-level blocking spinner here.
         * The Spreadsheet must stay visible while batches arrive.
         */
        this.spreadsheetStillLoading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
            this.spreadsheetLoadingProgress = 0;
            this.spreadsheetLoadingMessage = '';
            this.spreadsheetLoadedCount = 0;
            this.spreadsheetTotalCount = 0;
            this.cdr.detectChanges();
        }, 1500);
    }
}

private updateOpenAllProgress(
    displayedRecordCount: number,
    totalCount: number
): void {

    if (!totalCount || totalCount <= 0) {
        return;
    }

    this.spreadsheetLoadingProgress =
        Math.min(
            100,
            Math.round(
                (
                    displayedRecordCount /
                    totalCount
                ) * 100
            )
        );
}

/**
 * Wait until Angular has rendered the Spreadsheet dialog and
 * Syncfusion has created the Spreadsheet instance.
 *
 * This is required because Open All now opens immediately after
 * API batch 1 instead of waiting for every API request to finish.
 */
private async waitForSpreadsheetReady(): Promise<void> {

    /*
     * Force Angular to render the dialog created by
     * openRecordsInSpreadsheet().
     */
    this.cdr.detectChanges();

    const maxAttempts = 40;

    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {

        if (
            this.spreadsheet &&
            this.spreadsheet.sheets?.length
        ) {
            /*
             * One extra paint turn makes sure the first 10 rows
             * are actually visible before batch 2 is appended.
             */
            await this.yieldToBrowser();
            return;
        }

        await new Promise<void>(
            resolve =>
                setTimeout(
                    resolve,
                    50
                )
        );
    }

    throw new Error(
        'Spreadsheet was not created in time.'
    );
}

private async addRecordsAsNewTabToSavedSpreadsheet(
    saved: SavedSpreadsheet,
    records: any[],
    source: SpreadsheetDataSource,
    persistImmediately = true
): Promise<string> {
    // Open the chosen saved workbook first. Its existing tabs/data stay unchanged.
    this.openSavedSpreadsheet(saved);
    await new Promise<void>(resolve => setTimeout(resolve, 900));
    await this.waitForSpreadsheetReady();

    if (!this.spreadsheet) {
        throw new Error('Spreadsheet is not ready.');
    }

    const baseName = source.type || 'Data';
    const existingNames = new Set(
        (this.spreadsheet.sheets ?? []).map((sheet: any) => String(sheet?.name ?? ''))
    );

    let sheetName = baseName;
    let suffix = 2;
    while (existingNames.has(sheetName)) {
        sheetName = `${baseName} (${suffix++})`;
    }

    const rows = records.map(record =>
        this.mapTransactionToSpreadsheetRow(record)
    );

    // Keep the active/new tab record counter in sync with the data being inserted.
    this.spreadsheetRows = [...rows];

    // Do not freeze the row while Syncfusion is dynamically inserting the
    // sheet. In EJ2 20.4.x this can temporarily render the header twice.
    const newSheet: any = {
        name: sheetName,
        ranges: [{
            dataSource: rows,
            startCell: 'A1',
            showFieldAsHeader: true
        }]
    };

    (this.spreadsheet as any).insertSheet([newSheet]);

    // Give Syncfusion two paint turns to finish creating the new sheet.
    await this.yieldToBrowser();
    await this.yieldToBrowser();

    const inserted: any = this.spreadsheet.sheets.find(
        (sheet: any) => sheet?.name === sheetName
    );

    this.upsertSheetDataSource({
        sheetId: inserted?.id,
        sheetName,
        source: this.cloneSpreadsheetDataSource(source)
    });

    const index = this.spreadsheet.sheets.findIndex(
        (sheet: any) => sheet?.name === sheetName
    );

    if (index >= 0) {
        (this.spreadsheet as any).activeSheetIndex = index;
        // Do not force dataBind() after insertSheet(); it can invalidate chart overlays.
        await this.yieldToBrowser();
        await this.yieldToBrowser();
    }

    // The filter/source UI must always represent the ACTIVE tab.
    this.syncActiveSheetSourceToUi();

    if (persistImmediately) {
        this.saveSpreadsheetLocal();
    }

    return sheetName;
}

private openRecordsInSpreadsheet(
    records: any[],
    source: SpreadsheetDataSource
): void {

    if (!records?.length) {

        this.notify.warn(
            'No transactions found.'
        );

        return;
    }


    this.currentSavedSpreadsheetId =
        null;

    this.isOpeningSavedSpreadsheet =
        false;

    // NEW
    this.sheetAnalyses = [];


    this.currentSpreadsheetSource = {

        ...source,

        selectedIds:
            source.selectedIds
                ? [...source.selectedIds]
                : undefined,

        filters: {
            ...(source.filters ?? {})
        }
    };


    this.currentSpreadsheetFilters = {
        ...(source.filters ?? {})
    };

    // A newly-created transaction workbook starts with one source tab.
    this.sheetDataSources = [{
        sheetName: 'Transactions',
        source: this.cloneSpreadsheetDataSource(source)
    }];

    this.spreadsheetRows =
        records.map(record =>
            this.mapTransactionToSpreadsheetRow(
                record
            )
        );


    this.sheets =
        this.buildTransactionSpreadsheetSheets();


    this.showSpreadsheetDialog =
        true;
}

onSpreadsheetActiveSheetChanged(): void {

    setTimeout(() => {
        this.syncActiveSheetSourceToUi();
    }, 0);
}

private startSpreadsheetSheetWatcher(): void {

    this.stopSpreadsheetSheetWatcher();

    if (!this.spreadsheet) {
        return;
    }

    this.lastSpreadsheetActiveSheetIndex =
        Number(
            (this.spreadsheet as any)
                .activeSheetIndex ?? 0
        );

    this.spreadsheetSheetWatcher =
        setInterval(() => {

            if (!this.spreadsheet) {
                return;
            }

            const activeSheetIndex =
                Number(
                    (this.spreadsheet as any)
                        .activeSheetIndex ?? 0
                );

            if (
                activeSheetIndex ===
                this.lastSpreadsheetActiveSheetIndex
            ) {
                return;
            }

            this.lastSpreadsheetActiveSheetIndex =
                activeSheetIndex;

            console.log(
                '[Spreadsheet] TAB SWITCHED:',
                this.spreadsheet.getActiveSheet()?.name
            );

            this.syncActiveSheetSourceToUi();

        }, 100);
}

private stopSpreadsheetSheetWatcher(): void {

    if (!this.spreadsheetSheetWatcher) {
        return;
    }

    clearInterval(
        this.spreadsheetSheetWatcher
    );

    this.spreadsheetSheetWatcher = null;
}

private syncActiveSheetSourceToUi(): void {

    if (!this.spreadsheet) {
        return;
    }

    const activeSheet: any =
        this.spreadsheet.getActiveSheet();

    if (!activeSheet?.name) {
        return;
    }

    const activeSheetName =
        String(activeSheet.name).trim();

    console.log(
        '[Spreadsheet] Active tab:',
        activeSheetName
    );

    console.log(
        '[Spreadsheet] sheetDataSources:',
        this.sheetDataSources
    );

    // IMPORTANT:
    // Match by sheet NAME.
    // Do not use sheetId here after openFromJson().
    const metadata =
        this.sheetDataSources.find(
            item =>
                String(item.sheetName).trim() ===
                activeSheetName
        );

    console.log(
        '[Spreadsheet] matched metadata:',
        metadata
    );

    // VERY IMPORTANT:
    // Always clear previous tab UI state first.
    this.currentSpreadsheetSource = null;
    this.currentSpreadsheetFilters = {};

    if (metadata?.source) {

        this.currentSpreadsheetSource =
            this.cloneSpreadsheetDataSource(
                metadata.source
            );

        this.currentSpreadsheetFilters = {
            ...(metadata.source.filters ?? {})
        };
    }

    console.log(
        '[Spreadsheet] filters displayed:',
        this.currentSpreadsheetFilters
    );

    this.cdr.detectChanges();
}

private buildTransactionSpreadsheetSheets(): SheetModel[] {
    return [
        // Presentation-only sheet. It intentionally has no sheetDataSources entry.
        {
            name: 'Dashboard',
            rows: [],
            columns: []
        },
        {
            name: 'Transactions',
            ranges: [
                {
                    dataSource:
                        this.spreadsheetRows,
                    startCell: 'A1',
                    showFieldAsHeader: true
                }
            ],
            columns: [
                { width: 145 },
                { width: 145 },
                { width: 180 },
                { width: 180 },
                { width: 110 },
                { width: 130 },
                { width: 130 },
                { width: 130 },
                { width: 180 },
                { width: 100 },
                { width: 110 },
                { width: 130 }
            ],
            frozenRows: 1
        },
    
    ];
}

// =====================================================
// PER-SHEET DATA SOURCE / FILTER METADATA
// =====================================================
private cloneSpreadsheetDataSource(
    source: SpreadsheetDataSource
): SpreadsheetDataSource {
    return {
        ...source,
        selectedIds: source.selectedIds
            ? [...source.selectedIds]
            : undefined,
        columns: source.columns ? [...source.columns] : undefined,
        filters: {
            ...(source.filters ?? {})
        }
    };
}

private cloneSheetDataSources(
    items: SpreadsheetSheetDataSource[]
): SpreadsheetSheetDataSource[] {
    return (items ?? []).map(item => ({
        sheetId: item.sheetId,
        sheetName: item.sheetName,
        source: this.cloneSpreadsheetDataSource(item.source)
    }));
}

private getSheetDataSourceByName(
    sheetName: string
): SpreadsheetDataSource | null {
    const item = this.sheetDataSources.find(
        x => x.sheetName === sheetName
    );

    return item
        ? this.cloneSpreadsheetDataSource(item.source)
        : null;
}

private getActiveSheetDataSource(
    savedSpreadsheet?: SavedSpreadsheet | null
): SpreadsheetDataSource | null {
    if (!this.spreadsheet) {
        return this.currentSpreadsheetSource
            ? this.cloneSpreadsheetDataSource(
                this.currentSpreadsheetSource
            )
            : null;
    }

    const activeSheet: any =
        this.spreadsheet.getActiveSheet();

    if (!activeSheet) {
        return null;
    }

    const savedSources =
        savedSpreadsheet?.sheetDataSources?.length
            ? savedSpreadsheet.sheetDataSources
            : this.sheetDataSources;

    const byId = activeSheet.id != null
        ? savedSources.find(
            item => item.sheetId === activeSheet.id
        )
        : undefined;

    const byName = savedSources.find(
        item => item.sheetName === activeSheet.name
    );

    const source = byId?.source ?? byName?.source;

    // No workbook-level source exists anymore. Every data tab must resolve
    // its source/filter from sheetDataSources. currentSpreadsheetSource is
    // runtime UI state only and is not persisted on SavedSpreadsheet.
    if (!source && activeSheet.name === 'Transactions') {
        return this.currentSpreadsheetSource
            ? this.cloneSpreadsheetDataSource(
                this.currentSpreadsheetSource
            )
            : null;
    }

    return source
        ? this.cloneSpreadsheetDataSource(source)
        : null;
}

/**
 * Call this whenever data is loaded into a Spreadsheet tab.
 * The source/filter belongs to THAT tab only.
 *
 * Example from another entity later:
 * registerActiveSheetDataSource({
 *   type: 'Items',
 *   sourceKey: 'ITEMS',
 *   mode: 'AllRecords',
 *   filters: itemFilters
 * });
 */
registerActiveSheetDataSource(
    source: SpreadsheetDataSource
): void {
    if (!this.spreadsheet) {
        return;
    }

    const sheet: any =
        this.spreadsheet.getActiveSheet();

    if (!sheet?.name) {
        return;
    }

    const existingIndex =
        this.sheetDataSources.findIndex(
            item =>
                (sheet.id != null &&
                    item.sheetId === sheet.id) ||
                item.sheetName === sheet.name
        );

    const metadata: SpreadsheetSheetDataSource = {
        sheetId: sheet.id,
        sheetName: sheet.name,
        source: this.cloneSpreadsheetDataSource(source)
    };

    if (existingIndex >= 0) {
        this.sheetDataSources[existingIndex] = metadata;
    } else {
        this.sheetDataSources.push(metadata);
    }

    this.currentSpreadsheetSource =
        this.cloneSpreadsheetDataSource(source);

    this.currentSpreadsheetFilters = {
        ...(source.filters ?? {})
    };
}

private upsertSheetDataSource(
    metadata: SpreadsheetSheetDataSource
): void {
    const normalizedName = String(metadata.sheetName ?? '').trim();

    if (!normalizedName || normalizedName === 'Dashboard') {
        return;
    }

    // Name is the stable key in our wrapper metadata. Syncfusion sheet ids can
    // change after openFromJson()/insertSheet() in EJ2 20.4.x.
    const existingIndex = this.sheetDataSources.findIndex(
        item => String(item.sheetName ?? '').trim() === normalizedName
    );

    const cleanMetadata: SpreadsheetSheetDataSource = {
        sheetId: metadata.sheetId,
        sheetName: normalizedName,
        source: this.cloneSpreadsheetDataSource(metadata.source)
    };

    if (existingIndex >= 0) {
        this.sheetDataSources[existingIndex] = cleanMetadata;
    } else {
        this.sheetDataSources.push(cleanMetadata);
    }

    console.log('[Spreadsheet] source metadata upserted:', {
        sheetName: normalizedName,
        count: this.sheetDataSources.length,
        sheetDataSources: this.sheetDataSources
    });
}

/**
 * Sync ids/names before save. This also keeps metadata correct when the
 * user renames a Spreadsheet tab.
 */
private syncSheetDataSourceIdentity(): void {
    if (!this.spreadsheet?.sheets?.length) {
        return;
    }

    this.sheetDataSources.forEach(item => {
        // Match by name FIRST. Sheet ids are not reliable after openFromJson()
        // and dynamic insertions in EJ2 20.4.x.
        const byName: any = this.spreadsheet!.sheets.find(
            (x: any) =>
                String(x?.name ?? '').trim() ===
                String(item.sheetName ?? '').trim()
        );

        const byId: any = !byName && item.sheetId != null
            ? this.spreadsheet!.sheets.find(
                (x: any) => x?.id === item.sheetId
            )
            : null;

        const sheet = byName ?? byId;

        if (sheet) {
            item.sheetId = sheet.id;
            item.sheetName = sheet.name;
        }
    });

    // Initial Transactions sheet is created before Syncfusion gives us id.
    if (
        this.currentSpreadsheetSource &&
        !this.sheetDataSources.length
    ) {
        const sheet: any =
            this.spreadsheet.sheets.find(
                (x: any) => x?.name === 'Transactions'
            );

        if (sheet) {
            this.sheetDataSources.push({
                sheetId: sheet.id,
                sheetName: sheet.name,
                source: this.cloneSpreadsheetDataSource(
                    this.currentSpreadsheetSource
                )
            });
        }
    }
}


private reconcileDashboardChartsBeforeSave(workbookJson: any): any {
    if (!this.spreadsheet || !workbookJson) {
        return workbookJson;
    }

    const spreadsheet: any = this.spreadsheet as any;
    const activeSheet: any = spreadsheet.getActiveSheet?.();

    // A manual Ctrl+X/Ctrl+V move is reconciled only while Dashboard is active.
    // This prevents normal charts on data sheets from being moved accidentally.
    if (String(activeSheet?.name ?? '').trim() !== 'Dashboard') {
        return workbookJson;
    }

    const clean = JSON.parse(JSON.stringify(workbookJson));
    const workbook = clean?.jsonObject?.Workbook ?? clean?.Workbook;

    if (!workbook || !Array.isArray(workbook.sheets)) {
        return clean;
    }

    const dashboard = workbook.sheets.find(
        (sheet: any) => String(sheet?.name ?? '').trim() === 'Dashboard'
    );

    if (!dashboard) {
        return clean;
    }

    // Collect one canonical serialized model for every chart id.
    const chartById = new Map<string, any>();

    workbook.sheets.forEach((sheet: any) => {
        (sheet?.rows ?? []).forEach((row: any) => {
            (row?.cells ?? []).forEach((cell: any) => {
                if (!Array.isArray(cell?.chart)) {
                    return;
                }

                cell.chart.forEach((chart: any) => {
                    const id = String(chart?.id ?? '').trim();
                    if (id && !chartById.has(id)) {
                        chartById.set(id, JSON.parse(JSON.stringify(chart)));
                    }
                });
            });
        });
    });

    if (!chartById.size) {
        return clean;
    }

    const spreadsheetElement: HTMLElement | null =
        (spreadsheet.element as HTMLElement) ?? null;

    const movedCharts: any[] = [];

    chartById.forEach((chart: any, chartId: string) => {
        const element = document.getElementById(chartId) as HTMLElement | null;

        if (!element) {
            return;
        }

        // Make sure this chart belongs to this Spreadsheet instance.
        if (spreadsheetElement && !spreadsheetElement.contains(element)) {
            return;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const visible =
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            rect.width > 0 &&
            rect.height > 0;

        if (!visible) {
            return;
        }

        const dashboardChart = JSON.parse(JSON.stringify(chart));

        // Preserve the original source range. Only the chart OWNER changes.
        dashboardChart.top = this.readChartPixelValue(
            element.style.top,
            chart.top ?? 20
        );
        dashboardChart.left = this.readChartPixelValue(
            element.style.left,
            chart.left ?? 20
        );
        dashboardChart.width = Math.round(rect.width || chart.width || 480);
        dashboardChart.height = Math.round(rect.height || chart.height || 290);

        movedCharts.push(dashboardChart);
    });

    if (!movedCharts.length) {
        return clean;
    }

    const movedIds = new Set(
        movedCharts
            .map(chart => String(chart?.id ?? '').trim())
            .filter(Boolean)
    );

    // Remove ALL stale/duplicate copies from every serialized sheet first.
    workbook.sheets.forEach((sheet: any) => {
        (sheet?.rows ?? []).forEach((row: any) => {
            (row?.cells ?? []).forEach((cell: any) => {
                if (!Array.isArray(cell?.chart)) {
                    return;
                }

                cell.chart = cell.chart.filter(
                    (chart: any) => !movedIds.has(String(chart?.id ?? '').trim())
                );

                if (!cell.chart.length) {
                    delete cell.chart;
                }
            });
        });
    });

    // Store Dashboard charts in a real Dashboard cell so save/reopen owns them.
    dashboard.rows = Array.isArray(dashboard.rows) ? dashboard.rows : [];
    dashboard.rows[0] = dashboard.rows[0] ?? {};
    dashboard.rows[0].cells = Array.isArray(dashboard.rows[0].cells)
        ? dashboard.rows[0].cells
        : [];
    dashboard.rows[0].cells[0] = dashboard.rows[0].cells[0] ?? {};

    const existingDashboardCharts = Array.isArray(
        dashboard.rows[0].cells[0].chart
    )
        ? dashboard.rows[0].cells[0].chart
        : [];

    const existingIds = new Set(
        existingDashboardCharts
            .map((chart: any) => String(chart?.id ?? '').trim())
            .filter(Boolean)
    );

    movedCharts.forEach(chart => {
        const id = String(chart?.id ?? '').trim();
        if (!id || !existingIds.has(id)) {
            existingDashboardCharts.push(chart);
            if (id) {
                existingIds.add(id);
            }
        }
    });

    dashboard.rows[0].cells[0].chart = existingDashboardCharts;
    dashboard.usedRange = dashboard.usedRange ?? {};
    dashboard.usedRange.rowIndex = Math.max(
        Number(dashboard.usedRange.rowIndex ?? 0),
        0
    );
    dashboard.usedRange.colIndex = Math.max(
        Number(dashboard.usedRange.colIndex ?? 0),
        0
    );

    console.log('[Spreadsheet] Dashboard charts reconciled before save:', {
        movedChartIds: Array.from(movedIds),
        count: movedCharts.length
    });

    return clean;
}

private readChartPixelValue(value: string, fallback: number): number {
    const parsed = Number.parseFloat(String(value ?? '').replace('px', ''));
    return Number.isFinite(parsed) ? parsed : Number(fallback ?? 0);
}

saveSpreadsheetLocal(): void {

    if (!this.spreadsheet) {
        this.notify.warn(
            'Spreadsheet is not ready.'
        );
        return;
    }

    // Keep per-tab metadata separate from Syncfusion workbookJson.
    // Do not add custom properties inside jsonObject.Workbook.
    this.syncSheetDataSourceIdentity();

    const sheetDataSources =
        this.cloneSheetDataSources(this.sheetDataSources);

    (this.spreadsheet as any)
        .saveAsJson(
            this.spreadsheetJsonSerializationOptions
        )
        .then((workbook: any) => {

            // EJ2 20.4.x can visually paste a chart onto Dashboard without
            // moving the chart model to that sheet. Reconcile the serialized
            // workbook with the chart overlays that are actually visible on
            // Dashboard before persisting it.
            workbook = this.reconcileDashboardChartsBeforeSave(workbook);

            const existing: SavedSpreadsheet[] =
                JSON.parse(
                    localStorage.getItem(
                        'savedSpreadsheets'
                    ) || '[]'
                );

            if (this.currentSavedSpreadsheetId) {

                const index =
                    existing.findIndex(
                        x =>
                            x.id ===
                            this.currentSavedSpreadsheetId
                    );

                if (index >= 0) {
                   existing[index] = {

    ...existing[index],

    createdDate:
        existing[index].createdDate,

    updatedDate:
        new Date().toISOString(),

    recordCount:
        this.getWorkbookRecordCount(
            workbook
        ),

    workbookJson:
        workbook,

    sheetDataSources,

    // NEW
    sheetAnalyses:
        JSON.parse(
            JSON.stringify(
                this.sheetAnalyses
            )
        )
};

                    localStorage.setItem(
                        'savedSpreadsheets',
                        JSON.stringify(existing)
                    );

                    this.savedSpreadsheets = existing;

                    this.notify.success(
                        'Spreadsheet updated successfully.'
                    );

                    console.log(
                        'Updated Spreadsheet:',
                        existing[index]
                    );

                    return;
                }
            }

         const newSpreadsheet: SavedSpreadsheet = {

    id:
        Date.now(),

    name:
        'Transaction Spreadsheet ' +
        (existing.length + 1),

    createdDate:
        new Date().toISOString(),

    updatedDate:
        new Date().toISOString(),

    recordCount:
        this.getWorkbookRecordCount(
            workbook
        ),

    workbookJson:
        workbook,

    sheetDataSources,

    sheetAnalyses:
        JSON.parse(
            JSON.stringify(
                this.sheetAnalyses
            )
        )
};

            existing.push(newSpreadsheet);

            localStorage.setItem(
                'savedSpreadsheets',
                JSON.stringify(existing)
            );

            this.savedSpreadsheets = existing;
            this.currentSavedSpreadsheetId =
                newSpreadsheet.id;

            this.notify.success(
                'Spreadsheet created successfully.'
            );

            console.log(
                'Created Spreadsheet:',
                newSpreadsheet
            );
        })
        .catch(error => {
            console.error(
                'Save spreadsheet error:',
                error
            );

            this.notify.error(
                'Failed to save spreadsheet.'
            );
        });
}

private getWorkbookRecordCount(
    workbook: any
): number {

    const transactionSheet =
        workbook
            ?.jsonObject
            ?.Workbook
            ?.sheets
            ?.find(
                (sheet: any) =>
                    sheet.name ===
                    'Transactions'
            );

    if (!transactionSheet?.rows?.length) {
        return 0;
    }

    // remove header row
    return Math.max(
        transactionSheet.rows.length - 1,
        0
    );
}


loadSavedSpreadsheets(): void {

    this.savedSpreadsheets =
        JSON.parse(
            localStorage.getItem(
                'savedSpreadsheets'
            ) || '[]'
        );
}
openSavedSpreadsheet(saved: SavedSpreadsheet): void {

    this.currentSavedSpreadsheetId = saved.id;

    // Per-sheet source/filter metadata is the only persisted source of truth.
    this.sheetDataSources = saved.sheetDataSources?.length
        ? this.cloneSheetDataSources(saved.sheetDataSources)
        : [];

    const initialSource =
        this.getSheetDataSourceByName('Transactions') ??
        this.sheetDataSources[0]?.source ??
        null;

    this.currentSpreadsheetSource = initialSource
        ? this.cloneSpreadsheetDataSource(initialSource)
        : null;

    this.currentSpreadsheetFilters = {
        ...(initialSource?.filters ?? {})
    };

    this.sheetAnalyses = JSON.parse(
        JSON.stringify(
            saved.sheetAnalyses ?? []
        )
    );

    this.isOpeningSavedSpreadsheet = true;
    this.spreadsheetRows = [];
    this.sheets = [];
    this.showSpreadsheetDialog = true;

    setTimeout(() => {

        if (!this.spreadsheet) {
            this.isOpeningSavedSpreadsheet = false;
            return;
        }

        try {

            const cleanWorkbook =
                this.sanitizeWorkbookJson(
                    saved.workbookJson
                );

            const jsonObject =
                cleanWorkbook?.jsonObject ??
                cleanWorkbook;

            console.log(
                'Opening sanitized workbook:',
                jsonObject
            );

            (this.spreadsheet as any).openFromJson(
                {
                    file: jsonObject
                },
                this.spreadsheetJsonSerializationOptions
            );

            setTimeout(() => {

                this.ensureDashboardSheet();
                this.spreadsheet?.resize();

                // Restore the source/filter UI for the tab that Syncfusion
                // actually reopened as active.
                this.syncActiveSheetSourceToUi();

                this.isOpeningSavedSpreadsheet =
                    false;

                this.notify.success(
                    saved.name +
                    ' opened successfully.'
                );

            }, 500);

        } catch (error) {

            this.isOpeningSavedSpreadsheet =
                false;

            console.error(
                'Open spreadsheet error:',
                error
            );

            this.notify.error(
                'Failed to open spreadsheet.'
            );
        }

    }, 300);
}



private serializePivotFields(
    fields: any[]
): any[] {

    if (!fields?.length) {
        return [];
    }

    return fields.map(field => ({

        name:
            field.name,

        caption:
            field.caption ?? field.name,

        type:
            field.type,

        axis:
            field.axis,

        baseField:
            field.baseField,

        baseItem:
            field.baseItem,

        showNoDataItems:
            field.showNoDataItems ?? false

    }));
}

private serializePivotFilters(
    filters: any[]
): any[] {

    if (!filters?.length) {
        return [];
    }

    return filters.map(filter => ({

        name:
            filter.name,

        type:
            filter.type,

        condition:
            filter.condition,

        value1:
            filter.value1,

        value2:
            filter.value2,

        measure:
            filter.measure,

        levelCount:
            filter.levelCount,

        items:
            Array.isArray(filter.items)
                ? [...filter.items]
                : []

    }));
}
private serializePivotSortSettings(
    settings: any[]
): any[] {

    if (!settings?.length) {
        return [];
    }

    return settings.map(item => ({

        name:
            item.name,

        order:
            item.order

    }));
}


/////////////////  save filter


private getCurrentSpreadsheetFilters(): SpreadsheetFilters {

    const filters =
        this.filterForm?.value ?? {};

    return {
        search:
            filters.search || undefined,

        codeFilter:
            filters.codeFilter || undefined,

        mainFilterTypeId:
            filters.mainFilterType?.id,

        minCreateDateFilter:
            filters.minCreateDateFilter || undefined,

        maxCreateDateFilter:
            filters.maxCreateDateFilter || undefined,

        minCompleteDateFilter:
            filters.minCompleteDateFilter || undefined,

        maxCompleteDateFilter:
            filters.maxCompleteDateFilter || undefined,

        sellerNameFilter:
            filters.sellerNameFilter || undefined,

        buyerNameFilter:
            filters.buyerNameFilter || undefined,

        // IMPORTANT:
        // no status selected => undefined
        statusFilter:
            filters.statusFilter === null ||
            filters.statusFilter === undefined ||
            filters.statusFilter === 0
                ? undefined
                : Number(filters.statusFilter),

        referenceNumberFilter:
            filters.referenceNumberFilter || undefined,

        sorting:
            this.getSpreadsheetSorting()
    };
}



getAppliedSpreadsheetFilters(): {
    label: string;
    value: string;
}[] {

    const filters =
        this.currentSpreadsheetFilters;

    if (!filters) {
        return [];
    }

    const result: {
        label: string;
        value: string;
    }[] = [];


    if (filters.search) {
        result.push({
            label: 'Search',
            value: filters.search
        });
    }


    if (filters.sellerNameFilter) {
        result.push({
            label: 'Seller',
            value: filters.sellerNameFilter
        });
    }


    if (filters.buyerNameFilter) {
        result.push({
            label: 'Buyer',
            value: filters.buyerNameFilter
        });
    }


    if (filters.codeFilter) {
        result.push({
            label: 'Transaction',
            value: filters.codeFilter
        });
    }


    if (filters.referenceNumberFilter) {
        result.push({
            label: 'Reference',
            value:
                filters.referenceNumberFilter
        });
    }


    if (
        filters.statusFilter !== undefined &&
        filters.statusFilter !== null
    ) {

        const status =
            this.filterStatus?.find(
                x =>
                    x.value ===
                    filters.statusFilter
            );

        result.push({
            label: 'Status',
            value:
                status?.label ??
                String(filters.statusFilter)
        });
    }


    if (filters.minCreateDateFilter) {
        result.push({
            label: 'Created From',
            value:
                this.formatSpreadsheetFilterDate(
                    filters.minCreateDateFilter
                )
        });
    }


    if (filters.maxCreateDateFilter) {
        result.push({
            label: 'Created To',
            value:
                this.formatSpreadsheetFilterDate(
                    filters.maxCreateDateFilter
                )
        });
    }


    if (filters.minCompleteDateFilter) {
        result.push({
            label: 'Complete From',
            value:
                this.formatSpreadsheetFilterDate(
                    filters.minCompleteDateFilter
                )
        });
    }


    if (filters.maxCompleteDateFilter) {
        result.push({
            label: 'Complete To',
            value:
                this.formatSpreadsheetFilterDate(
                    filters.maxCompleteDateFilter
                )
        });
    }


    if (filters.sorting) {
        result.push({
            label: 'Sorting',
            value: filters.sorting
        });
    }


    return result;
}

private formatSpreadsheetFilterDate(
    value: any
): string {

    if (!value) {
        return '';
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString();
}




pivotFieldSearch = '';

get pivotFields(): any[] {

    const fields =
        this.pivotDataSourceSettings
            ?.fieldMapping ?? [];

    const search =
        this.pivotFieldSearch
            .trim()
            .toLowerCase();

    if (!search) {
        return fields;
    }

    return fields.filter(
        (field: any) =>
            String(
                field.caption ??
                field.name ??
                ''
            )
                .toLowerCase()
                .includes(search)
    );
}


get pivotDimensionFields(): any[] {

    return this.pivotFields.filter(
        field =>
            field.dataType !== 'number'
    );
}


get pivotMeasureFields(): any[] {

    return this.pivotFields.filter(
        field =>
            field.dataType === 'number'
    );
}



get hasSavedPivotForActiveSheet(): boolean {
    if (!this.spreadsheet) {
        return false;
    }

    try {
        const sheet = this.spreadsheet.getActiveSheet();

        if (!sheet?.name) {
            return false;
        }

        return this.sheetAnalyses.some(
            item => item.sheetName === sheet.name
        );

    } catch {
        return false;
    }
}

private getSavedAnalysisForActiveSheet():
    SavedSheetAnalysis | null {

    if (!this.spreadsheet) {
        return null;
    }

    const sheet = this.spreadsheet.getActiveSheet();

    if (!sheet?.name) {
        return null;
    }

    return this.sheetAnalyses.find(
        item => item.sheetName === sheet.name
    ) ?? null;
}

async viewSavedPivotForCurrentSheet(): Promise<void> {

    const analysis =
        this.getSavedAnalysisForActiveSheet();

    if (!analysis) {
        this.notify.info(
            'This sheet does not have a saved Pivot Table.'
        );
        return;
    }

    await this.openPivotAnalysis(analysis);
}

saveCurrentSheetAnalysis(): void {

    if (!this.spreadsheet || !this.pivotView) {
        this.notify.warn('Pivot analysis is not ready.');
        return;
    }

    const sheetName =
        this.currentPivotSheetName ||
        this.spreadsheet.getActiveSheet()?.name;

    if (!sheetName) {
        this.notify.warn('Spreadsheet sheet is not available.');
        return;
    }

    const settings =
        this.pivotView.dataSourceSettings;

    const existingAnalysis =
        this.sheetAnalyses.find(
            item => item.sheetName === sheetName
        );

    const analysis: SavedSheetAnalysis = {
        ...(existingAnalysis ?? {}),
        sheetName,
        dashboardWidgetId:
            existingAnalysis?.dashboardWidgetId,

        pivot: {
            rows: this.serializePivotFields(
                settings?.rows
            ),
            columns: this.serializePivotFields(
                settings?.columns
            ),
            values: this.serializePivotFields(
                settings?.values
            ),
            filters: this.serializePivotFields(
                settings?.filters
            ),
            filterSettings: this.serializePivotFilters(
                settings?.filterSettings
            ),
            sortSettings: this.serializePivotSortSettings(
                settings?.sortSettings
            )
        },

        chart: {
            type: this.selectedPivotChartType,
            title:
                this.pivotChartSettings?.title ||
                `${sheetName} Pivot Chart`,
            enableMultipleAxis:
                this.pivotChartSettings
                    ?.enableMultipleAxis ?? false
        }
    };

    const existingIndex =
        this.sheetAnalyses.findIndex(
            item => item.sheetName === sheetName
        );

    if (existingIndex >= 0) {
        this.sheetAnalyses[existingIndex] = analysis;
    } else {
        this.sheetAnalyses.push(analysis);
    }

    console.log(
        'Saved Pivot for sheet:',
        sheetName,
        analysis
    );

    // Save workbook JSON + all sheet Pivot/Chart configs together.
    // This makes the Pivot Save button enough for reopen.
    this.saveSpreadsheetLocal();
}


private refreshSpreadsheetLayout(): void {
    if (!this.spreadsheet) {
        return;
    }

    setTimeout(() => {
        if (!this.spreadsheet) {
            return;
        }

        try {
            this.spreadsheet.resize();
        } catch (error) {
            console.error(
                'Spreadsheet resize failed:',
                error
            );
        }
    }, 100);
}

private sanitizeWorkbookJson(workbookJson: any): any {
    if (!workbookJson) {
        return workbookJson;
    }

    const cleanJson = JSON.parse(
        JSON.stringify(workbookJson)
    );

    const workbook =
        cleanJson?.jsonObject?.Workbook ??
        cleanJson?.Workbook;

    if (!workbook) {
        return cleanJson;
    }

    if (!Array.isArray(workbook.sheets)) {
        workbook.sheets = [];
    }

    // IMPORTANT:
    // Top-level sheets must NEVER contain null/undefined.
    workbook.sheets = workbook.sheets
        .filter(
            (sheet: any) =>
                sheet &&
                typeof sheet === 'object' &&
                Object.keys(sheet).length > 0
        )
        .map((sheet: any) => {

            // Preserve indexes inside columns/rows/cells.
            // Sparse positions must become {}, not be removed.
            if (Array.isArray(sheet.columns)) {
                sheet.columns = sheet.columns.map(
                    (column: any) => column ?? {}
                );
            }

            if (Array.isArray(sheet.rows)) {
                sheet.rows = sheet.rows.map(
                    (row: any) => {

                        if (!row) {
                            return {};
                        }

                        if (Array.isArray(row.cells)) {
                            row.cells = row.cells.map(
                                (cell: any) =>
                                    cell ?? {}
                            );
                        }

                        return row;
                    }
                );
            }

            if (Array.isArray(sheet.ranges)) {
                sheet.ranges =
                    sheet.ranges.filter(
                        (range: any) =>
                            range &&
                            typeof range === 'object'
                    );
            }

            if (Array.isArray(sheet.charts)) {
                sheet.charts =
                    sheet.charts.filter(
                        (chart: any) =>
                            chart &&
                            typeof chart === 'object'
                    );
            }

            if (Array.isArray(sheet.images)) {
                sheet.images =
                    sheet.images.filter(
                        (image: any) =>
                            image &&
                            typeof image === 'object'
                    );
            }

            return sheet;
        });

    if (!workbook.sheets.length) {
        workbook.sheets = [
            {
                name: 'Sheet1',
                rows: [],
                columns: []
            }
        ];
    }

    let activeSheetIndex =
        Number(workbook.activeSheetIndex ?? 0);

    if (
        !Number.isFinite(activeSheetIndex) ||
        activeSheetIndex < 0 ||
        activeSheetIndex >= workbook.sheets.length
    ) {
        activeSheetIndex = 0;
    }

    workbook.activeSheetIndex =
        activeSheetIndex;

    return cleanJson;
}

refreshingSpreadsheet = false;
// =====================================================
// REFRESH SPREADSHEET DATA
// =====================================================

async refreshSpreadsheetData(): Promise<void> {

    if (
        this.refreshingSpreadsheet ||
        !this.spreadsheet
    ) {
        return;
    }

    const savedSpreadsheet =
        this.getCurrentSavedSpreadsheet();

    const activeSheet =
        this.spreadsheet.getActiveSheet();

    const activeSheetName =
        activeSheet?.name;

    if (!activeSheetName) {
        this.notify.warn('Active Spreadsheet tab is not available.');
        return;
    }

    // Refresh ONLY from the source/filter belonging to the active tab.
    const source =
        this.getActiveSheetDataSource(savedSpreadsheet);

    if (!source) {
        this.notify.warn(
            'Spreadsheet source is not available.'
        );
        return;
    }

    const savedFilters =
        source.filters ?? {};

    /*
     * IMPORTANT:
     * StatusId=0 means "no status filter" in this screen.
     * Do not send StatusId=0 to GetAll because the backend treats
     * it as a real status id and returns no rows.
     */
    const refreshFilters: SpreadsheetFilters = {
        ...savedFilters,
        statusFilter:
            savedFilters.statusFilter === null ||
            savedFilters.statusFilter === undefined ||
            Number(savedFilters.statusFilter) === 0
                ? undefined
                : Number(savedFilters.statusFilter)
    };

    console.log(
        '[Spreadsheet Refresh] final filters:',
        refreshFilters
    );

    const selectedIds =
        source.mode === 'SelectedRecords' &&
        source.selectedIds?.length
            ? new Set(
                source.selectedIds.map(
                    id => Number(id)
                )
            )
            : null;

    this.refreshingSpreadsheet = true;
    this.spreadsheetLoadingProgress = 0;
    this.spreadsheetLoadingMessage =
        'Loading latest transactions...';

    let skipCount = 0;
    let batchNumber = 0;
    let displayedRecordCount = 0;
    let sourceRecordCount = 0;
    let sheetCleared = false;

    try {

        while (true) {

            batchNumber++;

            console.log(
                `[Spreadsheet Refresh] requesting batch ${batchNumber}`,
                {
                    skipCount,
                    maxResultCount:
                        this.spreadsheetBatchSize
                }
            );

            const result: any =
                await firstValueFrom(
                    this.getSpreadsheetSourcePage(
                        source,
                        refreshFilters,
                        skipCount,
                        this.spreadsheetBatchSize
                    )
                );

            const items: any[] =
                result?.items ?? [];

            console.log(
                `[Spreadsheet Refresh] batch ${batchNumber} received`,
                {
                    returned: items.length,
                    skipCount,
                    apiTotalCount:
                        result?.totalCount
                }
            );

            /*
             * Clear the previous source rows only after the first API call
             * succeeds. This prevents an HTTP error from immediately wiping
             * the user's existing Spreadsheet.
             */
            if (!sheetCleared) {
                this.clearSpreadsheetSourceRowsForRefresh(
                    activeSheetName
                );
                sheetCleared = true;

                // Let the cleared sheet paint before inserting batch 1.
                await this.yieldToBrowser();
            }

            if (!items.length) {
                break;
            }

            sourceRecordCount += items.length;

            /*
             * For SelectedRecords the GetAll API still pages the complete
             * saved source query. Filter each received batch before writing it
             * to the Spreadsheet, but continue paging based on the ORIGINAL
             * API page size, not the filtered size.
             */
            const batchItems =
                selectedIds
                    ? items.filter(
                        (record: any) =>
                            selectedIds.has(
                                Number(record?.id)
                            )
                    )
                    : items;

            if (batchItems.length) {

                const batchRows:
                    TransactionSpreadsheetRow[] =
                    batchItems.map(
                        (record: any) =>
                            this.mapTransactionToSpreadsheetRow(
                                record
                            )
                    );

                /*
                 * displayStartIndex is zero based for DATA rows:
                 *   0  => Spreadsheet row 2
                 *   10 => Spreadsheet row 12
                 * Header always remains in row 1.
                 */
                this.appendSpreadsheetRefreshBatch(
                    'Transactions',
                    batchRows,
                    displayedRecordCount
                );

                displayedRecordCount +=
                    batchRows.length;
            }

            const apiTotalCount =
                Number(result?.totalCount ?? 0);

            if (apiTotalCount > 0) {
                this.spreadsheetLoadingProgress =
                    Math.min(
                        100,
                        Math.round(
                            (
                                Math.min(
                                    sourceRecordCount,
                                    apiTotalCount
                                ) /
                                apiTotalCount
                            ) * 100
                        )
                    );
            }

            this.spreadsheetLoadingMessage =
                `Loading latest transactions... ` +
                `${displayedRecordCount.toLocaleString()} displayed`;

   
            await this.yieldToBrowser();

            // Always page 0 -> 10 -> 20 -> 30 ...
            skipCount +=
                this.spreadsheetBatchSize;

            // Short page = final page.
            if (
                items.length <
                this.spreadsheetBatchSize
            ) {
                break;
            }
        }

        /*
         * Recalculate/refresh Pivot only ONCE after all batches are displayed.
         * Rebuilding it after every 10 records would be expensive.
         */
        await this.yieldToBrowser();
        await this.refreshCurrentPivotAfterSpreadsheetRefresh();

        this.persistRefreshedSpreadsheet(
            displayedRecordCount
        );

        this.notify.success(
            `Spreadsheet refreshed successfully. ` +
            `${displayedRecordCount.toLocaleString()} records loaded.`
        );

    } catch (error) {

        console.error(
            'Spreadsheet refresh failed:',
            error
        );

        this.notify.error(
            'Unable to refresh spreadsheet data.'
        );

    } finally {
        this.refreshingSpreadsheet = false;
        this.spreadsheetLoadingProgress = 0;
        this.spreadsheetLoadingMessage = '';
    }
}


// =====================================================
// PROGRESSIVE REFRESH: CLEAR OLD SOURCE ROWS ONCE
// =====================================================
private clearSpreadsheetSourceRowsForRefresh(
    sheetName: string
): void {

    if (!this.spreadsheet) {
        return;
    }

    const sheetIndex =
        this.spreadsheet.sheets.findIndex(
            (sheet: any) =>
                sheet?.name === sheetName
        );

    if (sheetIndex < 0) {
        return;
    }

    const sheet: any =
        this.spreadsheet.sheets[
            sheetIndex
        ];

    const headers =
        this.getSheetHeaders(sheet);

    if (!headers.length) {
        return;
    }

    const oldLastRowIndex =
        sheet?.usedRange?.rowIndex ?? 0;

    if (oldLastRowIndex < 1) {
        return;
    }

    const lastColumnName =
        this.getColumnName(
            headers.length - 1
        );

    this.spreadsheet.clear({
        range:
            `${sheetName}!A2:` +
            `${lastColumnName}` +
            `${oldLastRowIndex + 1}`,
        type: 'Clear Contents'
    } as any);
}


// =====================================================
// PROGRESSIVE REFRESH: APPEND ONE RECEIVED API BATCH
// =====================================================
private appendSpreadsheetRefreshBatch(
    sheetName: string,
    rows: TransactionSpreadsheetRow[],
    displayStartIndex: number
): void {

    if (
        !this.spreadsheet ||
        !rows?.length
    ) {
        return;
    }

    const sheetIndex =
        this.spreadsheet.sheets.findIndex(
            (sheet: any) =>
                sheet?.name === sheetName
        );

    if (sheetIndex < 0) {
        return;
    }

    const sheet: any =
        this.spreadsheet.sheets[
            sheetIndex
        ];

    const headers =
        this.getSheetHeaders(sheet);

    if (!headers.length) {
        return;
    }

    const projectedRows =
        rows.map(row => {

            const projected: any = {};

            headers.forEach(
                header => {
                    projected[header] =
                        (row as any)[header] ?? '';
                }
            );

            return projected;
        });

    /*
     * Spreadsheet row 1 = header.
     * First data batch starts at row 2.
     */
    const startExcelRow =
        displayStartIndex + 2;

    this.spreadsheet.updateRange(
        {
            dataSource: projectedRows,
            startCell:
                `A${startExcelRow}`,
            showFieldAsHeader: false
        } as any,
        sheetIndex
    );

    console.log(
        '[Spreadsheet Refresh] batch displayed',
        {
            startExcelRow,
            count: projectedRows.length
        }
    );
}


// =====================================================
// GET LATEST RECORDS USING SAVED SOURCE FILTERS
// =====================================================
private getSpreadsheetSourcePage(
    source: SpreadsheetDataSource,
    filters: SpreadsheetFilters | Record<string, any>,
    skipCount: number,
    maxResultCount: number
): any {
    const sourceKey =
        source.sourceKey ?? source.type;

    switch (sourceKey) {
        case 'TRANSACTIONS':
        case 'Transactions':
            return this.getTransactionsForSpreadsheetRefresh(
                filters as SpreadsheetFilters,
                skipCount,
                maxResultCount
            );

        default:
            throw new Error(
                `Unsupported Spreadsheet source: ${sourceKey}`
            );
    }
}

private getTransactionsForSpreadsheetRefresh(
    filters: SpreadsheetFilters,
    skipCount = 0,
    maxResultCount = this.spreadsheetBatchSize
) {

    return this._appTransactionServiceProxy
        .getAll(
            false,
            0,
            undefined,

            filters.search,
            filters.codeFilter,
            undefined,

            filters.mainFilterTypeId,

            filters.minCreateDateFilter,
            filters.maxCreateDateFilter,

            filters.minCompleteDateFilter,
            filters.maxCompleteDateFilter,

            filters.sellerNameFilter,
            undefined,

            filters.buyerNameFilter,
            undefined,

            filters.statusFilter == null
                ? undefined
                : filters.statusFilter,

            false,
            undefined,
            undefined,

            filters.referenceNumberFilter,

            this.getStableSpreadsheetSorting(
                filters.sorting
            ),

            skipCount,
            maxResultCount
        );
}

// =====================================================
// STABLE SORTING FOR PAGED SPREADSHEET LOADS
// =====================================================
private getSpreadsheetSorting(): string | undefined {

    const sortField =
        this.dataTable?.sortField;

    const sortOrder =
        this.dataTable?.sortOrder;

    // User did NOT sort anything.
    if (!sortField || !sortOrder) {
        return undefined;
    }

    return `${sortField} ${
        sortOrder === 1 ? 'ASC' : 'DESC'
    }`;
}
private getStableSpreadsheetSorting(
    sorting?: string
): string | undefined {

    const value =
        String(sorting ?? '').trim();

    return value || undefined;
}

// =====================================================
// LARGE DATA: LOAD EXISTING GETALL API IN BATCHES
// =====================================================

private async loadSpreadsheetTransactionsInBatches(
    filters: SpreadsheetFilters,
    expectedTotalCount?: number
): Promise<any[]> {

    const records: any[] = [];

    let skipCount = 0;
    let batchNumber = 0;

    /*
     * OPEN ALL:
     * expectedTotalCount is supplied from the current table, so we can stop
     * once that many rows have been requested.
     *
     * REFRESH:
     * expectedTotalCount is intentionally omitted. Do NOT trust result.totalCount
     * for deciding whether another page exists. Keep requesting 10 by 10 until
     * the backend returns a short page (< batch size) or an empty page.
     */
    const hasExpectedTotalCount =
        expectedTotalCount !== null &&
        expectedTotalCount !== undefined;

    const expected = hasExpectedTotalCount
        ? Number(expectedTotalCount)
        : null;

    while (true) {

        batchNumber++;

        console.log(
            `[Spreadsheet] loading batch ${batchNumber}`,
            {
                skipCount,
                maxResultCount: this.spreadsheetBatchSize,
                expectedTotalCount: expected,
                mode: hasExpectedTotalCount
                    ? 'OpenAll'
                    : 'Refresh'
            }
        );

        const result: any =
            await firstValueFrom(
                this.getTransactionsForSpreadsheetRefresh(
                    filters,
                    skipCount,
                    this.spreadsheetBatchSize
                )
            );

        const items: any[] =
            result?.items ?? [];

        console.log(
            `[Spreadsheet] batch ${batchNumber} response`,
            {
                skipCount,
                returned: items.length,
                apiTotalCount: result?.totalCount,
                expectedTotalCount: expected
            }
        );

        // No more data.
        if (!items.length) {
            break;
        }

        records.push(...items);

        /*
         * Always move by the requested page size:
         * 0 -> 10 -> 20 -> 30 ...
         */
        skipCount += this.spreadsheetBatchSize;

        if (hasExpectedTotalCount && expected! > 0) {

            const loaded =
                Math.min(records.length, expected!);

            this.spreadsheetLoadingProgress =
                Math.min(
                    100,
                    Math.round(
                        (loaded / expected!) * 100
                    )
                );

            this.spreadsheetLoadingMessage =
                `Loading ${loaded.toLocaleString()} of ` +
                `${expected!.toLocaleString()} transactions...`;

            // Open All: table already told us how many records exist.
            if (skipCount >= expected!) {
                break;
            }

        } else {

            /*
             * Refresh: the latest total can be stale/wrong for paging, so it is
             * display-only. Continue based on page length instead.
             */
            this.spreadsheetLoadingMessage =
                `Loading latest transactions... ` +
                `${records.length.toLocaleString()} loaded`;

            // A short page means this is the last page.
            if (items.length < this.spreadsheetBatchSize) {
                break;
            }
        }

        await this.yieldToBrowser();
    }

    console.log(
        '[Spreadsheet] finished',
        {
            loaded: records.length,
            expectedTotalCount: expected
        }
    );

    return records;
}

private yieldToBrowser(): Promise<void> {
    return new Promise(resolve =>
        setTimeout(resolve, 0)
    );
}



// =====================================================
// LARGE FILE SAVE
// =====================================================

beforeSpreadsheetSave(args: any): void {
    /*
     * Syncfusion recommendation for large Save-As operations.
     * Requires (beforeSave)="beforeSpreadsheetSave($event)" in HTML.
     */
    if (args) {
        args.isFullPost = false;
    }
}



// =====================================================
// FIND CURRENT SAVED SPREADSHEET
// =====================================================

private getCurrentSavedSpreadsheet():
    SavedSpreadsheet | null {

    if (!this.currentSavedSpreadsheetId) {
        return null;
    }

    return this.savedSpreadsheets.find(
        item =>
            item.id ===
            this.currentSavedSpreadsheetId
    ) ?? null;
}


// =====================================================
// READ SHEET HEADERS
// =====================================================

private getSheetHeaders(
    sheet: any
): string[] {

    const headerCells =
        sheet?.rows?.[0]?.cells ?? [];

    /*
     * Use actual header cells instead of usedRange.colIndex
     * because a sheet may contain a chart far to the right,
     * which can make usedRange wider than the source table.
     */
    const headers: string[] = [];

    for (
        let index = 0;
        index < headerCells.length;
        index++
    ) {

        const value =
            headerCells[index]?.value;

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ''
        ) {
            /*
             * Stop at first empty header AFTER data headers.
             * This prevents chart/overlay cells from becoming
             * fake Pivot fields.
             */
            if (headers.length > 0) {
                break;
            }

            continue;
        }

        headers.push(
            String(value).trim()
        );
    }

    return headers;
}


// =====================================================
// AUTO REFRESH CURRENT PIVOT + CHART
// =====================================================

private async refreshCurrentPivotAfterSpreadsheetRefresh():
    Promise<void> {

    /*
     * No Pivot currently created/opened.
     * Saved Pivot config is still kept in sheetAnalyses
     * and will use latest Spreadsheet data next time opened.
     */
    if (
        !this.pivotView ||
        !this.currentPivotSheetName
    ) {
        return;
    }

    const sheet: any =
        this.spreadsheet?.sheets?.find(
            (item: any) =>
                item?.name ===
                this.currentPivotSheetName
        );

    if (!sheet) {
        return;
    }

    const lastRowIndex =
        sheet.usedRange?.rowIndex ?? 0;

    const headers =
        this.getSheetHeaders(sheet);

    if (
        lastRowIndex < 1 ||
        !headers.length
    ) {

        this.pivotData = [];

        this.pivotDataSourceSettings = {
            ...this.pivotDataSourceSettings,
            dataSource: []
        };

        this.refreshPivot();

        return;
    }

    const lastColumnIndex =
        headers.length - 1;

    const lastColumn =
        this.getColumnName(
            lastColumnIndex
        );

    const lastRow =
        lastRowIndex + 1;

    const range =
        `${sheet.name}!A1:` +
        `${lastColumn}${lastRow}`;

    try {

        const spreadsheetData =
            await this.spreadsheet!
                .getData(range);

        const refreshedPivotData =
            this.convertSpreadsheetToPivotData(
                spreadsheetData,
                lastRowIndex,
                lastColumnIndex
            ) as IDataSet[];

        this.pivotData =
            refreshedPivotData;

        /*
         * Keep rows/columns/values/filters/chart settings.
         * Replace ONLY the source data + dynamic field mapping.
         */
        this.pivotDataSourceSettings = {
            ...this.pivotDataSourceSettings,

            dataSource:
                refreshedPivotData,

            fieldMapping:
                this.createDynamicPivotFieldMapping(
                    refreshedPivotData
                )
        };

        if (this.pivotView) {

            this.pivotView.dataSourceSettings =
                this.pivotDataSourceSettings;

            this.pivotView.chartSettings =
                this.pivotChartSettings;

            if (
                typeof this.pivotView.dataBind ===
                'function'
            ) {
                this.pivotView.dataBind();
            }

            if (
                typeof this.pivotView.refresh ===
                'function'
            ) {
                this.pivotView.refresh();
            }
        }

        console.log(
            'Pivot and chart refreshed:',
            this.currentPivotSheetName,
            refreshedPivotData.length
        );

    } catch (error) {

        console.error(
            'Unable to refresh Pivot after Spreadsheet refresh:',
            error
        );
    }
}


// =====================================================
// SILENTLY STORE THE REFRESHED WORKBOOK FOR SAVED FILES
// =====================================================

private persistRefreshedSpreadsheet(
    recordCount: number
): void {

    /*
     * New unsaved Spreadsheet:
     * refresh the live sheet only.
     * User can press Save later.
     */
    if (
        !this.currentSavedSpreadsheetId ||
        !this.spreadsheet
    ) {
        return;
    }

    (this.spreadsheet as any)
        .saveAsJson(
            this.spreadsheetJsonSerializationOptions
        )
        .then((workbook: any) => {

            const existing:
                SavedSpreadsheet[] =
                JSON.parse(
                    localStorage.getItem(
                        'savedSpreadsheets'
                    ) || '[]'
                );

            const index =
                existing.findIndex(
                    item =>
                        item.id ===
                        this.currentSavedSpreadsheetId
                );

            if (index < 0) {
                return;
            }

            // Strip obsolete top-level dataSource if this was an older save.
            const { dataSource: _legacyDataSource, ...existingWithoutLegacySource } =
                existing[index] as any;

            existing[index] = {
                ...existingWithoutLegacySource,

                updatedDate:
                    new Date().toISOString(),

                recordCount,

                workbookJson:
                    workbook,

                // Source/filter metadata for every tab.
                sheetDataSources:
                    this.cloneSheetDataSources(
                        this.sheetDataSources
                    ),

                sheetAnalyses:
                    JSON.parse(
                        JSON.stringify(
                            this.sheetAnalyses
                        )
                    )
            };

            localStorage.setItem(
                'savedSpreadsheets',
                JSON.stringify(existing)
            );

            this.savedSpreadsheets =
                existing;

            console.log(
                'Refreshed Spreadsheet saved:',
                existing[index]
            );
        })
        .catch(error => {

            console.error(
                'Unable to save refreshed workbook:',
                error
            );
        });
}

}

interface SpreadsheetEntityColumnDefinition { key:string; label:string; type:'string'|'number'|'date'|'boolean'; defaultSelected?:boolean; }
interface SpreadsheetEntityFilterDefinition { key:string; label:string; type:'string'|'number'|'date'|'boolean'|'statusLookup'; }
interface SpreadsheetEntityDefinition { sourceKey:string; displayName:string; icon?:string; columns:SpreadsheetEntityColumnDefinition[]; filters:SpreadsheetEntityFilterDefinition[]; }

interface SpreadsheetFilters {
    search?: string;
    codeFilter?: string;
    mainFilterTypeId?: number;

    minCreateDateFilter?: any;
    maxCreateDateFilter?: any;
    minCompleteDateFilter?: any;
    maxCompleteDateFilter?: any;

    sellerNameFilter?: string;
    buyerNameFilter?: string;

    statusFilter?: number;

    referenceNumberFilter?: string;
    sorting?: string;
}

interface SpreadsheetDataSource {
    // Keep this extensible because another tab may later come from
    // Items, Contacts, Accounts, etc.
    type: string;
    sourceKey?: string;
    mode: 'SelectedRecords' | 'AllRecords';
    selectedIds?: number[];
    columns?: string[];
    filters?: SpreadsheetFilters | Record<string, any>;
}

interface SpreadsheetSheetDataSource {
    // Syncfusion sheet id is preferred when available because the user
    // can rename a tab. sheetName is kept for readability/fallback.
    sheetId?: number;
    sheetName: string;
    source: SpreadsheetDataSource;
}

interface SavedSpreadsheet {
    id: number;
    name: string;
    createdDate: string;
    updatedDate?: string;
    recordCount: number;
    workbookJson: any;

    // One source/filter definition per Spreadsheet tab.
    // This is wrapper metadata, NOT a property added to Syncfusion Workbook.
    sheetDataSources?: SpreadsheetSheetDataSource[];

    sheetAnalyses?: SavedSheetAnalysis[];
}


interface SavedSheetAnalysis {
    id?: number;
    sheetName: string;
    dashboardWidgetId?: number;

    pivot: {
        rows: any[];
        columns: any[];
        values: any[];
        filters: any[];
        filterSettings?: any[];
        sortSettings?: any[];
    };

    chart: {
        type: string;
        title: string;
        enableMultipleAxis?: boolean;
    };
}
