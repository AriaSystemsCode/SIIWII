import { Component, Injector, Input, OnInit, Output, EventEmitter,ViewChild,ViewChildren } from '@angular/core';
import { ShoppingCartoccordionTabs } from '../../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto,ContactRoleEnum } from '@shared/service-proxies/service-proxies';
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
  isshipFromContactsValid: boolean = false;
  isShipToContactsValid:boolean=false;
  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;
  loadAddresComponentShipFrom:boolean=false;
  loadAddresComponentShipTo:boolean=false;
  contactIdShipTo:string='';
  contactIdShipFrom:string='';
  addressSelected:boolean=false;
  enableSAveShipFrom:boolean=false;
  enableSAveShipTo:boolean=false;
  storeVal:any=null;
  shipViaValue:any=null;
  shipViaList:any=[];
  @Input("createOrEditshippingInfO") createOrEditshippingInfO: boolean=true;
  oldappTransactionsForViewDto;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  shippingTabValid:boolean=false;
  addressSelectedShipTo:boolean=false;
  shipFromSelectedAdd:any;
  shipToSelectedAdd:any;

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
    super(injector);

  }

  ngOnInit() {
    this.oldappTransactionsForViewDto =JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
    let shipFromObj=this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
    this.shipFromSelectedAdd=shipFromObj[0]?.contactAddressDetail;
    let shipToObj=this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
    this.shipToSelectedAdd=shipToObj[0]?.contactAddressDetail;
    this.storeVal=this.appTransactionsForViewDto?.buyerStore;
    this.shipViaValue=this.appTransactionsForViewDto?.shipViaId;
    this.loadShipViaList();
  }

updateTabInfo(addObj,contactRole){
 let contactIndex= this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == contactRole);
 
  if(contactIndex<0||contactIndex==this.appTransactionsForViewDto?.appTransactionContacts?.length){
    this.oldappTransactionsForViewDto?.appTransactionContacts.push({contactRole:contactRole,
                                                                   contactAddressCode:addObj.code,
                                                                   contactAddressId:addObj.id,
                                                                  contactAddressTypyId:addObj.typeId})
  }else{
    this.oldappTransactionsForViewDto.appTransactionContacts[contactIndex]={...this.appTransactionsForViewDto?.appTransactionContacts[contactIndex],contactRole:contactRole,
      contactAddressCode:addObj.code,
      contactAddressId:addObj.id,
     contactAddressTypyId:addObj.typeId}

  }
  if(contactRole==7&&addObj.id&&addObj.typeId){
    this.isshipFromContactsValid?this.enableSAveShipFrom=true:this.enableSAveShipFrom=false;
  }
  if(contactRole==6&&addObj.id&&addObj.typeId){
    this.isShipToContactsValid?this.enableSAveShipTo=true:this.enableSAveShipTo=false;

  }
}


updateShipToAddress(addObj){
  this.updateTabInfo(addObj,ContactRoleEnum.ShipToContact);
}
updateShipFromAddress(addObj){
this.updateTabInfo(addObj,ContactRoleEnum.ShipFromContact);
}
createOrEditTransaction() {
  this.showMainSpinner()
  this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
  this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((res) => {
      if (res) {
        this.oldappTransactionsForViewDto =JSON.stringify(this.appTransactionsForViewDto);
        if (!this.showSaveBtn)
          this.ontabChange.emit(ShoppingCartoccordionTabs.ShippingInfo);

        else
          this.showSaveBtn = false;
      }
    });
}
selectShipVia(){
    this.oldappTransactionsForViewDto.shipViaId=this.shipViaValue;
    this.oldappTransactionsForViewDto.shipViaCode=this.shipViaValue;

}
enterStore(){
    this.oldappTransactionsForViewDto.buyerStore=this.storeVal;
}
  isContactFormValid(value,sectionIndex) {
    this.shippingTabValid = value;
    if (this.shippingTabValid){
      if(sectionIndex==1){
              this.addressSelectedShipTo?this.enableSAveShipFrom = true:this.enableSAveShipFrom = false;
      }else{
        this.addressSelectedShipTo?this.enableSAveShipTo = true:this.enableSAveShipTo = false;     
      }
      this.shippingInfOValid.emit(ShoppingCartoccordionTabs.ShippingInfo);
    }else{
      if(sectionIndex==1){
      this.enableSAveShipFrom = false;
      }else{
        this.enableSAveShipTo = false;
      }

    }

  }
  loadShipViaList(){
    this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA')
    .subscribe((res)=>{
      this.shipViaList=res;
    })
    }
  onUpdateAppTransactionsForViewDto($event) {
    this.oldappTransactionsForViewDto = $event;
  }
  reloadAddresscomponentShipFrom(data){
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

}
