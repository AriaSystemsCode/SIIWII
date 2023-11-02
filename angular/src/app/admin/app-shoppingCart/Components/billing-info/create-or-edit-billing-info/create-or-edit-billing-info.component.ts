import { Component, Injector, Input, OnInit, Output, EventEmitter,ViewChild,ViewChildren } from '@angular/core';
import { ShoppingCartoccordionTabs } from "../../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto,ContactRoleEnum } from '@shared/service-proxies/service-proxies';
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
  isArContactsValid:boolean=false;
  enableSAveApcontact:boolean=false;
  oldappTransactionsForViewDto:any;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  isApContactsValid:boolean=false;
  enableSAveArcontact:boolean=false;
  apContactSelectedAdd:any;
  arContactSelectedAdd:any
  @Input("createOrEditBillingInfo") createOrEditBillingInfo: boolean=true;
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
    super(injector);

  }
  ngOnInit() {
    this.oldappTransactionsForViewDto =JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
    let apContactObj=this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.APContact);
    this.apContactSelectedAdd=apContactObj[0]?.contactAddressDetail;
    let arContactObj=this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);
    this.arContactSelectedAdd=arContactObj[0]?.contactAddressDetail;
    this.loadpayTermsListListist();
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
     if(contactRole==4&&addObj.id&&addObj.typeId){
       this.isArContactsValid?this.enableSAveApcontact=true:this.enableSAveApcontact=false;
     }
     if(contactRole==5&&addObj.id&&addObj.typeId){
       this.isApContactsValid?this.enableSAveArcontact=true:this.enableSAveArcontact=false;
   
     }
   }
   
  isContactFormValid(value) {
    this.isContactsValid = value;
    if (value){
      this.isContactsValid = true;
      this.shippingInfOValid.emit(ShoppingCartoccordionTabs.SalesRepInfo);
    }

  }
  loadpayTermsListListist(){
    this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('PAYMENT-TERMS')
    .subscribe((res)=>{
      debugger
      this.payTermsListList=res;
    })
    }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  reloadAddresscomponentAPContact(data){
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

  
updateApContact(addObj){
  this.updateTabInfo(addObj,ContactRoleEnum.APContact);
}
updateArContact(addObj){
this.updateTabInfo(addObj,ContactRoleEnum.ARContact);
}
}
