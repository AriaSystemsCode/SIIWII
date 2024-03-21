import { Component, Injector, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';

@Component({
  selector: 'app-create-or-edit-buyer-seller-contact-info',
  templateUrl: './create-or-edit-buyer-seller-contact-info.component.html',
  styleUrls: ['./create-or-edit-buyer-seller-contact-info.component.scss']
})
export class CreateOrEditBuyerSellerContactInfoComponent extends AppComponentBase
  implements OnInit, OnChanges {
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("buyer_seller_contactInfoValid") buyer_seller_contactInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  companies: any[];
  searchTimeout: any;
  selectedPhoneType;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()

  @Input("createOrEditbuyerContactInfo") createOrEditbuyerContactInfo: boolean = true;
  @Input("createOrEditSellerContactInfo") createOrEditSellerContactInfo: boolean = true;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  oldappTransactionsForViewDto;
  @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()

  @Input("canChange")  canChange:boolean=true;
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

  }

  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }

  onshowBuyer_sellerEditMode($event) {
    if ($event)
      this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = true : this.createOrEditSellerContactInfo = true;
  }
  save() {
    this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = false : this.createOrEditSellerContactInfo = false;
    this.createOrEditTransaction();
  }
  cancel() {
    this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = false : this.createOrEditSellerContactInfo = false;
    this.showSaveBtn = false;
  }

  createOrEditTransaction() {
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() =>  {this.hideMainSpinner();this.generatOrderReport.emit(true)}))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          /*  if (this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo)
             this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.BuyerContactInfo);
 
           if (this.activeTab == this.shoppingCartoccordionTabs.SellerContactInfo)
             this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.SellerContactInfo); */
          if (!this.showSaveBtn)
            this.ontabChange.emit(this.activeTab);
          else
            this.showSaveBtn = false;

        }
      });
  }

  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  isContactsValid: boolean = false;
  isContactFormValid(value) {
    if(this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo ||this.activeTab==this.shoppingCartoccordionTabs.SellerContactInfo)
    {
    this.isContactsValid = value;
    if (value) {
      this.isContactsValid = true;
      if (this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo)
        this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.BuyerContactInfo);

      if (this.activeTab == this.shoppingCartoccordionTabs.SellerContactInfo)
        this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.SellerContactInfo);
    }
  }

  }





}
