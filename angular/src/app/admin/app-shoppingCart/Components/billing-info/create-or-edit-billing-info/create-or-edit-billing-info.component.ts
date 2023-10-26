import { Component, Injector, Input, OnInit, Output, EventEmitter,ViewChild,ViewChildren } from '@angular/core';
import { ShoppingCartoccordionTabs } from "../../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { AddressComponent } from '../../address/address.component';

@Component({
  selector: 'app-create-or-edit-billing-info',
  templateUrl: './create-or-edit-billing-info.component.html',
  styleUrls: ['./create-or-edit-billing-info.component.scss']
})
export class CreateOrEditBillingInfoComponent extends AppComponentBase  {
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("shippingInfOValid") shippingInfOValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
  isContactsValid: boolean = false;
  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;
  loadAddresComponentShipFrom:boolean=false;
  loadAddresComponentShipTo:boolean=false;
  contactIdARContact:string='';
  contactIdApContact:string='';
  addressSelected:boolean=false;
  payTermsListList:any=[];
  @Input("createOrEditBillingInfo") createOrEditBillingInfo: boolean=true;
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
    super(injector);

  }

  ngOnInit() {
    this.loadpayTermsListListist();
  }

  isContactFormValid(value) {
    this.isContactsValid = value;
    if (value){
      this.isContactsValid = true;
      this.shippingInfOValid.emit(ShoppingCartoccordionTabs.SalesRepInfo);
    }

  }
  loadpayTermsListListist(){
    this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('PaymentTerms')
    .subscribe((res)=>{
      debugger
      this.payTermsListList=res;
    })
    }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  reloadAddresscomponentAPContact(data){
    debugger
    this.loadAddresComponentShipFrom=true;
   this.contactIdApContact=data.compId;

    if(data.compssin){
   this.AddressComponentChild['first']?.getAddressList(data.compssin);

    }

  }
  reloadAddresscomponentARContact(data){
    if(data.compssin){
   this.contactIdARContact=data.compId;
   this.loadAddresComponentShipTo=true;
   this.AddressComponentChild['second']? this.AddressComponentChild['second'].getAddressList(data.compssin):this.AddressComponentChild['last'].getAddressList(data.compssin);

    }

  }
  createOrEditTransaction() {
    this.showMainSpinner();

    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)

        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe((res) => {
            if (res) {
                this.ontabChange.emit(ShoppingCartoccordionTabs.ShippingInfo);
            }
        });
}
}
