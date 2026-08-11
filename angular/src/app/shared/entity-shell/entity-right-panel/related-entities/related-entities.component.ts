import {
  Component,
  Injector,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  AppTransactionServiceProxy
} from '@shared/service-proxies/service-proxies';

import {
  AppComponentBase
} from '@shared/common/app-component-base';

import {
  Paginator
} from 'primeng/paginator';

import {
  finalize
} from 'rxjs/operators';
import { forkJoin } from 'rxjs';
type RelatedTransactionView =
  'header' |
  'details';

@Component({
  selector: 'app-related-entities',
  templateUrl:
    './related-entities.component.html',
  styleUrls: [
    './related-entities.component.scss'
  ]
})
export class RelatedEntitiesComponent
  extends AppComponentBase
  implements OnInit {

  @ViewChild(
    'headerPaginator',
    { static: false }
  )
  headerPaginator:
    Paginator;

  @ViewChild(
    'headerTable',
    { static: false }
  )
  headerTable: any;

  @ViewChild(
    'detailsPaginator',
    { static: false }
  )
  detailsPaginator:
    Paginator;

  @ViewChild(
    'detailsTable',
    { static: false }
  )
  detailsTable: any;


  /*
   * Dropdown
   */
  selectedView:
    RelatedTransactionView =
      'header';

  viewOptions = [
    {
      label: 'Header Transaction',
      value: 'header'
    },
    {
      label: 'Details Transaction',
      value: 'details'
    }
  ];


  /*
   * Header Transactions
   */
  headerTransactions: any[] = [];

  headerTotalRecords = 0;

  headerRows = 10;

  headerLoading = false;


  /*
   * Transaction Details
   */
  transactionDetails: any[] = [];

  detailsTotalRecords = 0;

  detailsRows = 10;

  detailsLoading = false;

   @Input()entityData:any

loading = false;

  constructor(
    injector: Injector,

    private _appTransactionServiceProxy:
      AppTransactionServiceProxy
  ) {
    super(injector);
  }


  ngOnInit(): void {
    console.log(this.entityData,'entityData')

    /*
     * Default:
     * Header Transaction
     */
    this.loadHeaderTransactions();
  }


  /*
   * ====================================
   * DROPDOWN CHANGE
   * ====================================
   */

  onViewChange(
    view:
      RelatedTransactionView
  ): void {

    this.selectedView = view;

    if (
      view === 'header'
    ) {

      this.loadHeaderTransactions({
        first: 0,
        rows: this.headerRows
      });

      return;
    }


    this.loadTransactionDetails({
      first: 0,
      rows: this.detailsRows
    });
  }


  /*
   * ====================================
   * HEADER TRANSACTIONS
   * ====================================
   */

loadHeaderTransactions(event?: any): void {

  if (!this.entityData?.account?.name) {
    return;
  }

  if (this.headerLoading) {
    return;
  }

  const accountName =
    this.entityData.account.name.trim();

  /*
   * Current paginator values
   *
   * Page 1:
   * first = 0
   * rows = 10
   *
   * Page 2:
   * first = 10
   * rows = 10
   */
  const first =
    event?.first ?? 0;

  const rows =
    event?.rows ?? this.headerRows;

  this.headerRows = rows;

  /*
   * Because we have TWO APIs, we need enough
   * records from each API to create the
   * requested combined page.
   */
  const requiredCount =
    first + rows;

  this.headerLoading = true;


  /*
   * ========================================
   * PURCHASE ORDERS
   * Account is SELLER
   * ========================================
   */

  const purchaseOrders$ =
    this._appTransactionServiceProxy.getAll(

      false,
      0,
      undefined,

      // Search
      undefined,

      // Code
      undefined,

      undefined,

      // Transaction type
      undefined,

      // Dates
      undefined,
      undefined,
      undefined,
      undefined,

      // Seller name
      accountName,

      undefined,

      // Buyer name
      undefined,

      undefined,

      // Status
      undefined,

      false,

      undefined,
      undefined,

      // Reference
      undefined,

      // Sorting
      undefined,

      // Skip
      0,

      // Max result count
      requiredCount
    );


  /*
   * ========================================
   * SALES ORDERS
   * Account is BUYER
   * ========================================
   */

  const salesOrders$ =
    this._appTransactionServiceProxy.getAll(

      false,
      0,
      undefined,

      // Search
      undefined,

      // Code
      undefined,

      undefined,

      // Transaction type
      undefined,

      // Dates
      undefined,
      undefined,
      undefined,
      undefined,

      // Seller name
      undefined,

      undefined,

      // Buyer name
      accountName,

      undefined,

      // Status
      undefined,

      false,

      undefined,
      undefined,

      // Reference
      undefined,

      // Sorting
      undefined,

      // Skip
      0,

      // Max result count
      requiredCount
    );


  /*
   * ========================================
   * EXECUTE BOTH CALLS
   * ========================================
   */

  forkJoin({

    purchaseOrders:
      purchaseOrders$,

    salesOrders:
      salesOrders$

  })
    .pipe(

      finalize(() => {

        this.headerLoading =
          false;

      })

    )
    .subscribe({

      next: result => {

        /*
         * ====================================
         * RESULTS
         * ====================================
         */

        const purchaseOrders =
          result.purchaseOrders?.items ?? [];

        const salesOrders =
          result.salesOrders?.items ?? [];


        /*
         * ====================================
         * TOTAL RECORDS
         * ====================================
         */

        const purchaseTotal =
          result.purchaseOrders?.totalCount ?? 0;

        const salesTotal =
          result.salesOrders?.totalCount ?? 0;


        this.headerTotalRecords =
          purchaseTotal +
          salesTotal;


        /*
         * ====================================
         * MERGE BOTH RESULTS
         * ====================================
         */

        let allTransactions: any[] = [

          ...purchaseOrders,

          ...salesOrders

        ];


        /*
         * ====================================
         * SORT BY CREATION DATE
         * ====================================
         *
         * creationTime is Moment,
         * so DON'T use:
         *
         * new Date(creationTime)
         *
         * Use valueOf() instead.
         */

        allTransactions =
          allTransactions.sort(
            (a, b) => {

              const aDate =
                a?.creationTime
                  ? a.creationTime.valueOf()
                  : 0;

              const bDate =
                b?.creationTime
                  ? b.creationTime.valueOf()
                  : 0;

              return (
                bDate -
                aDate
              );
            }
          );


        /*
         * ====================================
         * COMBINED PAGINATION
         * ====================================
         *
         * Example:
         *
         * first = 0
         * rows = 10
         *
         * => records 0 - 9
         *
         *
         * first = 10
         * rows = 10
         *
         * => records 10 - 19
         */

        this.headerTransactions =
          allTransactions.slice(
            first,
            first + rows
          );


        /*
         * ====================================
         * DEBUG
         * ====================================
         */

        console.log(
          'Related Transactions Pagination',
          {
            accountName,

            first,

            rows,

            requiredCount,

            purchaseFetched:
              purchaseOrders.length,

            purchaseTotal,

            salesFetched:
              salesOrders.length,

            salesTotal,

            combinedFetched:
              allTransactions.length,

            totalRecords:
              this.headerTotalRecords,

            displayedRecords:
              this.headerTransactions.length
          }
        );

      },


      error: error => {

        console.error(
          'Failed to load related transactions',
          error
        );

        this.notify.error(
          this.l(
            'FailedToLoadData'
          )
        );

      }

    });

}

  /*
   * ====================================
   * DETAILS TRANSACTIONS
   * ====================================
   */

  loadTransactionDetails(
    event?: any
  ): void {

    if (this.detailsLoading) {
      return;
    }


    const rows =
      event?.rows ??
      this.detailsRows;

    const first =
      event?.first ?? 0;


    this.detailsRows =
      rows;


    const skipCount =
      first;


    const sorting =
      this.detailsTable
        ?.sortField
        ? `${this.detailsTable.sortField} ${
            this.detailsTable.sortOrder === 1
              ? 'ASC'
              : 'DESC'
          }`
        : undefined;


    this.detailsLoading =
      true;


    this._appTransactionServiceProxy
      .getllTransactionVariationsDetail(

        /*
         * variationCodeFilter
         */
        undefined,

        /*
         * Transaction type
         */
        undefined,

        /*
         * Search
         */
        undefined,

        /*
         * Transaction number
         */
        undefined,

        /*
         * Price range
         */
        undefined,
        undefined,

        /*
         * Amount range
         */
        undefined,
        undefined,

        sorting,

        skipCount,
        rows
      )
      .pipe(
        finalize(() => {

          this.detailsLoading =
            false;

        })
      )
      .subscribe({

        next: result => {

          this.transactionDetails =
            result?.items ?? [];

          this.detailsTotalRecords =
            result?.totalCount ?? 0;
        },

        error: error => {

          console.error(
            'Failed to load transaction details',
            error
          );

          this.notify.error(
            this.l(
              'FailedToLoadData'
            )
          );
        }

      });
  }


  /*
   * ====================================
   * SORT
   * ====================================
   */

  onHeaderSort(): void {

    this.loadHeaderTransactions({
      first: 0,
      rows: this.headerRows
    });
  }


  onDetailsSort(): void {

    this.loadTransactionDetails({
      first: 0,
      rows: this.detailsRows
    });
  }
}