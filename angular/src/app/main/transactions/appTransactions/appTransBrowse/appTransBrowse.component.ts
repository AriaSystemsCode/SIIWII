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

    /**
     * Syncfusion virtual scrolling is enabled by default, but we keep the
     * configuration explicit so it is not accidentally disabled later.
     *
     * Bind this in HTML:
     * [allowScrolling]="true"
     * [scrollSettings]="spreadsheetScrollSettings"
     */
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
    currentSpreadsheetSource: SpreadsheetDataSource | null = null;


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
pivotGroupingBarSettings = {
    showFieldsPanel: true,
    displayMode: 'Table',
    allowDragAndDrop: true,
    showFilterIcon: true,
    showSortIcon: true,
    showRemoveIcon: true,
    showValueTypeIcon: true
};

    changePivotReport(): void {
        this.applyPivotReport(this.selectedPivotReport);
    }

    private applyPivotReport(report: string): void {
        switch (report) {
            case 'transactionsByBuyer':
                this.showTransactionsByBuyer();
                break;

            case 'salesOrderCount':
                this.showOrderTypeCount('sales');
                break;

            case 'purchaseOrderCount':
                this.showOrderTypeCount('purchase');
                break;

            case 'salesOrdersBySeller':
                this.showOrdersBySeller('sales');
                break;

            case 'purchaseOrdersBySeller':
                this.showOrdersBySeller('purchase');
                break;

            case 'salesOrdersPerWeekCurrentMonth':
                this.showSalesOrdersPerWeekCurrentMonth();
                break;

            case 'transactionsBySeller':
            default:
                this.showTransactionsBySeller();
                break;
        }

        this.refreshPivot();
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
savePivotToDashboard(): void {

    if (!this.pivotView) {
        this.notify.warn('Pivot analysis is not ready.');
        return;
    }

    if (!this.currentSavedSpreadsheetId) {
        this.notify.warn('Save the Spreadsheet first.');
        return;
    }

    const sheetName =
        this.currentPivotSheetName ||
        this.spreadsheet?.getActiveSheet()?.name;

    if (!sheetName) {
        this.notify.warn('Spreadsheet sheet is not available.');
        return;
    }

    const settings = this.pivotView.dataSourceSettings;

    // One saved analysis currently exists per Spreadsheet sheet.
    // Its dashboardWidgetId is the stable link to the dashboard card.
    const analysisIndex = this.sheetAnalyses.findIndex(
        item => item.sheetName === sheetName
    );

    const existingAnalysis =
        analysisIndex >= 0
            ? this.sheetAnalyses[analysisIndex]
            : null;

    const existingWidgets: any[] = JSON.parse(
        localStorage.getItem('dashboardPivotWidgets') || '[]'
    );

    let dashboardWidgetId =
        existingAnalysis?.dashboardWidgetId ?? null;

    // Backward compatibility for widgets saved before dashboardWidgetId
    // was stored inside sheetAnalyses.
    if (!dashboardWidgetId) {
        const oldWidget = existingWidgets.find(
            (item: any) =>
                Number(item.sourceSpreadsheetId) ===
                    Number(this.currentSavedSpreadsheetId) &&
                (item.sourceSheetName ?? item.dataSourceType ?? 'Transactions') ===
                    sheetName
        );

        if (oldWidget) {
            dashboardWidgetId = oldWidget.id;
        }
    }

    const isUpdate = !!dashboardWidgetId;

    if (!dashboardWidgetId) {
        dashboardWidgetId = Date.now();
    }

    const now = new Date().toISOString();

    const pivot = {
        rows: this.serializePivotFields(settings?.rows),
        columns: this.serializePivotFields(settings?.columns),
        values: this.serializePivotFields(settings?.values),
        filters: this.serializePivotFields(settings?.filters),
        filterSettings: this.serializePivotFilters(
            settings?.filterSettings
        ),
        sortSettings: this.serializePivotSortSettings(
            settings?.sortSettings
        )
    };

    const chart = {
        type: this.selectedPivotChartType,
        title:
            this.pivotChartSettings?.title ||
            `${sheetName} Pivot Chart`,
        enableMultipleAxis:
            this.pivotChartSettings?.enableMultipleAxis ?? false
    };

    // Keep the same dashboardWidgetId in the Spreadsheet analysis.
    const updatedAnalysis: SavedSheetAnalysis = {
        ...(existingAnalysis ?? {}),
        sheetName,
        dashboardWidgetId,
        pivot,
        chart
    };

    if (analysisIndex >= 0) {
        this.sheetAnalyses[analysisIndex] = updatedAnalysis;
    } else {
        this.sheetAnalyses.push(updatedAnalysis);
    }

    const widgetIndex = existingWidgets.findIndex(
        (item: any) =>
            Number(item.id) === Number(dashboardWidgetId)
    );

    const previousWidget =
        widgetIndex >= 0
            ? existingWidgets[widgetIndex]
            : null;

    const widget = {
        ...(previousWidget ?? {}),

        id: dashboardWidgetId,
        name: chart.title || 'Pivot Analysis',
        widgetType: 'PivotChart',
        dataSourceType: 'Transactions',
        sourceSpreadsheetId: this.currentSavedSpreadsheetId,
        sourceSheetName: sheetName,
        pivot,
        chart,

        // Preserve original creation date/layout when editing.
        createdDate:
            previousWidget?.createdDate ?? now,
        updatedDate: now
    };

    try {
        JSON.stringify(widget);
    } catch (error) {
        console.error(
            'Dashboard widget serialization failed:',
            error
        );
        this.notify.error('Unable to save dashboard chart.');
        return;
    }

    if (widgetIndex >= 0) {
        // UPDATE existing dashboard card.
        existingWidgets[widgetIndex] = widget;
    } else {
        // CREATE only when this analysis has never been added.
        existingWidgets.push(widget);
    }

    localStorage.setItem(
        'dashboardPivotWidgets',
        JSON.stringify(existingWidgets)
    );

    // Persist dashboardWidgetId + latest Pivot/Chart config in the
    // saved Spreadsheet immediately. This is important so reopening
    // the Spreadsheet still knows which dashboard card to update.
    this.persistSheetAnalysesToSavedSpreadsheet();

    console.log(
        isUpdate || widgetIndex >= 0
            ? 'Dashboard widget updated:'
            : 'Dashboard widget created:',
        widget
    );

    this.notify.success(
        isUpdate || widgetIndex >= 0
            ? 'Dashboard chart updated successfully.'
            : 'Chart saved to dashboard successfully.'
    );
}

private persistSheetAnalysesToSavedSpreadsheet(): void {

    if (!this.currentSavedSpreadsheetId) {
        return;
    }

    const spreadsheets: SavedSpreadsheet[] = JSON.parse(
        localStorage.getItem('savedSpreadsheets') || '[]'
    );

    const index = spreadsheets.findIndex(
        item =>
            Number(item.id) ===
            Number(this.currentSavedSpreadsheetId)
    );

    if (index < 0) {
        return;
    }

    spreadsheets[index] = {
        ...spreadsheets[index],
        updatedDate: new Date().toISOString(),
        sheetAnalyses: JSON.parse(
            JSON.stringify(this.sheetAnalyses)
        )
    };

    localStorage.setItem(
        'savedSpreadsheets',
        JSON.stringify(spreadsheets)
    );

    this.savedSpreadsheets = spreadsheets;
}

private showTransactionsBySeller(): void {

    this.pivotDataSourceSettings = {

        ...this.getBasePivotSettings(),

        rows: [
            {
                name: 'Seller',
                caption: 'Seller'
            }
        ],

        columns: [
            {
                name: 'TransactionType',
                caption: 'Transaction Type'
            }
        ],

        values: [
            {
                name: 'TransactionCount',
                caption: 'Transaction Count',
                type: 'Sum'
            }
        ],

        filters: [],

        filterSettings: []
    };

    this.setPivotChartTitle(
        'Sales and Purchase Orders by Seller'
    );

    this.refreshPivot();
}
    private showTransactionsByBuyer(): void {
        this.pivotDataSourceSettings = {
            ...this.getBasePivotSettings(),
            rows: [{ name: 'Buyer', caption: 'Buyer' }],
            columns: [],
            values: [{
                name: 'TransactionNumber',
                caption: 'Transaction Count',
                type: 'Count'
            }],
            filters: [],
            filterSettings: []
        };

        this.setPivotChartTitle('Transactions by Buyer');
    }

    private showOrderTypeCount(
        kind: 'sales' | 'purchase'
    ): void {
        const orderType = this.getOrderTypeLabel(kind);

        if (!orderType) {
            this.notify.warn('No matching transaction type found.');
            return;
        }

        this.pivotDataSourceSettings = {
            ...this.getBasePivotSettings(),
            rows: [{
                name: 'TransactionType',
                caption: 'Transaction Type'
            }],
            columns: [],
            values: [{
                name: 'TransactionNumber',
                caption: kind === 'sales'
                    ? 'Sales Order Count'
                    : 'Purchase Order Count',
                type: 'Count'
            }],
            filters: [],
            filterSettings: [{
                name: 'TransactionType',
                type: 'Include',
                items: [orderType]
            }]
        };

        this.setPivotChartTitle(
            kind === 'sales'
                ? 'Sales Orders Count'
                : 'Purchase Orders Count'
        );
    }

    private showOrdersBySeller(
        kind: 'sales' | 'purchase'
    ): void {
        const orderType = this.getOrderTypeLabel(kind);

        if (!orderType) {
            this.notify.warn('No matching transaction type found.');
            return;
        }

        this.pivotDataSourceSettings = {
            ...this.getBasePivotSettings(),
            rows: [{ name: 'Seller', caption: 'Seller' }],
            columns: [],
            values: [{
                name: 'TransactionNumber',
                caption: kind === 'sales'
                    ? 'Sales Orders'
                    : 'Purchase Orders',
                type: 'Count'
            }],
            filters: [],
            filterSettings: [{
                name: 'TransactionType',
                type: 'Include',
                items: [orderType]
            }]
        };

        this.setPivotChartTitle(
            kind === 'sales'
                ? 'Sales Orders by Seller'
                : 'Purchase Orders by Seller'
        );
    }

    private showSalesOrdersPerWeekCurrentMonth(): void {
        const salesOrderType = this.getOrderTypeLabel('sales');

        if (!salesOrderType) {
            this.notify.warn('No Sales Order data found.');
            return;
        }

        const now = new Date();
        const currentMonth = String(now.getMonth() + 1);
        const currentYear = String(now.getFullYear());

        const hasCurrentMonthData = (this.pivotData as any[])
            .some(item =>
                item.TransactionType === salesOrderType &&
                item.CreatedMonth === currentMonth &&
                item.CreatedYear === currentYear
            );

        if (!hasCurrentMonthData) {
            this.notify.warn(
                'The selected spreadsheet has no Sales Orders for the current month.'
            );
        }

        this.pivotDataSourceSettings = {
            ...this.getBasePivotSettings(),
            rows: [{
                name: 'WeekOfMonth',
                caption: 'Week'
            }],
            columns: [],
            values: [{
                name: 'TransactionNumber',
                caption: 'Sales Orders',
                type: 'Count'
            }],
            filters: [],
            filterSettings: [
                {
                    name: 'TransactionType',
                    type: 'Include',
                    items: [salesOrderType]
                },
                {
                    name: 'CreatedMonth',
                    type: 'Include',
                    items: [currentMonth]
                },
                {
                    name: 'CreatedYear',
                    type: 'Include',
                    items: [currentYear]
                }
            ]
        };

        this.setPivotChartTitle(
            'Sales Orders per Week - Current Month'
        );
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

 private getBasePivotSettings(): any {

    return {

        dataSource:
            this.pivotData,

        enableSorting:
            true,

        allowLabelFilter:
            true,

        allowValueFilter:
            true,

        fieldMapping:
            this.createDynamicPivotFieldMapping(
                this.pivotData
            )
    };
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

    private setPivotChartTitle(title: string): void {
        this.pivotChartSettings = {
            ...this.pivotChartSettings,

        height: '280',

            title
        };

        if (this.pivotView) {
            this.pivotView.chartSettings = this.pivotChartSettings;
        }
    }

    private getOrderTypeLabel(
        kind: 'sales' | 'purchase'
    ): string | null {
        const values = Array.from(
            new Set(
                (this.pivotData as any[])
                    .map(item =>
                        String(item.TransactionType ?? '').trim()
                    )
                    .filter(Boolean)
            )
        );

        const localizedExpected = kind === 'sales'
            ? String(this.l('SalesOrder') ?? '').trim()
            : String(this.l('PurchaseOrder') ?? '').trim();

        const exactLocalized = values.find(
            value => value === localizedExpected
        );

        if (exactLocalized) {
            return exactLocalized;
        }

        const token = kind === 'sales'
            ? 'sales'
            : 'purchase';

        return values.find(value =>
            value.toLowerCase().includes(token)
        ) ?? null;
    }

    private parsePivotDate(value: any): Date | null {
        if (!value) {
            return null;
        }

        if (value instanceof Date) {
            return Number.isNaN(value.getTime())
                ? null
                : value;
        }

        const text = String(value).trim();

        const slashMatch = text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

        if (slashMatch) {
            const month = Number(slashMatch[1]);
            const day = Number(slashMatch[2]);
            const year = Number(slashMatch[3]);

            const date = new Date(
                year,
                month - 1,
                day
            );

            return Number.isNaN(date.getTime())
                ? null
                : date;
        }

        const date = new Date(text);

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    private getWeekOfMonth(date: Date): string {
        const week = Math.ceil(
            date.getDate() / 7
        );

        return `Week ${week}`;
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
        this.notify.warn(
            'Select at least one transaction.'
        );
        return;
    }

    const filters =
        this.getCurrentSpreadsheetFilters();

    const selectedIds =
        this.selectedTransactions
            .map(record => Number(record?.id))
            .filter(id => Number.isFinite(id) && id > 0);

    this.openRecordsInSpreadsheet(
        this.selectedTransactions,
        {
            type: 'Transactions',
            mode: 'SelectedRecords',
            selectedIds,
            filters
        }
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

    this.spreadsheet.freezePanes(1, 0);

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

    this.spreadsheet.activeSheetIndex = 0;

    this.spreadsheet.selectRange(
        'Transactions!A1'
    );

    /*
     * Resize once after creation, never once per row/batch.
     */
    setTimeout(() => {
        this.spreadsheet?.resize();
    });
}


    closeSpreadsheet(): void {
        this.showSpreadsheetDialog = false;
    }




    // =====================================================
    // EXPORT
    // =====================================================

exportSpreadsheet(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.spreadsheet) {
        this.notify.warn('Spreadsheet is not ready.');
        return;
    }

    this.spreadsheet.save({
        fileName: 'SelectedTransactions.xlsx',
        saveType: 'Xlsx'
    });
}



exportPdf(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.spreadsheet) {
        this.notify.warn('Spreadsheet is not ready.');
        return;
    }

    this.spreadsheet.save({
        fileName: 'Transactions.pdf',
        saveType: 'Pdf'
    });
}
    // =====================================================
    // EXCEL ADDRESS HELPERS
    // =====================================================

    private getColumnIndex(
        cellAddress: string
    ): number {
        const letters =
            cellAddress
                .match(/[A-Z]+/i)?.[0]
                ?.toUpperCase();

        if (!letters) {
            return 0;
        }

        return (
            letters
                .split('')
                .reduce(
                    (
                        result,
                        letter
                    ) =>
                        result * 26 +
                        letter.charCodeAt(0) -
                        64,
                    0
                ) - 1
        );
    }

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

async openAllInSpreadsheet(): Promise<void> {

    const filters =
        this.getCurrentSpreadsheetFilters();

    const source: SpreadsheetDataSource = {
        type: 'Transactions',
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
        this.openRecordsInSpreadsheet(
            [...currentRecords],
            source
        );

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

    this.spreadsheetLoadingProgress = 0;
    this.spreadsheetLoadingMessage =
        'Loading transactions...';

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

                this.openRecordsInSpreadsheet(
                    items,
                    source
                );

                displayedRecordCount =
                    items.length;

                spreadsheetOpened = true;

                this.spreadsheetLoadingMessage =
                    `Loading transactions... ` +
                    `${displayedRecordCount.toLocaleString()} displayed`;

                this.updateOpenAllProgress(
                    displayedRecordCount,
                    totalCount || Number(result?.totalCount ?? 0)
                );

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
                    'Transactions',
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

                this.spreadsheetLoadingMessage =
                    `Loading transactions... ` +
                    `${displayedRecordCount.toLocaleString()} displayed`;

                this.updateOpenAllProgress(
                    displayedRecordCount,
                    totalCount || Number(result?.totalCount ?? 0)
                );

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

            this.spreadsheetLoadingProgress = 100;

            this.spreadsheetLoadingMessage =
                `${displayedRecordCount.toLocaleString()} transactions loaded`;

            console.log(
                '[Spreadsheet Open All] finished',
                {
                    displayedRecordCount
                }
            );

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
        setTimeout(() => {
            this.spreadsheetLoadingProgress = 0;
            this.spreadsheetLoadingMessage = '';
        }, 300);
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

private buildTransactionSpreadsheetSheets(): SheetModel[] {
    return [
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

saveSpreadsheetLocal(): void {

    if (!this.spreadsheet) {
        this.notify.warn(
            'Spreadsheet is not ready.'
        );
        return;
    }

    if (!this.currentSpreadsheetSource) {
        this.notify.warn(
            'Spreadsheet source is not available.'
        );
        return;
    }

    // IMPORTANT: preserve the source used to CREATE the spreadsheet.
    // Do not recalculate Selected/All mode from the current page state here.
    const dataSource: SpreadsheetDataSource = {
        type: 'Transactions',
        mode: this.currentSpreadsheetSource.mode,
        selectedIds:
            this.currentSpreadsheetSource.mode ===
                'SelectedRecords'
                ? [
                    ...(this.currentSpreadsheetSource
                        .selectedIds ?? [])
                ]
                : undefined,
        filters: {
            ...(this.currentSpreadsheetSource.filters ?? {})
        }
    };

    (this.spreadsheet as any)
        .saveAsJson(
            this.spreadsheetJsonSerializationOptions
        )
        .then((workbook: any) => {

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

    dataSource,

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

    dataSource,

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

    // Restore the SAME source definition that was used
    // when this spreadsheet was originally created.
    this.currentSpreadsheetSource = saved.dataSource
        ? {
            ...saved.dataSource,
            selectedIds: saved.dataSource.selectedIds
                ? [...saved.dataSource.selectedIds]
                : undefined,
            filters: {
                ...(saved.dataSource.filters ?? {})
            }
        }
        : null;

    this.currentSpreadsheetFilters = {
        ...(saved.dataSource?.filters ?? {})
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

                this.spreadsheet?.resize();

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

private openSavedWorkbookJson(
    saved: SavedSpreadsheet
): void {

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
            (this.spreadsheet as any).openFromJson(
                {
                    file:
                        saved.workbookJson.jsonObject
                },
                this.spreadsheetJsonSerializationOptions
            );

            setTimeout(() => {
                this.spreadsheet?.resize();
                this.isOpeningSavedSpreadsheet = false;

                this.notify.success(
                    saved.name +
                    ' opened successfully.'
                );
            }, 500);

        } catch (error) {
            this.isOpeningSavedSpreadsheet = false;

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

private openRefreshedSavedSpreadsheet(
    saved: SavedSpreadsheet,
    records: any[]
): void {

    this.spreadsheetRows =
        records.map(record =>
            this.mapTransactionToSpreadsheetRow(
                record
            )
        );

    this.sheets =
        this.buildTransactionSpreadsheetSheets();

    this.showSpreadsheetDialog = true;

    saved.recordCount = records.length;
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


private sanitizeWorkbookJson(workbookJson: any): any {
    if (!workbookJson) {
        return workbookJson;
    }

    // Clone so we don't modify saved object directly
    const cleanJson = JSON.parse(JSON.stringify(workbookJson));

    const workbook =
        cleanJson?.jsonObject?.Workbook ??
        cleanJson?.Workbook;

    if (!workbook) {
        return cleanJson;
    }

    if (!Array.isArray(workbook.sheets)) {
        workbook.sheets = [];
        return cleanJson;
    }

    workbook.sheets = workbook.sheets.map((sheet: any) => {

        if (!sheet) {
            return {};
        }

        // Fix null columns
        if (Array.isArray(sheet.columns)) {
            sheet.columns = sheet.columns.map((column: any) => {
                return column ?? {};
            });
        }

        // Fix null rows and cells
        if (Array.isArray(sheet.rows)) {
            sheet.rows = sheet.rows.map((row: any) => {

                if (!row) {
                    return {};
                }

                if (Array.isArray(row.cells)) {
                    row.cells = row.cells.map((cell: any) => {
                        return cell ?? {};
                    });
                }

                return row;
            });
        }

        // Fix ranges
        if (Array.isArray(sheet.ranges)) {
            sheet.ranges = sheet.ranges.map((range: any) => {
                return range ?? {};
            });
        }

        return sheet;
    });

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

    const source =
        this.currentSpreadsheetSource ??
        savedSpreadsheet?.dataSource ??
        null;

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
                    this.getTransactionsForSpreadsheetRefresh(
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
                    'Transactions'
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

            /*
             * IMPORTANT FOR PROGRESSIVE DISPLAY:
             * give Syncfusion/browser one render turn after every 10 rows.
             * Batch 1 becomes visible before batch 2 request continues.
             */
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
// BULK UPDATE: TEMPORARILY USE MANUAL CALCULATION
// =====================================================

private beginSpreadsheetBulkUpdate(): void {

    const spreadsheet: any =
        this.spreadsheet as any;

    if (!spreadsheet) {
        return;
    }

    /*
     * Older Syncfusion builds may not expose calculationMode.
     * In that case we simply keep the existing behavior.
     */
    if (!('calculationMode' in spreadsheet)) {
        return;
    }

    this.previousSpreadsheetCalculationMode =
        spreadsheet.calculationMode ??
        'Automatic';

    spreadsheet.calculationMode =
        'Manual';
}

private endSpreadsheetBulkUpdate(): void {

    const spreadsheet: any =
        this.spreadsheet as any;

    if (!spreadsheet) {
        return;
    }

    if (!('calculationMode' in spreadsheet)) {
        return;
    }

    spreadsheet.calculationMode =
        this.previousSpreadsheetCalculationMode ??
        'Automatic';

    this.previousSpreadsheetCalculationMode =
        null;

    /*
     * One bind after the entire bulk update instead of rebinding for every
     * row/range.
     */
    if (typeof spreadsheet.dataBind === 'function') {
        spreadsheet.dataBind();
    }
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
// UPDATE ALL SPREADSHEET SHEETS USED BY ANALYSIS
// =====================================================

private updateSpreadsheetAnalysisSheets(
    rows: TransactionSpreadsheetRow[]
): void {

    if (!this.spreadsheet) {
        return;
    }

    /*
     * IMPORTANT:
     * Refresh only the raw source sheet here.
     *
     * The old implementation also cleared every sheet referenced by
     * sheetAnalyses. Those sheets may contain user formulas, custom columns,
     * manual edits, styles, or Pivot preparation data, so treating them as
     * raw transaction sheets can remove or replace valid older/user data.
     *
     * Pivot refresh is handled separately after the source sheet has been
     * updated.
     */
    this.updateOneSpreadsheetSheet(
        'Transactions',
        rows
    );
}

// =====================================================
// UPDATE ONE SHEET WITHOUT DESTROYING HEADERS/FORMATTING
// =====================================================

private updateOneSpreadsheetSheet(
    sheetName: string,
    rows: TransactionSpreadsheetRow[]
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

    /*
     * Read the sheet's CURRENT headers.
     *
     * Example:
     * Transactions       -> 12 headers
     * Transactions (2)   -> maybe only 6 headers
     *
     * We preserve that structure.
     */
    const headers =
        this.getSheetHeaders(sheet);

    if (!headers.length) {

        console.warn(
            'Refresh skipped - no headers:',
            sheetName
        );

        return;
    }

    const oldLastRowIndex =
        sheet?.usedRange?.rowIndex ?? 0;

    const lastHeaderColumnIndex =
        headers.length - 1;

    const lastColumnName =
        this.getColumnName(
            lastHeaderColumnIndex
        );

    /*
     * Clear OLD data only.
     * Row 1 = headers, so start from row 2.
     */
    if (oldLastRowIndex >= 1) {

        this.spreadsheet.clear({
            range:
                `${sheetName}!A2:` +
                `${lastColumnName}` +
                `${oldLastRowIndex + 1}`,
            type: 'Clear Contents'
        } as any);
    }

    if (!rows.length) {
        return;
    }

    /*
     * Project latest transaction objects to the
     * exact headers of this sheet.
     *
     * This protects duplicated sheets that contain
     * only a subset of the original 12 columns.
     */
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

 this.spreadsheet.updateRange(
    {
        dataSource: projectedRows,
        startCell: 'A2',
        showFieldAsHeader: false
    } as any,
    sheetIndex
);

    console.log(
        `Spreadsheet sheet refreshed: ${sheetName}`,
        projectedRows.length
    );
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

            existing[index] = {
                ...existing[index],

                updatedDate:
                    new Date().toISOString(),

                recordCount,

                workbookJson:
                    workbook,

                dataSource:
                    this.currentSpreadsheetSource
                        ? {
                            ...this.currentSpreadsheetSource,

                            selectedIds:
                                this.currentSpreadsheetSource
                                    .selectedIds
                                    ? [
                                        ...this.currentSpreadsheetSource
                                            .selectedIds
                                    ]
                                    : undefined,

                            filters: {
                                ...(
                                    this.currentSpreadsheetSource
                                        .filters ?? {}
                                )
                            }
                        }
                        : existing[index].dataSource,

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
    type: 'Transactions';
    mode: 'SelectedRecords' | 'AllRecords';
    selectedIds?: number[];
    filters?: SpreadsheetFilters;
}

interface SavedSpreadsheet {
    id: number;
    name: string;
    createdDate: string;
    updatedDate?: string;
    recordCount: number;
    workbookJson: any;
    dataSource?: SpreadsheetDataSource;

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
