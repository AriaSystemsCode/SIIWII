import { Component, Injector, Input, OnInit, Output, EventEmitter, ViewChild, ViewChildren } from '@angular/core';
import { ShoppingCartoccordionTabs } from '../../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto, ContactRoleEnum, AppTransactionContactDto } from '@shared/service-proxies/service-proxies';
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
  isShipToContactsValid: boolean = false;
  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;
  loadAddresComponentShipFrom: boolean = false;
  loadAddresComponentShipTo: boolean = false;
  contactIdShipTo: string = '';
  contactIdShipFrom: string = '';
  addressSelected: boolean = false;
  enableSAveShipFrom: boolean = false;
  enableSAveShipTo: boolean = false;
  storeVal: any = null;
  shipViaValue: any = null;
  shipViaList: any = [];
  @Input("createOrEditshippingInfO") createOrEditshippingInfO: boolean = true;
  oldappTransactionsForViewDto;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  shippingTabValid: boolean = false;
  addressSelectedShipTo: boolean = false;
  shipFromSelectedAdd: any;
  shipToSelectedAdd: any;
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
    let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
    shipFromObj[0]?.companySSIN ? this.shipFromSelectedAdd = shipFromObj[0]?.contactAddressDetail : null;
    let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
    shipToObj[0]?.companySSIN ? this.shipToSelectedAdd = shipToObj[0]?.contactAddressDetail : null;
    this.storeVal = this.appTransactionsForViewDto?.buyerStore;
    //this.shipViaValue = this.appTransactionsForViewDto?.shipViaId;
    this.loadShipViaList();

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
    if (this.shippingTabValid) {
      let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
      let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
      shipFromObj[0]?.contactAddressDetail ? this.enableSAveShipFrom = true : shipFromObj[0]?.contactAddressId ? this.enableSAveShipFrom = true : this.enableSAveShipFrom = false;
      shipToObj[0]?.contactAddressDetail ? this.enableSAveShipTo = true : shipToObj[0]?.contactAddressId ? this.enableSAveShipTo = true : this.enableSAveShipTo = false;

      if (this.enableSAveShipFrom && this.enableSAveShipTo && this.appTransactionsForViewDto.shipViaId) { 
        this.shippingInfOValid.emit(ShoppingCartoccordionTabs.ShippingInfo);

      }
    }
    if (contactRole == ContactRoleEnum.ShipFromContact) {
      this.shipFromSelectedAdd = addObj.selectedAddressObj
    } else {
      this.shipToSelectedAdd = addObj.selectedAddressObj

    }
  }
  cancel() {
    this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.shipFromSelectedAdd=null;
    this.shipToSelectedAdd=null;
    this.setAddress();
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditshippingInfO = false;
    this.showSaveBtn = false;
  }
  save() {
    this.createOrEditshippingInfO = false;
    this.setAddress();
    this.createOrEditTransaction();
  }

  setAddress() {
    let shipFromIndx = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.ShipFromContact);
    let shipToIndx = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.ShipToContact);


    if (!this.shipFromSelectedAdd) {
      let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
      shipFromObj[0]?.companySSIN ? this.shipFromSelectedAdd = shipFromObj[0]?.contactAddressDetail : null;

      if (shipFromIndx >= 0)
        this.appTransactionsForViewDto.appTransactionContacts[shipFromIndx].contactAddressId = this.shipFromSelectedAdd?.id;
    }
    else {
      if (shipFromIndx >= 0) {
        this.appTransactionsForViewDto.appTransactionContacts[shipFromIndx].contactAddressDetail = this.shipFromSelectedAdd;
        this.appTransactionsForViewDto.appTransactionContacts[shipFromIndx].contactAddressId = this.shipFromSelectedAdd?.id;
      }
    }

    if (!this.shipToSelectedAdd) {
      let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
      shipToObj[0]?.companySSIN ? this.shipToSelectedAdd = shipToObj[0]?.contactAddressDetail : null;
      if (shipToIndx >= 0)
        this.appTransactionsForViewDto.appTransactionContacts[shipToIndx].contactAddressId = this.shipToSelectedAdd?.id;
    }
    else {
      if (shipToIndx >= 0) {
        this.appTransactionsForViewDto.appTransactionContacts[shipToIndx].contactAddressDetail = this.shipToSelectedAdd;
        this.appTransactionsForViewDto.appTransactionContacts[shipToIndx].contactAddressId = this.shipToSelectedAdd?.id;
      }
    }
  }
  updateShipToAddress(addObj) {
    this.updateTabInfo(addObj, ContactRoleEnum.ShipToContact);
  }
  updateShipFromAddress(addObj) {
    this.updateTabInfo(addObj, ContactRoleEnum.ShipFromContact);
  }
  createOrEditTransaction() {
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => { this.hideMainSpinner(); this.generatOrderReport.emit(true) }))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          if (!this.showSaveBtn)
            this.ontabChange.emit(ShoppingCartoccordionTabs.ShippingInfo);

          else
            this.showSaveBtn = false;
        }
      });
  }
  selectShipVia($event) {
    var index = this.shipViaList.findIndex(x => x.value = $event?.value)
    if (index >= 0) {
      this.appTransactionsForViewDto.shipViaId = this.shipViaList[index]?.value;
      this.appTransactionsForViewDto.shipViaCode = this.shipViaList[index]?.code;
    }

  }
  enterStore() {
    this.appTransactionsForViewDto.buyerStore = this.storeVal;
  }
  isContactFormValid(value, sectionIndex) {
    let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
    let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
    if (this.activeTab == this.shoppingCartoccordionTabs.ShippingInfo) {
      this.shippingTabValid = value;
      if (this.shippingTabValid) {

        if (sectionIndex == 1) {
          shipFromObj[0]?.contactAddressDetail ? this.enableSAveShipFrom = true : shipFromObj[0]?.contactAddressId ? this.enableSAveShipFrom = true : this.enableSAveShipFrom = false;
        } else {
          shipToObj[0]?.contactAddressDetail ? this.enableSAveShipTo = true : shipToObj[0]?.contactAddressId ? this.enableSAveShipTo = true : this.enableSAveShipTo = false;
        }
        this.enableSAveShipFrom && this.enableSAveShipTo && this.appTransactionsForViewDto.shipViaId ? this.shippingTabValid = true : this.shippingTabValid = false;  

        if (this.enableSAveShipFrom && this.enableSAveShipTo &&this.appTransactionsForViewDto.shipViaId) {  
          this.shippingTabValid = true;
          this.shippingInfOValid.emit(ShoppingCartoccordionTabs.ShippingInfo);

        } else {
          this.shippingTabValid = false;
        }
      } else {
        if (sectionIndex == 1) {
          this.enableSAveShipFrom = false;
        } else {
          this.enableSAveShipTo = false;
        }


      }

    }

  }
  loadShipViaList() {
    this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA')
      .subscribe((res) => {
        this.shipViaList = res;
        debugger
        if(!this.appTransactionsForViewDto.shipViaId&&this.shipViaList.length==1){
            this.shipViaValue=this.shipViaList[0];
            this.appTransactionsForViewDto.shipViaId = this.shipViaValue?.value;
            this.appTransactionsForViewDto.shipViaCode = this.shipViaValue?.code;
        }else if(this.appTransactionsForViewDto.shipViaId){
          this.shipViaValue=this.shipViaList.filter(item=>item.value==this.appTransactionsForViewDto.shipViaId);
        }
      })
  }
  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }
  onshowShippingEditMode($event) {
    if ($event) {
      this.createOrEditshippingInfO = true;
    }
  }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  reloadAddresscomponentShipFrom(data) {
    this.loadAddresComponentShipFrom = true;
    this.contactIdShipFrom = data.compId;
    this.shipFromSelectedAdd = null;
    // if(data.compssin){
    this.AddressComponentChild['first']?.getAddressList(data.compssin);

    //}

  }
  reloadAddresscomponentShipTo(data) {
    this.shipToSelectedAdd = null;

    // if(data.compssin){
    this.contactIdShipTo = data.compId;
    this.loadAddresComponentShipTo = true;
    this.AddressComponentChild['second'] ? this.AddressComponentChild['second'].getAddressList(data.compssin) : this.AddressComponentChild['last'].getAddressList(data.compssin);

    // }

  }

}
