import { Component, Injector, Input, OnInit, Output, EventEmitter,ViewChild,ViewChildren } from '@angular/core';
import { ShoppingCartoccordionTabs } from "../../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto,ContactRoleEnum, AppTransactionContactDto } from '@shared/service-proxies/service-proxies';
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
  @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()

  
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
    apContactObj[0]?.companySSIN?this.apContactSelectedAdd=apContactObj[0]?.contactAddressDetail:null;
    let arContactObj=this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);
    arContactObj[0]?.companySSIN?this.arContactSelectedAdd=arContactObj[0]?.contactAddressDetail:null;
    this.loadpayTermsListListist();
  }
  updateTabInfo(addObj,contactRole){ 
    let contactIndex= this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == contactRole);
    if(contactIndex<0||contactIndex==this.oldappTransactionsForViewDto?.appTransactionContacts?.length){
      var appTransactionContactDto: AppTransactionContactDto = new AppTransactionContactDto();
      appTransactionContactDto.contactRole=contactRole;
      appTransactionContactDto.contactAddressCode=addObj.code;
      appTransactionContactDto.contactAddressId=addObj.id;
      appTransactionContactDto.contactAddressTypyId=addObj.typeId;
  
      this.oldappTransactionsForViewDto?.appTransactionContacts.push(appTransactionContactDto);
    }else{
      this.oldappTransactionsForViewDto.appTransactionContacts[contactIndex].contactRole=contactRole;
      this.oldappTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressCode=addObj.code;
      this.oldappTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressId=addObj.id;
      this.oldappTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressTypyId=addObj.typeId;
  
   
    }
    if(this.apContactSelectedAdd&&this.arContactSelectedAdd&&this.isArContactsValid&&this.isApContactsValid){
    this.enableSAveApcontact=true;
    }else{
      this.enableSAveArcontact=false;
    }

  if(contactRole==ContactRoleEnum.APContact){
  this.apContactSelectedAdd=addObj.selectedAddressObj
  }else{
    this.arContactSelectedAdd=addObj.selectedAddressObj
  
  }

   }
   
  isContactFormValid(value,sectionIndex) {

  if(this.activeTab==this.shoppingCartoccordionTabs.BillingInfo)
  {
  this.isContactsValid = value;
  if (this.isContactsValid){
    if(sectionIndex==1){
            this.apContactSelectedAdd?this.enableSAveApcontact = true:this.enableSAveApcontact = false;
    }else{
      this.arContactSelectedAdd?this.enableSAveArcontact = true:this.enableSAveArcontact = false;     
    }

  }else{
    if(sectionIndex==1){
    this.enableSAveApcontact = false;
    }else{
      this.enableSAveArcontact = false;
    }

  }
  if(this.apContactSelectedAdd&&this.arContactSelectedAdd&&this.enableSAveApcontact&&this.enableSAveArcontact){
    this.isContactsValid=true;
    this.shippingInfOValid.emit(ShoppingCartoccordionTabs.ShippingInfo);

    }else{
      this.isContactsValid=false;
    }
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
this.apContactSelectedAdd=null;
    //if(data.compssin){
   this.AddressComponentChild['first']?.getAddressList(data.compssin);

    //}

  }
  reloadAddresscomponentARContact(data){
    //if(data.compssin){
   this.contactIdARContact=data.compId;
   this.loadAddresComponentShipTo=true;
   this.arContactSelectedAdd=null;
   this.AddressComponentChild['second']? this.AddressComponentChild['second'].getAddressList(data.compssin):this.AddressComponentChild['last'].getAddressList(data.compssin);

   // }

  }
  createOrEditTransaction() {
    this.showMainSpinner()
    this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => {this.hideMainSpinner();this.generatOrderReport.emit(true)}))
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
  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }
  onshowBillingEditMode($event) {
    if ($event) {
      this.createOrEditBillingInfo = true;
    }
  }
  
updateApContact(addObj){
  this.updateTabInfo(addObj,ContactRoleEnum.APContact);
}
updateArContact(addObj){
this.updateTabInfo(addObj,ContactRoleEnum.ARContact);
}
}
