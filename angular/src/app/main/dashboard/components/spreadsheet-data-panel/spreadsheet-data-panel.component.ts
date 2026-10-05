import {
    Component,
    EventEmitter,
    Injector,
    Input,
    Output
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    AppTransactionServiceProxy
} from '@shared/service-proxies/service-proxies';

import {
    SpreadsheetDataBatch,
    SpreadsheetEntityDefinition,
    SpreadsheetFilters
} from '../../models/dashboard.model';




@Component({
    selector: 'app-spreadsheet-data-panel',
    templateUrl: './spreadsheet-data-panel.component.html',
    styleUrls: ['./spreadsheet-data-panel.component.scss']
})
export class SpreadsheetDataPanelComponent
    extends AppComponentBase {

    @Input()  visible = false;

    @Output() close = new EventEmitter<void>();
    @Output() batchLoaded =  new EventEmitter<SpreadsheetDataBatch>();
    @Output()  loadingFailed =  new EventEmitter<any>();


    readonly batchSize = 10;
    step: 1 | 2 = 1;
    selectedEntity:   SpreadsheetEntityDefinition | null = null;
    selectedColumns: string[] = [];
    filterValues: Record<string, any> = {};
    isAdding = false;


    // =====================================================
    // ENTITIES
    // =====================================================

    readonly entities: SpreadsheetEntityDefinition[] = [

        {
            sourceKey: 'TRANSACTIONS',

            displayName: 'Transactions',

            icon: 'fa fa-exchange-alt',

            columns: [

                {
                    key: 'TransactionNumber',
                    label: 'Transaction Number',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'TransactionType',
                    label: 'Transaction Type',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'Seller',
                    label: 'Seller',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'Buyer',
                    label: 'Buyer',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'Status',
                    label: 'Status',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'CreatedDate',
                    label: 'Created Date',
                    type: 'date',
                    defaultSelected: true
                },

                {
                    key: 'CompleteDate',
                    label: 'Complete Date',
                    type: 'date'
                },

                {
                    key: 'Reference',
                    label: 'Reference',
                    type: 'string'
                },

                {
                    key: 'Creator',
                    label: 'Creator',
                    type: 'string'
                },

                {
                    key: 'Currency',
                    label: 'Currency',
                    type: 'string'
                },

                {
                    key: 'Quantity',
                    label: 'Quantity',
                    type: 'number',
                    defaultSelected: true
                },

                {
                    key: 'Amount',
                    label: 'Amount',
                    type: 'number',
                    defaultSelected: true
                }
            ],

            filters: [

                {
                    key: 'search',
                    label: 'Search',
                    type: 'string'
                },

                {
                    key: 'codeFilter',
                    label: 'Transaction Number',
                    type: 'string'
                },

                {
                    key: 'sellerNameFilter',
                    label: 'Seller',
                    type: 'string'
                },

                {
                    key: 'buyerNameFilter',
                    label: 'Buyer',
                    type: 'string'
                },

                {
                    key: 'statusFilter',
                    label: 'Status',
                    type: 'statusLookup'
                },

                {
                    key: 'minCreateDateFilter',
                    label: 'Created From',
                    type: 'date'
                },

                {
                    key: 'maxCreateDateFilter',
                    label: 'Created To',
                    type: 'date'
                },

                {
                    key: 'referenceNumberFilter',
                    label: 'Reference',
                    type: 'string'
                }
            ]
        },

        {
            sourceKey: 'ITEMS',

            displayName: 'Items',

            icon: 'fa fa-box',

            columns: [

                {
                    key: 'Code',
                    label: 'Code',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'Name',
                    label: 'Name',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'Brand',
                    label: 'Brand',
                    type: 'string',
                    defaultSelected: true
                },

                {
                    key: 'AvailableQuantity',
                    label: 'Available Quantity',
                    type: 'number',
                    defaultSelected: true
                },

                {
                    key: 'Price',
                    label: 'Price',
                    type: 'number',
                    defaultSelected: true
                }
            ],

            filters: [

                {
                    key: 'search',
                    label: 'Search',
                    type: 'string'
                },

                {
                    key: 'brandId',
                    label: 'Brand',
                    type: 'number'
                },

                {
                    key: 'onlyAvailableStock',
                    label: 'Available Stock Only',
                    type: 'boolean'
                }
            ]
        }
    ];


    constructor(
        injector: Injector,

        private transactionService:
            AppTransactionServiceProxy
    ) {
        super(injector);
    }


    // =====================================================
    // ENTITY
    // =====================================================

    selectEntity(
        entity: SpreadsheetEntityDefinition
    ): void {

        this.selectedEntity = entity;

        this.selectedColumns =
            entity.columns
                ?.filter(
                    column =>
                        column.defaultSelected
                )
                .map(
                    column =>
                        column.key
                ) ?? [];

        this.filterValues = {};

        this.step = 2;
    }


    backToEntities(): void {

        this.step = 1;

        this.selectedEntity = null;

        this.selectedColumns = [];

        this.filterValues = {};
    }


    // =====================================================
    // COLUMNS
    // =====================================================

    isColumnSelected(
        key: string
    ): boolean {

        return this.selectedColumns.includes(
            key
        );
    }


    toggleColumn(
        key: string,
        event: Event
    ): void {

        const input =
            event.target as HTMLInputElement;


        if (input.checked) {

            if (
                !this.selectedColumns.includes(
                    key
                )
            ) {

                this.selectedColumns = [
                    ...this.selectedColumns,
                    key
                ];
            }

            return;
        }


        this.selectedColumns =
            this.selectedColumns.filter(
                column =>
                    column !== key
            );
    }


    selectAllColumns(): void {

        this.selectedColumns =
            this.selectedEntity
                ?.columns
                ?.map(
                    column =>
                        column.key
                ) ?? [];
    }


    clearColumns(): void {

        this.selectedColumns = [];
    }


    // =====================================================
    // ADD SHEET DATA
    // =====================================================

    async addSheet(): Promise<void> {

        if (
            !this.selectedEntity ||
            !this.selectedColumns.length ||
            this.isAdding
        ) {
            return;
        }


        const entity =
            this.selectedEntity;


        const filters =
            this.buildFilters();


        this.isAdding = true;


        let skip = 0;

        let loaded = 0;

        let total = 0;

        let firstBatch = true;


        try {

            while (true) {

                // -----------------------------------------
                // Load only 10 records
                // -----------------------------------------

                const result: any =
                    await firstValueFrom(
                        this.getDataPage(
                            entity,
                            filters,
                            skip,
                            this.batchSize
                        )
                    );


                const records: any[] =
                    result?.items ?? [];


                total =
                    Number(
                        result?.totalCount ?? 0
                    );


                if (!records.length) {
                    break;
                }


                // -----------------------------------------
                // Convert API records to Spreadsheet rows
                // -----------------------------------------

                const rows =
                    this.buildRows(
                        entity,
                        records
                    );


                loaded +=
                    records.length;


                const isLastBatch =
                    records.length <
                        this.batchSize ||
                    (
                        total > 0 &&
                        loaded >= total
                    );


                // -----------------------------------------
                // Send these 10 records to parent
                // -----------------------------------------

                this.batchLoaded.emit({

                    entity,

                    selectedColumns: [
                        ...this.selectedColumns
                    ],

                    filters: {
                        ...filters
                    },

                    rows,

                    loaded,

                    total,

                    isFirstBatch:
                        firstBatch,

                    isLastBatch
                });


                /*
                 * Give parent + Syncfusion time to display
                 * current batch before loading next 10.
                 */
                await this.waitForPaint();


                firstBatch = false;

                skip += this.batchSize;


                if (isLastBatch) {
                    break;
                }
            }


            if (loaded === 0) {

                this.notify.info(
                    'No records found for the selected filters.'
                );

                return;
            }


        } catch (error) {

            console.error(
                '[Spreadsheet Data Panel] load failed:',
                error
            );


            this.loadingFailed.emit(
                error
            );


        } finally {

            this.isAdding = false;
        }
    }


    // =====================================================
    // API
    // =====================================================

    private getDataPage(
        entity: SpreadsheetEntityDefinition,
        filters: SpreadsheetFilters,
        skip: number,
        take: number
    ): any {

        switch (entity.sourceKey) {

            case 'TRANSACTIONS':

                return this.getTransactions(
                    filters,
                    skip,
                    take
                );


            /*
             * Later:
             *
             * case 'ITEMS':
             *     return this.getItems(
             *         filters,
             *         skip,
             *         take
             *     );
             */


            default:

                throw new Error(
                    `Unsupported Spreadsheet source: ${entity.sourceKey}`
                );
        }
    }


    private getTransactions(
        filters: SpreadsheetFilters,
        skip: number,
        take: number
    ): any {

        return this.transactionService.getAll(

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

            filters.sorting || undefined,

            skip,

            take
        );
    }


    // =====================================================
    // MAP API DATA
    // =====================================================

    private buildRows(
        entity: SpreadsheetEntityDefinition,
        records: any[]
    ): any[] {

        const columns =
            entity.columns.filter(
                column =>
                    this.selectedColumns.includes(
                        column.key
                    )
            );


        return records.map(
            record => {

                const source =
                    this.mapRecord(
                        entity.sourceKey,
                        record
                    );


                const row: any = {};


                columns.forEach(
                    column => {

                        row[column.label] =
                            source[column.key];
                    }
                );


                return row;
            }
        );
    }


    private mapRecord(
        sourceKey: string,
        record: any
    ): any {

        switch (sourceKey) {

            case 'TRANSACTIONS':

                return this.mapTransaction(
                    record
                );


            default:

                return record;
        }
    }


    private mapTransaction(
        record: any
    ): any {

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
                record.entityObjectStatusCode ?? '',


            CreatedDate:
                this.formatDate(
                    record.creationTime
                ),


            CompleteDate:
                this.formatDate(
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


    // =====================================================
    // FILTERS
    // =====================================================

  private buildFilters(): SpreadsheetFilters {

    const filters: SpreadsheetFilters = {
        ...this.filterValues
    };

    if (
        filters.statusFilter == null ||
        Number(filters.statusFilter) === 0
    ) {
        filters.statusFilter = undefined;
    } else {
        filters.statusFilter =
            Number(filters.statusFilter);
    }

    return filters;
}


    // =====================================================
    // HELPERS
    // =====================================================

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
                            () => resolve()
                        );
                    }
                );
            }
        );
    }


    // =====================================================
    // CLOSE / RESET
    // =====================================================

    closePanel(): void {

        if (this.isAdding) {
            return;
        }


        this.reset();

        this.close.emit();
    }


    reset(): void {

        this.step = 1;

        this.selectedEntity = null;

        this.selectedColumns = [];

        this.filterValues = {};
    }
}