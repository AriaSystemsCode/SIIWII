import { Component, Injector, Input, OnInit, Output, EventEmitter,ViewChild,ViewChildren } from '@angular/core';
import { ShoppingCartoccordionTabs } from '../../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { AddressComponent } from '../../Components/address/address.component';
@Component({
  selector: 'app-create-or-add-shipping-information',
  templateUrl: './create-or-add-shipping-information.component.html',
  styleUrls: ['./create-or-add-shipping-information.component.scss']
})
export class CreateOrAddShippingInformationComponent extends AppComponentBase {
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("shippingInfOValid") shippingInfOValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
  isContactsValid: boolean = false;
  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;
  loadAddresComponentShipFrom:boolean=false;
  loadAddresComponentShipTo:boolean=false;
  contactIdShipTo:string='';
  contactIdShipFrom:string='';
  addressSelected:boolean=false;
  shipViaList:any=[];
  @Input("createOrEditshippingInfO") createOrEditshippingInfO: boolean=true;
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
    super(injector);

  }

  ngOnInit() {
    this.loadShipViaList();
  }

  isContactFormValid(value) {
    this.isContactsValid = value;
    if (value){
      this.isContactsValid = true;
      this.shippingInfOValid.emit(ShoppingCartoccordionTabs.SalesRepInfo);
    }

  }
  loadShipViaList(){
    this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA')
    .subscribe((res)=>{
      debugger
      this.shipViaList=res;
    })
    }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  reloadAddresscomponentShipFrom(data){
    debugger
    this.loadAddresComponentShipFrom=true;
   this.contactIdShipFrom=data.compId;

    if(data.compssin){
   this.AddressComponentChild['first']?.getAddressList(data.compssin);

    }

  }
  reloadAddresscomponentShipTo(data){
    if(data.compssin){
   this.contactIdShipTo=data.compId;
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
