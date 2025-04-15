import {
  Component,
  Injector,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChildren,
  SimpleChanges,
  OnChanges,
  AfterViewInit
} from '@angular/core';
import * as moment from 'moment';
import {
  AppEntitiesServiceProxy,
  AppTransactionServiceProxy,
  GetAppTransactionsForViewDto,
  ContactRoleEnum,
  AppTransactionContactDto
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { AddressComponent } from '../../Components/address/address.component';
import { ShoppingCartoccordionTabs } from '../../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';

@Component({
  selector: 'app-create-or-add-shipping-information',
  templateUrl: './create-or-add-shipping-information.component.html',
  styleUrls: ['./create-or-add-shipping-information.component.scss']
})
export class CreateOrAddShippingInformationComponent
  extends AppComponentBase
  implements OnInit, OnChanges, AfterViewInit {

  @Input() activeTab: number;
  @Input() currentTab: number;
  @Input() appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input() createOrEditshippingInfO = true;
  @Input() showSaveBtn = false;
  @Input() canChange = true;

  @Output() shippingInfOValid = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output() refreshShoppingCart = new EventEmitter<boolean>();
  @Output() ontabChange = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output() generatOrderReport = new EventEmitter<boolean>();

  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;

  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;

  oldappTransactionsForViewDto: GetAppTransactionsForViewDto;

  shipViaList: any[] = [];
  shipViaValue: any;
  storeVal: any = null;

  shipFromSelectedAdd: any;
  shipToSelectedAdd: any;
  shipFromData: any;
  shipToData: any;

  contactIdShipTo = '';
  contactIdShipFrom = '';

  enableSAveShipFrom = false;
  enableSAveShipTo = false;

  shippingTabValid = false;
  isAccManual = false;
  visible = false;
  cancelBtn = false;
  saveBtn = false;
  SuccessMsg = false;

  constructor(
    injector: Injector,
    private _transactionService: AppTransactionServiceProxy,
    private _entitiesService: AppEntitiesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.checkManualAccount();

    if (this.isShippingTab()) {
      this.cloneDto();
      this.loadInitialAddresses();
      this.storeVal = this.appTransactionsForViewDto?.buyerStore;
    }
  }

  ngAfterViewInit(): void {
    if (this.isShippingTab()) {
      this.loadAddressComponents();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isShippingTab() && this.appTransactionsForViewDto) {
      this.cloneDto();
      this.loadInitialAddresses();
      this.storeVal = this.appTransactionsForViewDto?.buyerStore;
      this.loadShipViaList();
    }
  }

   isShippingTab(): boolean {
    return this.currentTab === ShoppingCartoccordionTabs.ShippingInfo;
  }

   cloneDto(): void {
    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
  }

   loadInitialAddresses(): void {
    const shipFrom = this.getContact(ContactRoleEnum.ShipFromContact);
    const shipTo = this.getContact(ContactRoleEnum.ShipToContact);

    this.shipFromSelectedAdd = shipFrom?.companySSIN && shipFrom?.contactAddressDetail?.addressLine1
      ? shipFrom.contactAddressDetail : null;

    this.shipToSelectedAdd = shipTo?.companySSIN && shipTo?.contactAddressDetail?.addressLine1
      ? shipTo.contactAddressDetail : null;
  }

   loadAddressComponents(): void {
    this.contactIdShipFrom = this.shipFromData?.compId;
    this.AddressComponentChild?.['first']?.getAddressList(this.shipFromData?.compssin);

    this.contactIdShipTo = this.shipToData?.compId;
    const target = this.AddressComponentChild?.['second'] || this.AddressComponentChild?.['last'];
    target?.getAddressList(this.shipToData?.compssin);
  }

   getContact(role: number): AppTransactionContactDto {
    return this.appTransactionsForViewDto?.appTransactionContacts?.find(x => x.contactRole === role);
  }

  updateTabInfo(addObj: any, contactRole: number): void {
    let contact = this.getContact(contactRole);

    if (!contact) {
      contact = new AppTransactionContactDto();
      contact.contactRole = contactRole;
      this.appTransactionsForViewDto?.appTransactionContacts.push(contact);
    }

    Object.assign(contact, {
      contactAddressCode: addObj.code,
      contactAddressId: addObj.id,
      contactAddressTypyId: addObj.typeId,
      contactAddressLine1: addObj?.selectedAddressObj?.addressLine1,
      contactAddressLine2: addObj?.selectedAddressObj?.addressLine2,
      contactAddressName: addObj?.selectedAddressObj?.name,
      contactAddressPostalCode: addObj?.selectedAddressObj?.postalCode,
      contactAddressState: addObj?.selectedAddressObj?.state,
      contactAddressDetail: addObj?.selectedAddressObj
    });

    if (contactRole === ContactRoleEnum.ShipFromContact) {
      this.shipFromSelectedAdd = addObj.selectedAddressObj;
    } else {
      this.shipToSelectedAdd = addObj.selectedAddressObj;
    }

    this.evaluateSaveEnablers();
    this.validateShippingTab();
  }

  cancel(): void {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.shipFromSelectedAdd = null;
    this.shipToSelectedAdd = null;
    this.setAddress();
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditshippingInfO = false;
    this.showSaveBtn = false;
  }

  save(): void {
    this.createOrEditshippingInfO = false;
    this.setAddress();
    this.createOrEditTransaction();
  }

   setAddress(): void {
    this.updateAddressForRole(ContactRoleEnum.ShipFromContact, this.shipFromSelectedAdd);
    this.updateAddressForRole(ContactRoleEnum.ShipToContact, this.shipToSelectedAdd);
    this.validateShippingTab();
  }

   updateAddressForRole(role: number, selectedAddress: any): void {
    const contact = this.getContact(role);

    if (!selectedAddress) {
      if (contact?.companySSIN && contact?.contactAddressDetail?.addressLine1) {
        selectedAddress = contact.contactAddressDetail;
      }
    }

    if (contact) {
      contact.contactAddressId = selectedAddress?.id;
      contact.contactAddressDetail = selectedAddress;
    }
  }

  updateShipFromAddress(addObj: any): void {
    this.updateTabInfo(addObj, ContactRoleEnum.ShipFromContact);
    if (addObj) this.enableSAveShipFrom = true;
  }

  updateShipToAddress(addObj: any): void {
    this.updateTabInfo(addObj, ContactRoleEnum.ShipToContact);
    if (addObj) this.enableSAveShipTo = true;
  }

   createOrEditTransaction(): void {
    this.showMainSpinner();

    const dto = this.appTransactionsForViewDto;
    dto.enteredDate = moment.utc(dto.enteredDate.toLocaleString());
    dto.startDate = moment.utc(dto.startDate.toLocaleString());
    dto.availableDate = moment.utc(dto.availableDate.toLocaleString());
    dto.completeDate = moment.utc(dto.completeDate.toLocaleString());
    dto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this._transactionService.createOrEditTransaction(dto)
      .pipe(finalize(() => {
        this.hideMainSpinner();
        this.refreshShoppingCart.emit(true);
      }))
      .subscribe(res => {
        if (res) {
          this.cloneDto();
          this.showSaveBtn ? this.showSaveBtn = false : this.ontabChange.emit(ShoppingCartoccordionTabs.ShippingInfo);
        }
      });
  }

  isContactFormValid(value: boolean, sectionIndex: number): void {
    this.shippingTabValid = value;

    if (value) {
      const shipFrom = this.getContact(ContactRoleEnum.ShipFromContact);
      const shipTo = this.getContact(ContactRoleEnum.ShipToContact);

      if (sectionIndex === 1) {
        this.enableSAveShipFrom = !!(shipFrom?.contactAddressDetail?.addressLine1 || shipFrom?.contactAddressId);
      } else {
        this.enableSAveShipTo = !!(shipTo?.contactAddressDetail?.addressLine1 || shipTo?.contactAddressId);
      }
    } else {
      if (sectionIndex === 1) this.enableSAveShipFrom = false;
      else this.enableSAveShipTo = false;
    }

    this.validateShippingTab();
  }

   evaluateSaveEnablers(): void {
    const shipFrom = this.getContact(ContactRoleEnum.ShipFromContact);
    const shipTo = this.getContact(ContactRoleEnum.ShipToContact);

    this.enableSAveShipFrom = !!(shipFrom?.contactAddressDetail?.addressLine1 || shipFrom?.contactAddressId);
    this.enableSAveShipTo = !!(shipTo?.contactAddressDetail?.addressLine1 || shipTo?.contactAddressId);
  }

  validateShippingTab(): void {
    const isValid = this.enableSAveShipFrom && this.enableSAveShipTo && this.appTransactionsForViewDto.shipViaId;
    this.shippingTabValid = true;
    if (isValid) {
      this.shippingInfOValid.emit(ShoppingCartoccordionTabs.ShippingInfo);
    }
  }

  selectShipVia(event: any): void {
    const selected = this.shipViaList.find(x => x.value === event?.value);
    if (selected) {
      this.appTransactionsForViewDto.shipViaId = selected.value;
      this.appTransactionsForViewDto.shipViaCode = selected.code;
    }
    this.validateShippingTab();
  }

   checkManualAccount(): void {
    const accSSIN = this.appTransactionsForViewDto?.entityObjectTypeCode === 'SALESORDER'
      ? this.appTransactionsForViewDto.buyerCompanySSIN
      : this.appTransactionsForViewDto?.sellerCompanySSIN;

    this._transactionService.isManualCompany(accSSIN).subscribe(res => {
      this.isAccManual = res;
    });
  }

  loadShipViaList(): void {
    this._entitiesService.getAllEntitiesByTypeCode('SHIPVIA').subscribe(res => {
      this.shipViaList = res;
      if (!this.appTransactionsForViewDto.shipViaId && res.length === 1) {
        this.shipViaValue = res[0];
        this.appTransactionsForViewDto.shipViaId = res[0].value;
        this.appTransactionsForViewDto.shipViaCode = res[0].code;
      } else if (this.appTransactionsForViewDto.shipViaId) {
        this.shipViaValue = res.find(item => item.value === this.appTransactionsForViewDto.shipViaId);
      }
    });
  }

  onshowSaveBtn(event: boolean): void {
    this.showSaveBtn = event;
  }

  onshowShippingEditMode(event: boolean): void {
    if (event) {
      this.createOrEditshippingInfO = true;
    }
  }

  onUpdateAppTransactionsForViewDto(dto: GetAppTransactionsForViewDto): void {
    this.appTransactionsForViewDto = dto;
    this.validateShippingTab();
  }

  reloadAddresscomponentShipFrom(data: any): void {
    this.shipFromData = data;
    this.contactIdShipFrom = data?.compId;
    this.AddressComponentChild?.['first']?.getAddressList(data?.compssin);
    this.validateShippingTab();
  }

  reloadAddresscomponentShipTo(data: any): void {
    this.shipToData = data;
    this.contactIdShipTo = data?.compId;
    const component = this.AddressComponentChild?.['second'] || this.AddressComponentChild?.['last'];
    component?.getAddressList(data?.compssin);
    this.validateShippingTab();
  }

  enterStore(): void {
    this.appTransactionsForViewDto.buyerStore = this.storeVal;
  }

  addressUpdated(event: boolean): void {
    if (event) this.validateShippingTab();
  }
}
