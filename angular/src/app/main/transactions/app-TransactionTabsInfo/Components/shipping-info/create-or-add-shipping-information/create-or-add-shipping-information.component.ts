import { Component, Injector, Input, OnInit, Output, EventEmitter, ViewChildren, SimpleChanges, OnChanges, AfterViewInit, OnDestroy, QueryList } from '@angular/core';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAppTransactionsForViewDto, ContactRoleEnum, AppTransactionContactDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize, Subscription } from 'rxjs';
import { AddressComponent } from '../../address/address.component';
import { TransactionCartoccordionTabs } from '../../../../enums/TransactionCartoccordionTabs';
import * as moment from 'moment';

@Component({
  selector: 'app-create-or-add-shipping-information',
  templateUrl: './create-or-add-shipping-information.component.html',
  styleUrls: ['./create-or-add-shipping-information.component.scss']
})
export class CreateOrAddShippingInformationComponent extends AppComponentBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("canChange") canChange: boolean = true;

  @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("shippingInfOValid") shippingInfOValid: EventEmitter<TransactionCartoccordionTabs> = new EventEmitter<TransactionCartoccordionTabs>();
  @Output("refreshShoppingCart") refreshShoppingCart: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("ontabChange") ontabChange: EventEmitter<TransactionCartoccordionTabs> = new EventEmitter<TransactionCartoccordionTabs>()
  @Input("createOrEditshippingInfO") createOrEditshippingInfO: boolean = true;
  @Input("showSaveBtn") showSaveBtn: boolean = false;

  @ViewChildren(AddressComponent) addressComponentRefs: QueryList<AddressComponent>;

  transactionCartoccordionTabs = TransactionCartoccordionTabs;
contactIdShipTo: string | number | null = null;
contactIdShipFrom: string | number | null = null;
  enableSAveShipFrom: boolean = false;
  enableSAveShipTo: boolean = false;
  storeVal: any = null;
  shipViaValue: any = null;
  shipViaList: any = [];
  oldappTransactionsForViewDto;
  shippingTabValid: boolean = false;
  shipFromSelectedAdd: any;
  shipToSelectedAdd: any;
  isAccManual: boolean = false
  cancelBtn: boolean = false;
  saveBtn: boolean = false;
  shipFromData;
  shipToData;

  subscriptions: Subscription[] = [];


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
  ) {
    super(injector);

  }

  ngAfterViewInit() {

    if (this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {
      this.contactIdShipFrom = this.shipFromData?.compId;
      this.contactIdShipTo = this.shipToData?.compId;
      const addressComponents = this.addressComponentRefs?.toArray();
      addressComponents?.find(c => c.shipInfoIndex === 1)?.getAddressList(this.shipFromData?.compssin, this.shipFromData?.branchSsin);
      addressComponents?.find(c => c.shipInfoIndex === 2)?.getAddressList(this.shipToData?.compssin, this.shipToData?.branchSsin);

    }

  }
//   ngAfterViewInit() {
//   if (this.currentTab !== TransactionCartoccordionTabs.ShippingInfo) {
//     return;
//   }

//   setTimeout(() => {
//     if (this.shipFromData?.compId) {
//       this.contactIdShipFrom = this.shipFromData.compId;

//       const addressComponents = this.addressComponentRefs?.toArray();
//       addressComponents
//         ?.find(c => c.shipInfoIndex === 1)
//         ?.getAddressList(this.shipFromData?.compssin, this.shipFromData?.branchSsin);
//     }

//     if (this.shipToData?.compId) {
//       this.contactIdShipTo = this.shipToData.compId;

//       const addressComponents = this.addressComponentRefs?.toArray();
//       addressComponents
//         ?.find(c => c.shipInfoIndex === 2)
//         ?.getAddressList(this.shipToData?.compssin, this.shipToData?.branchSsin);
//     }
//   });
// }
  ngOnInit() {
    this.isMamualAcc()
    if (this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {

      this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
      let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
      shipFromObj[0]?.companySSIN && shipFromObj[0]?.contactAddressDetail?.addressLine1 ? this.shipFromSelectedAdd = shipFromObj[0]?.contactAddressDetail : null;
      let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
      shipToObj[0]?.companySSIN && shipToObj[0]?.contactAddressDetail?.addressLine1 ? this.shipToSelectedAdd = shipToObj[0]?.contactAddressDetail : null;
      this.storeVal = this.appTransactionsForViewDto?.buyerStore;

    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {

      if (this.appTransactionsForViewDto) {
        this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
        let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
        shipFromObj[0]?.companySSIN && shipFromObj[0]?.contactAddressDetail?.addressLine1 ? this.shipFromSelectedAdd = shipFromObj[0]?.contactAddressDetail : null;
        let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
        shipToObj[0]?.companySSIN && shipToObj[0]?.contactAddressDetail?.addressLine1 ? this.shipToSelectedAdd = shipToObj[0]?.contactAddressDetail : null;
        this.storeVal = this.appTransactionsForViewDto?.buyerStore;
        this.loadShipViaList();
      }
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
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressLine1 = addObj?.selectedAddressObj?.addressLine1;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressLine2 = addObj?.selectedAddressObj?.addressLine2;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressName = addObj?.selectedAddressObj?.name;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressPostalCode = addObj?.selectedAddressObj?.postalCode;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressState = addObj?.selectedAddressObj?.state;
      this.appTransactionsForViewDto.appTransactionContacts[contactIndex].contactAddressDetail = addObj?.selectedAddressObj;



    }
    if (this.shippingTabValid) {
      let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
      let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
      shipFromObj[0]?.contactAddressDetail && shipFromObj[0]?.contactAddressDetail?.addressLine1 ? this.enableSAveShipFrom = true : shipFromObj[0]?.contactAddressId ? this.enableSAveShipFrom = true : this.enableSAveShipFrom = false;
      shipToObj[0]?.contactAddressDetail && shipToObj[0]?.contactAddressDetail?.addressLine1 ? this.enableSAveShipTo = true : shipToObj[0]?.contactAddressId ? this.enableSAveShipTo = true : this.enableSAveShipTo = false;

    }
    if (contactRole == ContactRoleEnum.ShipFromContact) {
      this.shipFromSelectedAdd = addObj.selectedAddressObj
    } else {
      this.shipToSelectedAdd = addObj.selectedAddressObj

    }
    this.validateShippingTab();

  }
  cancel() {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.shipFromSelectedAdd = null;
    this.shipToSelectedAdd = null;
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
      shipFromObj[0]?.companySSIN && shipFromObj[0]?.contactAddressDetail?.addressLine1 ? this.shipFromSelectedAdd = shipFromObj[0]?.contactAddressDetail : null;

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
      shipToObj[0]?.companySSIN && shipToObj[0]?.contactAddressDetail?.addressLine1 ? this.shipToSelectedAdd = shipToObj[0]?.contactAddressDetail : null;
      if (shipToIndx >= 0)
        this.appTransactionsForViewDto.appTransactionContacts[shipToIndx].contactAddressId = this.shipToSelectedAdd?.id;
    }
    else {
      if (shipToIndx >= 0) {
        this.appTransactionsForViewDto.appTransactionContacts[shipToIndx].contactAddressDetail = this.shipToSelectedAdd;
        this.appTransactionsForViewDto.appTransactionContacts[shipToIndx].contactAddressId = this.shipToSelectedAdd?.id;
      }
    }
    this.validateShippingTab();

  }
  updateShipToAddress(addObj) {
    this.updateTabInfo(addObj, ContactRoleEnum.ShipToContact);
    if (addObj) {
      this.enableSAveShipTo = true
      this.validateShippingTab();

    }
  }
  updateShipFromAddress(addObj) {
    this.updateTabInfo(addObj, ContactRoleEnum.ShipFromContact);
    if (addObj) {
      this.enableSAveShipFrom = true
      this.validateShippingTab();

    }
  }
  createOrEditTransaction() {
    this.showMainSpinner()
    this.saveDates()
    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const subs = this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => {
        this.hideMainSpinner();
        this.refreshShoppingCart.emit(true)

      }))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          if (!this.showSaveBtn)
            this.ontabChange.emit(TransactionCartoccordionTabs.ShippingInfo);

          else
            this.showSaveBtn = false;
        }
      });

    this.subscriptions.push(subs)
  }

  enterStore() {
    this.appTransactionsForViewDto.buyerStore = this.storeVal;
  }
  isContactFormValid(value, sectionIndex) {
    let shipFromObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipFromContact);
    let shipToObj = this.appTransactionsForViewDto?.appTransactionContacts?.filter(x => x.contactRole == ContactRoleEnum.ShipToContact);
    if (this.activeTab == this.transactionCartoccordionTabs.ShippingInfo) {
      this.shippingTabValid = value;
      if (this.shippingTabValid) {

        if (sectionIndex == 1) {

          (!shipFromObj[0]?.companySSIN) || (shipFromObj[0]?.contactAddressDetail && shipFromObj[0]?.contactAddressDetail?.addressLine1) ? this.enableSAveShipFrom = true : shipFromObj[0]?.contactAddressId ? this.enableSAveShipFrom = true : this.enableSAveShipFrom = false;


        } else {
          (shipToObj[0]?.contactAddressDetail && shipToObj[0]?.contactAddressDetail?.addressLine1) ? this.enableSAveShipTo = true : shipToObj[0]?.contactAddressId ? this.enableSAveShipTo = true : this.enableSAveShipTo = false;
        }
        this.enableSAveShipFrom && this.enableSAveShipTo && this.appTransactionsForViewDto.shipViaId ? this.shippingTabValid = true : this.shippingTabValid = false;

        if (this.enableSAveShipFrom && this.enableSAveShipTo && this.appTransactionsForViewDto.shipViaId) {
          this.shippingTabValid = true;
          this.shippingInfOValid.emit(TransactionCartoccordionTabs.ShippingInfo);

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
    this.validateShippingTab();

  }


  selectShipVia($event) {
    var index = this.shipViaList.findIndex(x => x.value == $event?.value)
    if (index >= 0) {
      this.appTransactionsForViewDto.shipViaId = this.shipViaList[index]?.value;
      this.appTransactionsForViewDto.shipViaCode = this.shipViaList[index]?.code;
    }

    this.validateShippingTab();

  }

  isMamualAcc() {
    let accSSin = ''
    if (this.appTransactionsForViewDto?.entityObjectTypeCode == 'SALESORDER') {
      accSSin = this.appTransactionsForViewDto?.buyerCompanySSIN
    } else if (this.appTransactionsForViewDto?.entityObjectTypeCode == 'PURCHASEORDER') {
      accSSin = this.appTransactionsForViewDto?.sellerCompanySSIN
    }
    const subs = this._AppTransactionServiceProxy.isManualCompany(accSSin)
      .subscribe((res) => {

        this.isAccManual = res;

      })
    this.subscriptions.push(subs)
  }
  loadShipViaList() {
    const subs = this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA')
      .subscribe((res) => {
        this.shipViaList = res;
        if (!this.appTransactionsForViewDto.shipViaId && this.shipViaList.length == 1) {
          this.shipViaValue = this.shipViaList[0];
          this.appTransactionsForViewDto.shipViaId = this.shipViaValue?.value;
          this.appTransactionsForViewDto.shipViaCode = this.shipViaValue?.code;
        } else if (this.appTransactionsForViewDto.shipViaId) {
          this.shipViaValue = this.shipViaList.filter(item => item.value == this.appTransactionsForViewDto.shipViaId);
        }
      })
    this.subscriptions.push(subs)
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
    this.validateShippingTab();

  }

  // reloadAddresscomponentShipFrom(data) {
  //   this.shipFromData = data;
  //   if (this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {
  //     this.contactIdShipFrom = this.shipFromData?.compId;
  //     const addressComponents = this.addressComponentRefs?.toArray();
  //     addressComponents?.find(c => c.shipInfoIndex === 1)?.getAddressList(this.shipFromData?.compssin, this.shipFromData?.branchSsin);
  //   }
  //   this.validateShippingTab();

  // }
  // reloadAddresscomponentShipTo(data) {
    
  //   this.shipToData = data;
   

  //   if (this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {
  //     this.contactIdShipTo = this.shipToData?.compId;

  //     const addressComponents = this.addressComponentRefs?.toArray();
  //     addressComponents?.find(c => c.shipInfoIndex === 2)?.getAddressList(this.shipToData?.compssin, this.shipToData?.branchSsin);
  //   }
  //   this.validateShippingTab();

  // }

  reloadAddresscomponentShipFrom(data) {
  this.shipFromData = data;

  if (this.currentTab === TransactionCartoccordionTabs.ShippingInfo && data?.compId) {
    this.contactIdShipFrom = data.compId;

    const addressComponents = this.addressComponentRefs?.toArray();
    addressComponents
      ?.find(c => c.shipInfoIndex === 1)
      ?.getAddressList(data?.compssin, data?.branchSsin);
  }

  this.validateShippingTab();
}

reloadAddresscomponentShipTo(data) {
  this.shipToData = data;

  if (this.currentTab === TransactionCartoccordionTabs.ShippingInfo && data?.compId) {
    this.contactIdShipTo = data.compId;

    const addressComponents = this.addressComponentRefs?.toArray();
    addressComponents
      ?.find(c => c.shipInfoIndex === 2)
      ?.getAddressList(data?.compssin, data?.branchSsin);
  }

  this.validateShippingTab();
}

  validateShippingTab() {

    if (this.enableSAveShipFrom && this.enableSAveShipTo && this.appTransactionsForViewDto.shipViaId) {
      this.shippingTabValid = true;
      this.shippingInfOValid.emit(TransactionCartoccordionTabs.ShippingInfo);
    } else {
      this.shippingTabValid = false;
    }
  }
  addressUpdated($event) {
    if ($event) {
      $event == true ? this.validateShippingTab() : ''
    }
  }

  saveDates() {
    let enteredDate = moment(this.appTransactionsForViewDto?.enteredDate).toDate();
    let startDate = moment(this.appTransactionsForViewDto?.startDate).toDate();
    let availableDate = moment(this.appTransactionsForViewDto?.availableDate).toDate();
    let completeDate = moment(this.appTransactionsForViewDto?.completeDate).toDate();

    this.appTransactionsForViewDto.enteredDate = moment.utc(moment(enteredDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.startDate = moment.utc(moment(startDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.availableDate = moment.utc(moment(availableDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.completeDate = moment.utc(moment(completeDate).format('YYYY-MM-DD'));
  }
  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();

  }
}
