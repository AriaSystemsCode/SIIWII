import { Component, Injector, Input, OnInit, Output, EventEmitter, ViewChild, ViewChildren, SimpleChanges, OnChanges } from '@angular/core';
import { ShoppingCartoccordionTabs } from "../../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto, ContactRoleEnum, AppTransactionContactDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { AddressComponent } from '../../address/address.component';

@Component({
  selector: 'app-create-or-edit-billing-info',
  templateUrl: './create-or-edit-billing-info.component.html',
  styleUrls: ['./create-or-edit-billing-info.component.scss']
})
export class CreateOrEditBillingInfoComponent extends AppComponentBase  implements OnInit,OnChanges{
  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("BillingInfoValid") BillingInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
  isContactsValid: boolean = true;
  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;
  loadAddresComponentShipFrom: boolean = false;
  loadAddresComponentShipTo: boolean = false;
  contactIdARContact: string = '';
  contactIdApContact: string = '';
  addressSelected: boolean = false;
  payTermsListList: any = [];
  isArContactsValid: boolean = false;
  enableSAveApcontact: boolean = false;
  oldappTransactionsForViewDto: any;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  isApContactsValid: boolean = false;
  enableSAveArcontact: boolean = false;
  apContactSelectedAdd: any;
  arContactSelectedAdd: any
  @Input("createOrEditBillingInfo") createOrEditBillingInfo: boolean = true;
  @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input("canChange")  canChange:boolean=true;


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
  ) {
    super(injector);

  }
  ngOnInit() {
    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
    let apContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.APContact);
    apContactObj[0]?.companySSIN  && apContactObj[0]?.contactAddressDetail?.addressLine1 ? this.apContactSelectedAdd = apContactObj[0]?.contactAddressDetail : null;
    let arContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);
    arContactObj[0]?.companySSIN  && arContactObj[0]?.contactAddressDetail?.addressLine1 ? this.arContactSelectedAdd = arContactObj[0]?.contactAddressDetail : null;
    this.loadpayTermsListListist();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.appTransactionsForViewDto) {
      this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
      let apContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.APContact);
      apContactObj[0]?.companySSIN && apContactObj[0]?.contactAddressDetail?.addressLine1  ? this.apContactSelectedAdd = apContactObj[0]?.contactAddressDetail : null;
      let arContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);
      arContactObj[0]?.companySSIN && arContactObj[0]?.contactAddressDetail?.addressLine1  ? this.arContactSelectedAdd = arContactObj[0]?.contactAddressDetail : null;
      this.loadpayTermsListListist();
    }
  }

  updateTabInfo(addObj, contactRole) {
    let contactIndex = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == contactRole);
    if (contactIndex < 0 || contactIndex == this.appTransactionsForViewDto?.appTransactionContacts?.length) {
      var appTransactionContactDto: AppTransactionContactDto = new AppTransactionContactDto();
      appTransactionContactDto.contactRole = contactRole;
      appTransactionContactDto.contactAddressCode = addObj.code;
      appTransactionContactDto.contactAddressId = addObj.id;
      appTransactionContactDto.contactAddressTypyId = addObj.typeId;

      this.appTransactionsForViewDto?.appTransactionContacts.push(appTransactionContactDto);
    } else {
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactRole = contactRole;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressCode = addObj.code;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressId = addObj.id;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressTypyId = addObj.typeId;

      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactRole = contactRole;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressCode = addObj.code;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressId = addObj.id;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressTypyId = addObj.typeId;


    }
    if (this.isContactsValid) {
      let apContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.APContact);
      let arContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);
      apContactObj[0]?.contactAddressDetail  && apContactObj[0]?.contactAddressDetail?.addressLine1   ? this.enableSAveApcontact = true : apContactObj[0]?.contactAddressId ? this.enableSAveApcontact = true : this.enableSAveApcontact = false;
      arContactObj[0]?.contactAddressDetail  && arContactObj[0]?.contactAddressDetail?.addressLine1   ? this.enableSAveArcontact = true : arContactObj[0]?.contactAddressId ? this.enableSAveArcontact = true : this.enableSAveArcontact = false;
debugger
      if (this.enableSAveArcontact && this.enableSAveApcontact && this.appTransactionsForViewDto.paymentTermsId) {   
        this.BillingInfoValid.emit(ShoppingCartoccordionTabs.BillingInfo);

      }
    }



    if (contactRole == ContactRoleEnum.APContact) {
      this.apContactSelectedAdd = addObj.selectedAddressObj
    } else {
      this.arContactSelectedAdd = addObj.selectedAddressObj

    }

  }

  isContactFormValid(value, sectionIndex) {
    let apContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.APContact);
    let arContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);

    if (this.activeTab == this.shoppingCartoccordionTabs.BillingInfo) {
      this.isContactsValid = value;
      if (this.isContactsValid) {
        if (sectionIndex == 1) {
          (!apContactObj[0]?.companySSIN) ||( apContactObj[0]?.contactAddressDetail  && apContactObj[0]?.contactAddressDetail?.addressLine1 ) ? this.enableSAveApcontact = true : apContactObj[0]?.contactAddressId ? this.enableSAveApcontact = true : this.enableSAveApcontact = false;
        } else {
          (!arContactObj[0]?.companySSIN) ||( arContactObj[0]?.contactAddressDetail   && arContactObj[0]?.contactAddressDetail?.addressLine1 )? this.enableSAveArcontact = true : arContactObj[0]?.contactAddressId ? this.enableSAveArcontact = true : this.enableSAveArcontact = false;
        }
        this.enableSAveArcontact && this.enableSAveApcontact && this.appTransactionsForViewDto.paymentTermsId ? this.isContactsValid = true : this.isContactsValid = false;    
        if (this.enableSAveArcontact && this.enableSAveApcontact && this.appTransactionsForViewDto.paymentTermsId) { 
          this.isContactsValid = true;
          this.BillingInfoValid.emit(ShoppingCartoccordionTabs.BillingInfo);

        } else {
          this.isContactsValid = false;
        }
      } else {
        if (sectionIndex == 1) {
          this.enableSAveApcontact = false;
        } else {
          this.enableSAveArcontact = false;
        }

      }

    }

  }
  loadpayTermsListListist() {
    this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('PAYMENT-TERMS')
      .subscribe((res) => {
        this.payTermsListList = res;
        if(!this.appTransactionsForViewDto.paymentTermsId&&this.payTermsListList.length==1){
            this.appTransactionsForViewDto.paymentTermsId = this.payTermsListList[0]?.value;
            this.appTransactionsForViewDto.paymentTermsCode = this.payTermsListList[0]?.code;
        
        }
      })
  }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  reloadAddresscomponentAPContact(data) {
    this.loadAddresComponentShipFrom = true;
    this.contactIdApContact = data.compId;
   // this.apContactSelectedAdd = null;
    //if(data.compssin){
      if( this.AddressComponentChild)
    this.AddressComponentChild['first']?.getAddressList(data.compssin);

    //}

  }
  reloadAddresscomponentARContact(data) {
    //if(data.compssin){
    this.contactIdARContact = data.compId;
    this.loadAddresComponentShipTo = true;
 //   this.arContactSelectedAdd = null;
    if( this.AddressComponentChild)
    this.AddressComponentChild['second'] ? this.AddressComponentChild['second'].getAddressList(data.compssin) : this.AddressComponentChild['last'].getAddressList(data.compssin);

    // }

  }
  createOrEditTransaction() {
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => { this.hideMainSpinner(); this.generatOrderReport.emit(true) }))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          if (!this.showSaveBtn) {
            this.ontabChange.emit(ShoppingCartoccordionTabs.BillingInfo);
          }
          else {
            this.showSaveBtn = false;

          }
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
  showEditMode() {
    this.createOrEditBillingInfo = true;
    this.showSaveBtn = true;
    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
  }

  save() {
    this.createOrEditBillingInfo = false;
    this.setAddress();
    this.createOrEditTransaction();
  }
  cancel() {
  this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
  this.apContactSelectedAdd=null;
  this.arContactSelectedAdd=null;
   this.setAddress();
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditBillingInfo = false;
    this.showSaveBtn = false;
  }
  setAddress() {
    let apContactIndx = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.APContact);
    let arContactIndx = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.ARContact);

    if (!this.apContactSelectedAdd) {
      let apContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.APContact);
      apContactObj[0]?.companySSIN  && apContactObj[0]?.contactAddressDetail?.addressLine1 ? this.apContactSelectedAdd = apContactObj[0]?.contactAddressDetail : null;

      if (apContactIndx >= 0)
        this.appTransactionsForViewDto.appTransactionContacts[apContactIndx].contactAddressId = this.apContactSelectedAdd?.id;

    }
    else {
      if (apContactIndx >= 0) {
        this.appTransactionsForViewDto.appTransactionContacts[apContactIndx].contactAddressDetail = this.apContactSelectedAdd;
        this.appTransactionsForViewDto.appTransactionContacts[apContactIndx].contactAddressId = this.apContactSelectedAdd?.id;
      }
    }
    if (!this.arContactSelectedAdd) {
      let arContactObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ARContact);
      arContactObj[0]?.companySSIN   && arContactObj[0]?.contactAddressDetail?.addressLine1 ? this.arContactSelectedAdd = arContactObj[0]?.contactAddressDetail : null;
      if (arContactIndx >= 0)
        this.appTransactionsForViewDto.appTransactionContacts[arContactIndx].contactAddressId = this.arContactSelectedAdd?.id;

    }
    else {
      if (arContactIndx >= 0) {
        this.appTransactionsForViewDto.appTransactionContacts[arContactIndx].contactAddressDetail = this.arContactSelectedAdd;
        this.appTransactionsForViewDto.appTransactionContacts[arContactIndx].contactAddressId = this.arContactSelectedAdd?.id;
      }
    }
  }

  updateApContact(addObj) {
    this.updateTabInfo(addObj, ContactRoleEnum.APContact);
  }
  updateArContact(addObj) {
    this.updateTabInfo(addObj, ContactRoleEnum.ARContact);
  }

  onchangePayment($event) {
    var indx = this.payTermsListList?.findIndex(x => x.value == $event?.value);
    if (indx >= 0) {
      this.appTransactionsForViewDto.paymentTermsCode = this.payTermsListList[indx].code;
      this.appTransactionsForViewDto.paymentTermsId = this.payTermsListList[indx].value;
    }
  }
}