import { Component, Injector, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-or-edit-buyer-seller-contact-info',
  templateUrl: './create-or-edit-buyer-seller-contact-info.component.html',
  styleUrls: ['./create-or-edit-buyer-seller-contact-info.component.scss']
})
export class CreateOrEditBuyerSellerContactInfoComponent extends AppComponentBase
  implements OnInit {

  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("buyer_seller_contactInfoValid") buyer_seller_contactInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  companies: any[];
  searchTimeout: any;
  selectedPhoneType;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {


  }

  // activeTab== shoppingCartoccordionTabs.BuyerContactInfo
  // activeTab== shoppingCartoccordionTabs.SellerContactInfo


  createOrEdit() {
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEdit(this.appTransactionsForViewDto)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((res) => {
        if (res) {
          if (this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo)
            this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.BuyerContactInfo);

          if (this.activeTab == this.shoppingCartoccordionTabs.SellerContactInfo)
            this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.SellerContactInfo);

          this.ontabChange.emit(this.activeTab);
        }
      });
  }

  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  isContactsValid: boolean = false;
  isContactFormValid(value) {
    this.isContactsValid = value;
    if (value)
      this.isContactsValid = true;

  }





}
