import { Component, Injector, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from "../../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { finalize } from 'rxjs';
@Component({
  selector: 'app-view-billing-info',
  templateUrl: './view-billing-info.component.html',
  styleUrls: ['./view-billing-info.component.scss']
})
export class ViewBillingInfoComponent   extends AppComponentBase{
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("createOrEditBillingInfo") createOrEditBillingInfo: boolean=false;
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  @Input() contactIdApContact:number;
  @Input() contactIdARContact:number;
  @Input() selectedAddressDetailsAp:number;
  @Input() selectedAddressDetailsAr:number;
  @Output("showBillingEditMode") showBillingEditMode: EventEmitter<boolean> = new EventEmitter<boolean>() 
  @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input("canChange")  canChange:boolean=true;
  @Output("isContactsValid_1") isContactsValid_1: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("isContactsValid_2") isContactsValid_2: EventEmitter<boolean> = new EventEmitter<boolean>()
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    ) {
    super(injector);

  }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  showEditMode() {
    this.createOrEditBillingInfo = true;
    this.onshowSaveBtn.emit(true);
    this.showBillingEditMode
    .emit(true);
  }
  isContactFormValid_1(value) {
    if (this.activeTab == this.shoppingCartoccordionTabs.BillingInfo) 
      this.isContactsValid_1.emit(value)
  }

  isContactFormValid_2(value) {
    if (this.activeTab == this.shoppingCartoccordionTabs.BillingInfo) 
      this.isContactsValid_2.emit(value)
  }
}
