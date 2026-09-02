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
import { TransactionInformationComponent } from '@app/main/transactions/app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component';
import { TransactionCartMode } from '@app/main/transactions/enums/TransactionCartMode';
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

@ViewChild(
  'shoppingCartModal',
  { static: false }
)
shoppingCartModal:
  TransactionInformationComponent;
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
    this.loadHeaderTransactions();
  }

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

loadHeaderTransactions(event?: any): void {

  if (!this.entityData?.account?.name) {
    return;
  }

  if (this.headerLoading) {
    return;
  }

  const accountName =   this.entityData.account.name.trim();
  const first = event?.first ?? 0;
  const rows =   event?.rows ?? this.headerRows;
  this.headerRows = rows;
  const requiredCount = first + rows;
  this.headerLoading = true;
  const purchaseOrders$ =
    this._appTransactionServiceProxy.getAll(
      false,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      accountName,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      0,
      requiredCount
    );

  const salesOrders$ =
    this._appTransactionServiceProxy.getAll(
      false,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      accountName,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      0,
      requiredCount
    );

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

        const purchaseOrders =  result.purchaseOrders?.items ?? [];
        const salesOrders =   result.salesOrders?.items ?? [];
        const purchaseTotal =  result.purchaseOrders?.totalCount ?? 0;
        const salesTotal =  result.salesOrders?.totalCount ?? 0;
        this.headerTotalRecords =  purchaseTotal + salesTotal;

        let allTransactions: any[] = [
          ...purchaseOrders,
          ...salesOrders

        ];

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


        this.headerTransactions =
          allTransactions.slice(
            first,
            first + rows
          );

      },

    });

}


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
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
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

      });
  }


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

  onHeaderTransactionSelect(
  record: any
): void {

  if (
    !record?.id ||
    !this.shoppingCartModal
  ) {
    return;
  }

  const transactionId =
    Number(record.id);

  if (!transactionId) {
    return;
  }

  if (
    record.entityObjectStatusCode ===
    'DRAFT'
  ) {

    this.shoppingCartModal.show(
      transactionId,
      true,
      true,
      TransactionCartMode.createOrEdit
    );

  } else {

    this.shoppingCartModal.show(
      transactionId,
      true,
      true,
      TransactionCartMode.view
    );
  }
}


onHideShoppingCartModal(
  event: any
): void {

  if (event) {
    this.loadHeaderTransactions({
      first:
        this.headerPaginator?.first ??
        0,

      rows:
        this.headerRows
    });
  }
}
}