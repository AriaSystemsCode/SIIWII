import { Component, Injector, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { ShoppingCartMode } from '../../Components/shopping-cart-view-component/ShoppingCartMode';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-shipping-information',
  templateUrl: './view-shipping-information.component.html',
  styleUrls: ['./view-shipping-information.component.scss']
})
export class ViewShippingInformationComponent  extends AppComponentBase{
  @Input() shoppingCartMode = ShoppingCartMode;
  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("createOrEditshippingInfO") createOrEditshippingInfO: boolean=true;
  @Input() contactIdFrom:number;
  @Input() contactIdTo:number;
  @Input("selectedAddressDetailsFrom") selectedAddressDetailsFrom;
  @Input("selectedAddressDetailsTo") selectedAddressDetailsTo;
  @Output("showShippingEditMode") showShippingEditMode: EventEmitter<boolean> = new EventEmitter<boolean>() 
  @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input("canChange")  canChange:boolean=true;
  @Output("isContactsValid_1") isContactsValid_1: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("isContactsValid_2") isContactsValid_2: EventEmitter<boolean> = new EventEmitter<boolean>()

  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  ngOnInit() {
  }
  showEditMode() {
    this.createOrEditshippingInfO = true;
    this.onshowSaveBtn.emit(true);
    this.showShippingEditMode.emit(true);
  }
  isContactFormValid_1(value) {
    if (this.activeTab == this.shoppingCartoccordionTabs.ShippingInfo) 
      this.isContactsValid_1.emit(value)
  }

  isContactFormValid_2(value) {
    if (this.activeTab == this.shoppingCartoccordionTabs.ShippingInfo) 
      this.isContactsValid_2.emit(value)
  }
}
