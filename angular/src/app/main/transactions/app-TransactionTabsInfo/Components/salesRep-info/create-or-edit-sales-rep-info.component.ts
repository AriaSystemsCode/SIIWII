import { Component, Injector, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { TransactionCartoccordionTabs } from '../transaction-information-component/TransactionCartoccordionTabs';

@Component({
  selector: 'app-create-or-edit-sales-rep-info',
  templateUrl: './create-or-edit-sales-rep-info.component.html',
  styleUrls: ['./create-or-edit-sales-rep-info.component.scss']
})

export class CreateOrEditSalesRepInfoComponent extends AppComponentBase {
  @Output("ontabChange") ontabChange: EventEmitter<TransactionCartoccordionTabs> = new EventEmitter<TransactionCartoccordionTabs>()
  @Output("SalesRepInfoValid") SalesRepInfoValid: EventEmitter<TransactionCartoccordionTabs> = new EventEmitter<TransactionCartoccordionTabs>();
  @Output("refreshShoppingCart") refreshShoppingCart: EventEmitter<boolean> = new EventEmitter<boolean>()


  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  @Input("createOrEditSalesRepInfo") createOrEditSalesRepInfo: boolean = true;
  @Input("canChange") canChange: boolean = true;

  transactionCartoccordionTabs = TransactionCartoccordionTabs;
  salesRepIndex = 1;
  salesReps: any[];
  oldappTransactionsForViewDto;
  cancelBtn: boolean = false;
  saveBtn: boolean = false;
  isContactsValid: boolean = false;


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));

    this.salesReps = [];
    this.salesReps.push(1);
    var SalesRep1Index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.SalesRep1);
    var SalesRep2Index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.SalesRep2);

    if (SalesRep1Index >= 0)
      this.addNewSalesRep();

    if (SalesRep2Index >= 0)
      this.addNewSalesRep();
  }
  onShowSalesRepEditMode($event) {
    if ($event) {
      this.createOrEditSalesRepInfo = true;
      this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));

    }
  }

  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }

  save() {
    this.createOrEditSalesRepInfo = false;
    this.createOrEditTransaction();
  }
  cancel() {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditSalesRepInfo = false;
    this.showSaveBtn = false;
  }
  createOrEditTransaction() {
    this.showMainSpinner()

    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => {
        this.hideMainSpinner();
      }))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          this.refreshShoppingCart.emit(true)

          if (!this.showSaveBtn)
            this.ontabChange.emit(TransactionCartoccordionTabs.SalesRepInfo);

          else
            this.showSaveBtn = false;
        }
      });
  }


  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  isContactFormValid(value) {
    if (this.activeTab == this.transactionCartoccordionTabs.SalesRepInfo) {
      this.isContactsValid = value;
      if (value) {
        this.isContactsValid = true;
        this.SalesRepInfoValid.emit(TransactionCartoccordionTabs.SalesRepInfo);
      }
    }

  }

  addNewSalesRep() {
    this.salesReps.push(this.salesReps.length);
  }

}
