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
    animations: [appModuleAnimation()]
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

                /*
                 * Selection is intentionally cleared
                 * when the page changes because the API
                 * returns server-paged data.
                 *
                 * Remove this line if you implement
                 * cross-page selection by ID.
                 */
                this.selectedTransactions = [];
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

    this.spreadsheetRows =
        this.selectedTransactions.map(record =>
            this.mapTransactionToSpreadsheetRow(record)
        );

    this.sheets = [
        {
            name: 'Transactions',
            ranges: [
                {
                    dataSource: this.spreadsheetRows,
                    startCell: 'A1',
                    showFieldAsHeader: true
                }
            ],
            columns: [
                { width: 145 }, // TransactionNumber
                { width: 145 }, // TransactionType
                { width: 180 }, // Seller
                { width: 180 }, // Buyer
                { width: 110 }, // Status
                { width: 130 }, // CreatedDate
                { width: 130 }, // CompleteDate
                { width: 130 }, // Reference
                { width: 180 }, // Creator
                { width: 100 }, // Currency
                { width: 110 }, // Quantity
                { width: 130 }  // Amount
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

    this.showSpreadsheetDialog = true;
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

    const lastRow =
        this.spreadsheetRows.length + 1;

    // Format Transactions headers.
    this.spreadsheet.cellFormat(
        {
            fontWeight: 'bold',
            textAlign: 'center',
            verticalAlign: 'middle'
        },
        'Transactions!A1:L1'
    );

    // Format Quantity and Amount.
    this.spreadsheet.numberFormat(
        '0.00',
        `Transactions!K2:L${lastRow}`
    );

    // Add helper data to Sheet1.
    this.prepareChartDataSheet();

    // Return user to Transactions sheet.
    this.spreadsheet.activeSheetIndex = 0;

    this.spreadsheet.selectRange(
        'Transactions!A1'
    );

    setTimeout(() => {
        this.spreadsheet?.resize();
    });
}

private prepareChartDataSheet(): void {
    if (!this.spreadsheet) {
        return;
    }

    // Headers
    this.spreadsheet.updateCell(
        {
            value: 'Transaction',
            style: {
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },
        'Sheet1!A1'
    );

    this.spreadsheet.updateCell(
        {
            value: 'Quantity',
            style: {
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },
        'Sheet1!B1'
    );

    this.spreadsheet.updateCell(
        {
            value: 'Amount',
            style: {
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },
        'Sheet1!C1'
    );

    this.spreadsheetRows.forEach((row, index) => {
        const excelRow = index + 2;

        // Make sure TransactionNumber exists and is text.
        const transactionNumber =
            row.TransactionNumber != null &&
            row.TransactionNumber !== ''
                ? String(row.TransactionNumber)
                : `Transaction ${index + 1}`;

        this.spreadsheet?.updateCell(
            {
                value: transactionNumber
            },
            `Sheet1!A${excelRow}`
        );

        this.spreadsheet?.updateCell(
            {
                value: String(
                    Number(row.Quantity ?? 0)
                )
            },
            `Sheet1!B${excelRow}`
        );

        this.spreadsheet?.updateCell(
            {
                value: String(
                    Number(row.Amount ?? 0)
                )
            },
            `Sheet1!C${excelRow}`
        );
    });

    const lastRow =
        this.spreadsheetRows.length + 1;

    this.spreadsheet.numberFormat(
        '0.00',
        `Sheet1!B2:C${lastRow}`
    );
}


    closeSpreadsheet(): void {
        this.showSpreadsheetDialog = false;
    }

    // =====================================================
    // ADD COLUMN
    // =====================================================

    addColumn(): void {
        if (!this.spreadsheet) {
            return;
        }

        const activeSheet =
            this.spreadsheet.getActiveSheet();

        const newColumnIndex =
            activeSheet.usedRange?.colIndex !=
            null
                ? activeSheet.usedRange.colIndex +
                  1
                : 0;

        this.spreadsheet.insertColumn(
            newColumnIndex,
            newColumnIndex
        );

        const columnName =
            this.getColumnName(
                newColumnIndex
            );

        this.spreadsheet.updateCell(
            {
                value: 'New Column',
                style: {
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            `${columnName}1`
        );

        this.spreadsheet.selectRange(
            `${columnName}1`
        );
    }

    // =====================================================
    // DELETE SELECTED COLUMN
    // =====================================================

    deleteSelectedColumn(): void {
        if (!this.spreadsheet) {
            return;
        }

        const selectedRange =
            this.spreadsheet
                .getActiveSheet()
                .selectedRange;

        if (!selectedRange) {
            this.notify.warn(
                'Select a cell in the column you want to delete.'
            );

            return;
        }

        const firstCell =
            selectedRange.split(':')[0];

        const columnIndex =
            this.getColumnIndex(
                firstCell
            );

        this.spreadsheet.delete(
            columnIndex,
            columnIndex,
            'Column'
        );
    }

    // =====================================================
    // CHARTS
    // =====================================================

createQuantityChart(): void {
    if (
        !this.spreadsheet ||
        !this.spreadsheetRows.length
    ) {
        return;
    }

    const lastRow =
        this.spreadsheetRows.length + 1;

    this.spreadsheet.activeSheetIndex = 1;

    this.spreadsheet.insertChart([
        {
            type: 'Column',
            range:
                `Sheet1!A1:B${lastRow}`,
            title:
                'Quantity by Transaction',
            height: 320,
            width: 600,
            top: 40,
            left: 450,
            isSeriesInRows: false
        }
    ]);
}
createAmountChart(): void {
    if (
        !this.spreadsheet ||
        this.spreadsheetRows.length === 0
    ) {
        return;
    }

    this.prepareAmountChartData();

    const lastRow =
        this.spreadsheetRows.length + 1;

    this.spreadsheet.activeSheetIndex = 1;

    this.spreadsheet.selectRange(
        `Sheet1!E1:F${lastRow}`
    );

    this.spreadsheet.insertChart([
        {
            type: 'Bar',
            range: `Sheet1!E1:F${lastRow}`,
            title: 'Amount by Transaction',
            height: 380,
            width: 680,
            top: 440,
            left: 500,
            isSeriesInRows: false
        }
    ]);
}

private prepareAmountChartData(): void {
    if (!this.spreadsheet) {
        return;
    }

    this.spreadsheet.updateCell(
        {
            value: 'Transaction',
            style: {
                fontWeight: 'bold'
            }
        },
        'Sheet1!E1'
    );

    this.spreadsheet.updateCell(
        {
            value: 'Amount',
            style: {
                fontWeight: 'bold'
            }
        },
        'Sheet1!F1'
    );

    this.spreadsheetRows.forEach((row, index) => {
        const excelRow = index + 2;

        this.spreadsheet?.updateCell(
            {
                value: String(
                    row.TransactionNumber ??
                    `Transaction ${index + 1}`
                )
            },
            `Sheet1!E${excelRow}`
        );

        this.spreadsheet?.updateCell(
            {
                value: String(
                    Number(row.Amount ?? 0)
                )
            },
            `Sheet1!F${excelRow}`
        );
    });

    const lastRow =
        this.spreadsheetRows.length + 1;

    this.spreadsheet.numberFormat(
        '0.00',
        `Sheet1!F2:F${lastRow}`
    );
}


createAmountLineChart(): void {
    if (
        !this.spreadsheet ||
        !this.spreadsheetRows.length
    ) {
        return;
    }

    const lastRow =
        this.spreadsheetRows.length + 1;

    this.prepareAmountChartData();

    this.spreadsheet.activeSheetIndex = 1;

    this.spreadsheet.insertChart([
        {
            type: 'Line',
            range:
                `Sheet1!E1:F${lastRow}`,
            title:
                'Transaction Amount Trend',
            height: 330,
            width: 650,
            top: 760,
            left: 450,
            isSeriesInRows: false
        }
    ]);
}

// createStatusPieChart(): void {
//     if (
//         !this.spreadsheet ||
//         !this.spreadsheetRows.length
//     ) {
//         return;
//     }

//     const statusCounts =
//         this.getStatusCounts();

//     this.writeStatusSummary(statusCounts);

//     const lastRow =
//         statusCounts.length + 1;

//     this.spreadsheet.activeSheetIndex = 1;

//     this.spreadsheet.insertChart([
//         {
//             type: 'Pie',
//             range:
//                 `Sheet1!H1:I${lastRow}`,
//             title:
//                 'Transactions by Status',
//             height: 350,
//             width: 550,
//             top: 40,
//             left: 1120,
//             isSeriesInRows: false
//         }
//     ]);
// }
    // =====================================================
    // FORMULA COLUMN
    // =====================================================

    addTotalFormulaColumn(): void {
        if (
            !this.spreadsheet ||
            this.spreadsheetRows.length === 0
        ) {
            return;
        }

        const activeSheet =
            this.spreadsheet.getActiveSheet();

        const newColumnIndex =
            activeSheet.usedRange.colIndex + 1;

        this.spreadsheet.insertColumn(
            newColumnIndex,
            newColumnIndex
        );

        const newColumnName =
            this.getColumnName(
                newColumnIndex
            );

        this.spreadsheet.updateCell(
            {
                value: 'Amount + Quantity',
                style: {
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            `${newColumnName}1`
        );

        /*
         * K = Quantity
         * L = Amount
         */
        for (
            let rowIndex = 2;
            rowIndex <=
            this.spreadsheetRows.length + 1;
            rowIndex++
        ) {
            this.spreadsheet.updateCell(
                {
                    formula:
                        `=K${rowIndex}+L${rowIndex}`
                },
                `${newColumnName}${rowIndex}`
            );
        }

        this.spreadsheet.numberFormat(
            '0.00',
            `${newColumnName}2:` +
                `${newColumnName}${
                    this.spreadsheetRows
                        .length + 1
                }`
        );
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
}