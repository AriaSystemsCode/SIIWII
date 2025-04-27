import { Component, Injector, Input, Output, EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { TransactionCartMode } from '../../../../enums/TransactionCartMode';
import { TransactionCartoccordionTabs } from '../../../../enums/TransactionCartoccordionTabs';


@Component({
  selector: 'app-view-shipping-information',
  templateUrl: './view-shipping-information.component.html',
  styleUrls: ['./view-shipping-information.component.scss']
})
export class ViewShippingInformationComponent extends AppComponentBase {
  @Input() shoppingCartMode = TransactionCartMode;
  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("createOrEditshippingInfO") createOrEditshippingInfO: boolean = true;
  @Input() contactIdFrom: number;
  @Input() contactIdTo: number;
  @Input("selectedAddressDetailsFrom") selectedAddressDetailsFrom;
  @Input("selectedAddressDetailsTo") selectedAddressDetailsTo;
  @Output("showShippingEditMode") showShippingEditMode: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input("canChange") canChange: boolean = true;
  @Output("isContactsValid_1") isContactsValid_1: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("isContactsValid_2") isContactsValid_2: EventEmitter<boolean> = new EventEmitter<boolean>()

  transactionCartoccordionTabs = TransactionCartoccordionTabs;

  constructor(
    injector: Injector,

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
    if (this.activeTab == this.transactionCartoccordionTabs.ShippingInfo)
      this.isContactsValid_1.emit(value)
  }

  isContactFormValid_2(value) {
    if (this.activeTab == this.transactionCartoccordionTabs.ShippingInfo)
      this.isContactsValid_2.emit(value)
  }
}
