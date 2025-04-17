import { Component, Injector, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-create-or-edit-sales-rep-info',
  templateUrl: './create-or-edit-sales-rep-info.component.html',
  styleUrls: ['./create-or-edit-sales-rep-info.component.scss']
})

export class CreateOrEditSalesRepInfoComponent extends AppComponentBase {
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
  @Output("SalesRepInfoValid") SalesRepInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output("refreshShoppingCart") refreshShoppingCart: EventEmitter<boolean> = new EventEmitter<boolean>()


  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  @Input("createOrEditSalesRepInfo") createOrEditSalesRepInfo: boolean = true;
  @Input("canChange") canChange: boolean = true;

  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
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
    let enteredDate = this.appTransactionsForViewDto.enteredDate.toLocaleString();
    let startDate = this.appTransactionsForViewDto.startDate.toLocaleString();
    let availableDate = this.appTransactionsForViewDto.availableDate.toLocaleString();
    let completeDate = this.appTransactionsForViewDto.completeDate.toLocaleString();


    this.appTransactionsForViewDto.enteredDate = moment.utc(enteredDate);
    this.appTransactionsForViewDto.startDate = moment.utc(startDate);
    this.appTransactionsForViewDto.availableDate = moment.utc(availableDate);
    this.appTransactionsForViewDto.completeDate = moment.utc(completeDate);
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
            this.ontabChange.emit(ShoppingCartoccordionTabs.SalesRepInfo);

          else
            this.showSaveBtn = false;
        }
      });
  }


  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  isContactFormValid(value) {
    if (this.activeTab == this.shoppingCartoccordionTabs.SalesRepInfo) {
      this.isContactsValid = value;
      if (value) {
        this.isContactsValid = true;
        this.SalesRepInfoValid.emit(ShoppingCartoccordionTabs.SalesRepInfo);
      }
    }

  }

  addNewSalesRep() {
    this.salesReps.push(this.salesReps.length);
  }

}
