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

import { finalize } from 'rxjs';

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

async openPivotAnalysis(): Promise<void> {

    if (!this.spreadsheet) {

        this.notify.warn(
            'Spreadsheet is not ready.'
        );

        return;
    }

    try {

        // ==========================================
        // 1. GET CURRENT SPREADSHEET SHEET
        // ==========================================

        const sheet =
            this.spreadsheet.getActiveSheet();

        if (!sheet) {

            this.notify.warn(
                'No active spreadsheet found.'
            );

            return;
        }


        // ==========================================
        // 2. GET USED RANGE
        // ==========================================

        const lastRowIndex =
            sheet.usedRange?.rowIndex ?? 0;

        const lastColIndex =
            sheet.usedRange?.colIndex ?? 0;


        if (
            lastRowIndex < 1 ||
            lastColIndex < 0
        ) {

            this.notify.warn(
                'Spreadsheet has no data.'
            );

            return;
        }


        // Syncfusion indexes start from 0
        // Excel row/column addresses start from 1

        const lastRow =
            lastRowIndex + 1;

        const lastColumn =
            this.getColumnName(
                lastColIndex
            );


        // Example:
        // Transactions!A1:L11

        const range =
            `${sheet.name}!A1:${lastColumn}${lastRow}`;


        console.log(
            'Pivot source range:',
            range
        );


        // ==========================================
        // 3. READ CURRENT SPREADSHEET DATA
        // ==========================================

        const spreadsheetData =
            await this.spreadsheet.getData(
                range
            );


        console.log(
            'Raw Spreadsheet Data:',
            spreadsheetData
        );


        // ==========================================
        // 4. CONVERT SPREADSHEET DATA TO PIVOT DATA
        // ==========================================

        this.pivotData =
            this.convertSpreadsheetToPivotData(
                spreadsheetData,
                lastRowIndex,
                lastColIndex
            ) as IDataSet[];


        console.log(
            'Dynamic Pivot Data:',
            this.pivotData
        );


        if (!this.pivotData.length) {

            this.notify.warn(
                'No spreadsheet records found.'
            );

            return;
        }


        // ==========================================
        // 5. CREATE DYNAMIC FIELD MAPPING
        // ==========================================

        const fieldMapping =
            this.createDynamicPivotFieldMapping(
                this.pivotData
            );


        console.log(
            'Dynamic Pivot Fields:',
            fieldMapping
        );


        // ==========================================
        // 6. EMPTY PIVOT
        // USER WILL BUILD IT MANUALLY
        // ==========================================

        this.pivotDataSourceSettings = {

            dataSource:
                this.pivotData,

            rows: [],

            columns: [],

            values: [],

            filters: [],

            enableSorting:
                true,

            allowLabelFilter:
                true,

            allowValueFilter:
                true,

            fieldMapping:
                fieldMapping
        };


        // ==========================================
        // 7. OPEN PIVOT
        // ==========================================

        this.showPivotDialog =
            false;


        setTimeout(() => {

            this.showPivotDialog =
                true;

        });

    } catch (error) {

        console.error(
            'Unable to build Pivot from Spreadsheet:',
            error
        );

        this.notify.error(
            'Failed to read spreadsheet data.'
        );
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

        this.notify.warn(
            'Pivot analysis is not ready.'
        );

        return;
    }

    const settings =
        this.pivotView
            .dataSourceSettings;

    // ==========================================
    // BUILD PLAIN JSON-SAFE OBJECT
    // ==========================================

    const widget = {

        id:
            Date.now(),

        name:
            this.pivotChartSettings?.title ||
            'Pivot Analysis',

        widgetType:
            'PivotChart',

        dataSourceType:
            'Transactions',

        sourceSpreadsheetId:
            this.currentSavedSpreadsheetId,

        // ======================================
        // PIVOT CONFIGURATION
        // ======================================

        pivot: {

            rows:
                this.serializePivotFields(
                    settings?.rows
                ),

            columns:
                this.serializePivotFields(
                    settings?.columns
                ),

            values:
                this.serializePivotFields(
                    settings?.values
                ),

            filters:
                this.serializePivotFields(
                    settings?.filters
                ),

            filterSettings:
                this.serializePivotFilters(
                    settings?.filterSettings
                ),

            sortSettings:
                this.serializePivotSortSettings(
                    settings?.sortSettings
                )
        },

        // ======================================
        // CHART CONFIGURATION
        // ======================================

        chart: {

            type:
                this.selectedPivotChartType,

            title:
                this.pivotChartSettings?.title ||
                'Pivot Chart',

            enableMultipleAxis:
                this.pivotChartSettings
                    ?.enableMultipleAxis ?? false
        },

        createdDate:
            new Date().toISOString()
    };


    // ==========================================
    // VERIFY THAT IT REALLY IS SERIALIZABLE
    // ==========================================

    try {

        const json =
            JSON.stringify(
                widget,
                null,
                2
            );

        console.log(
            'Dashboard Widget Object:',
            widget
        );

        console.log(
            'Dashboard Widget JSON:',
            json
        );

    } catch (error) {

        console.error(
            'Dashboard widget serialization failed:',
            error
        );

        this.notify.error(
            'Unable to save dashboard chart.'
        );

        return;
    }


    // ==========================================
    // POC - SAVE TO LOCAL STORAGE
    // ==========================================

    const existing: any[] =
        JSON.parse(
            localStorage.getItem(
                'dashboardPivotWidgets'
            ) || '[]'
        );

    existing.push(
        widget
    );

    localStorage.setItem(
        'dashboardPivotWidgets',
        JSON.stringify(existing)
    );


    // ==========================================
    // VERIFY SAVED VALUE
    // ==========================================

    const saved =
        JSON.parse(
            localStorage.getItem(
                'dashboardPivotWidgets'
            ) || '[]'
        );

    console.log(
        'All Saved Dashboard Widgets:',
        saved
    );

    console.log(
        'Last Saved Dashboard Widget:',
        saved[saved.length - 1]
    );


    this.notify.success(
        'Chart saved to dashboard successfully.'
    );
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

    // IMPORTANT:
    // Saved workbook is about to be loaded.
    // Do not initialize a new workbook.
    if (this.isOpeningSavedSpreadsheet) {
        return;
    }

    // Also don't initialize if this is not a new
    // transaction spreadsheet.
    if (!this.spreadsheetRows?.length) {
        return;
    }

    const lastRow =
        this.spreadsheetRows.length + 1;

    this.spreadsheet.cellFormat(
        {
            fontWeight: 'bold',
            textAlign: 'center',
            verticalAlign: 'middle'
        },
        'Transactions!A1:L1'
    );

    this.spreadsheet.numberFormat(
        '0.00',
        `Transactions!K2:L${lastRow}`
    );

    // this.prepareChartDataSheet();

    this.spreadsheet.activeSheetIndex = 0;

    this.spreadsheet.selectRange(
        'Transactions!A1'
    );

    setTimeout(() => {
        this.spreadsheet?.resize();
    });
}

// private prepareChartDataSheet(): void {
//     if (!this.spreadsheet) {
//         return;
//     }

//     // Headers
//     this.spreadsheet.updateCell(
//         {
//             value: 'Transaction',
//             style: {
//                 fontWeight: 'bold',
//                 textAlign: 'center'
//             }
//         },
//         'Sheet1!A1'
//     );

//     this.spreadsheet.updateCell(
//         {
//             value: 'Quantity',
//             style: {
//                 fontWeight: 'bold',
//                 textAlign: 'center'
//             }
//         },
//         'Sheet1!B1'
//     );

//     this.spreadsheet.updateCell(
//         {
//             value: 'Amount',
//             style: {
//                 fontWeight: 'bold',
//                 textAlign: 'center'
//             }
//         },
//         'Sheet1!C1'
//     );

//     this.spreadsheetRows.forEach((row, index) => {
//         const excelRow = index + 2;

//         // Make sure TransactionNumber exists and is text.
//         const transactionNumber =
//             row.TransactionNumber != null &&
//             row.TransactionNumber !== ''
//                 ? String(row.TransactionNumber)
//                 : `Transaction ${index + 1}`;

//         this.spreadsheet?.updateCell(
//             {
//                 value: transactionNumber
//             },
//             `Sheet1!A${excelRow}`
//         );

//         this.spreadsheet?.updateCell(
//             {
//                 value: String(
//                     Number(row.Quantity ?? 0)
//                 )
//             },
//             `Sheet1!B${excelRow}`
//         );

//         this.spreadsheet?.updateCell(
//             {
//                 value: String(
//                     Number(row.Amount ?? 0)
//                 )
//             },
//             `Sheet1!C${excelRow}`
//         );
//     });

//     const lastRow =
//         this.spreadsheetRows.length + 1;

//     this.spreadsheet.numberFormat(
//         '0.00',
//         `Sheet1!B2:C${lastRow}`
//     );
// }


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

    openAllInSpreadsheet(): void {

        const totalCount =
            this.primengTableHelper.totalRecordsCount;

        if (!totalCount) {
            this.notify.warn('No transactions found.');
            return;
        }

        const filters =
            this.filterForm?.value ?? {};

        const savedFilters =
            this.getCurrentSpreadsheetFilters();

        const source: SpreadsheetDataSource = {
            type: 'Transactions',
            mode: 'AllRecords',
            filters: savedFilters
        };

        this.showMainSpinner();

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
                0,
                totalCount
            )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe(result => {
                this.openRecordsInSpreadsheet(
                    result.items || [],
                    source
                );
            });
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

    // New spreadsheet
    this.currentSavedSpreadsheetId = null;
    this.isOpeningSavedSpreadsheet = false;

    // Keep the source definition used to create this spreadsheet.
    this.currentSpreadsheetSource = {
        ...source,
        selectedIds: source.selectedIds
            ? [...source.selectedIds]
            : undefined,
        filters: {
            ...(source.filters ?? {})
        }
    };

    // Filters are independent from Selected/All mode and are shown in the UI.
    this.currentSpreadsheetFilters = {
        ...(source.filters ?? {})
    };

    this.spreadsheetRows =
        records.map(record =>
            this.mapTransactionToSpreadsheetRow(
                record
            )
        );

    this.sheets = this.buildTransactionSpreadsheetSheets();

    this.showSpreadsheetDialog = true;
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
        {
            name: 'Sheet1',
            columns: [
                { width: 150 },
                { width: 130 },
                { width: 130 }
            ]
        }
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

    this.spreadsheet
        .saveAsJson()
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
                        workbookJson: workbook,
                        dataSource
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
                id: Date.now(),
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
                workbookJson: workbook,
                dataSource
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
openSavedSpreadsheet(
    saved: SavedSpreadsheet
): void {

    if (!saved?.workbookJson?.jsonObject) {
        console.error(
            'Invalid saved workbook:',
            saved
        );

        this.notify.warn(
            'Saved spreadsheet is invalid.'
        );
        return;
    }

    this.currentSavedSpreadsheetId = saved.id;

    this.currentSpreadsheetSource =
        saved.dataSource
            ? {
                ...saved.dataSource,
                selectedIds:
                    saved.dataSource.selectedIds
                        ? [
                            ...saved.dataSource
                                .selectedIds
                        ]
                        : undefined,
                filters: {
                    ...(saved.dataSource.filters ?? {})
                }
            }
            : null;

    this.currentSpreadsheetFilters =
        saved?.dataSource?.filters
            ? {
                ...saved.dataSource.filters
            }
            : null;

    console.log(
        'Reopened Spreadsheet Source:',
        this.currentSpreadsheetSource
    );

    if (
        saved?.dataSource?.type ===
        'Transactions'
    ) {
        this.refreshSavedSpreadsheet(saved);
        return;
    }

    // Backward compatibility for spreadsheets saved before dataSource existed.
    this.openSavedWorkbookJson(saved);
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
            this.spreadsheet.openFromJson({
                file:
                    saved.workbookJson.jsonObject
            });

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


private getCurrentSpreadsheetFilters(): any {

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

        statusFilter:
            filters.statusFilter == null
                ? undefined
                : filters.statusFilter,

        referenceNumberFilter:
            filters.referenceNumberFilter || undefined,

        sorting:
            this.primengTableHelper.getSorting(
                this.dataTable
            )
    };
}

private refreshSavedSpreadsheet(
    saved: SavedSpreadsheet
): void {

    const source = saved.dataSource;

    if (!source) {
        this.openSavedWorkbookJson(saved);
        return;
    }

    const filters = source.filters ?? {};

    this.showMainSpinner();

    this._appTransactionServiceProxy
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
            filters.statusFilter,
            false,
            undefined,
            undefined,
            filters.referenceNumberFilter,
            filters.sorting,
            0,
            1000
        )
        .pipe(
            finalize(() =>
                this.hideMainSpinner()
            )
        )
        .subscribe(result => {

            let records = result.items || [];

            if (
                source.mode ===
                'SelectedRecords'
            ) {
                const selectedIds = new Set(
                    (source.selectedIds ?? [])
                        .map(id => Number(id))
                );

                records = records.filter(record =>
                    selectedIds.has(
                        Number(record?.id)
                    )
                );

                // For selected mode, never fall back to all records.
                if (!records.length) {
                    this.notify.warn(
                        'The selected transactions could not be refreshed.'
                    );

                    // Keep the previously saved workbook instead of showing all.
                    this.openSavedWorkbookJson(saved);
                    return;
                }
            }

            this.openRefreshedSavedSpreadsheet(
                saved,
                records
            );
        });
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
}

interface DashboardPivotWidget {

    id?: number;

    name: string;

    widgetType: 'PivotChart';

    chartType: string;

    dataSourceType: string;

    rows: any[];

    columns: any[];

    values: any[];

    filters: any[];

    filterSettings: any[];

    sortSettings?: any[];

    groupSettings?: any[];

    chartSettings?: any;

    sourceSpreadsheetId?: number;

    dashboardId?: number;
}