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
  AfterViewInit,
} from '@angular/core';
import {
  ShoppingCartoccordionTabs,
} from '../../shopping-cart-view-component/ShoppingCartoccordionTabs';
import {
  AppEntitiesServiceProxy,
  AppTransactionServiceProxy,
  GetAppTransactionsForViewDto,
  ContactRoleEnum,
  AppTransactionContactDto,
  AccountsServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { AddressComponent } from '../../address/address.component';
import * as moment from 'moment';

@Component({
  selector: 'app-create-or-edit-billing-info',
  templateUrl: './create-or-edit-billing-info.component.html',
  styleUrls: ['./create-or-edit-billing-info.component.scss'],
})
export class CreateOrEditBillingInfoComponent
  extends AppComponentBase
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() activeTab: number;
  @Input() currentTab: number;
  @Input() appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output() BillingInfoValid = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output() refreshShoppingCart = new EventEmitter<boolean>();
  @Output() ontabChange = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output() generatOrderReport = new EventEmitter<boolean>();

  @Input() showSaveBtn = false;
  @Input() createOrEditBillingInfo = true;
  @Input() canChange = true;

  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;

  @ViewChildren(AddressComponent) AddressComponentChild: AddressComponent;

  isContactsValid = true;
  enableSAveApcontact = false;
  enableSAveArcontact = false;
  oldappTransactionsForViewDto: any;
  payTermsListList: any[] = [];

  apContactSelectedAdd: any;
  arContactSelectedAdd: any;
  contactIdApContact: string;
  contactIdARContact: string;

  apContactdata: any;
  arContactdata: any;

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    private _AccountsServiceProxy: AccountsServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.currentTab === ShoppingCartoccordionTabs.BillingInfo) {
      this.GetContactDefaults();
      this.storeOldDto();
      this.setInitialSelectedAddresses();
    }
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.currentTab === ShoppingCartoccordionTabs.BillingInfo &&
      this.appTransactionsForViewDto
    ) {
      this.storeOldDto();
      this.setInitialSelectedAddresses();
      this.loadpayTermsListListist();
    }
  }

  storeOldDto(): void {
    this.oldappTransactionsForViewDto = JSON.parse(
      JSON.stringify(this.appTransactionsForViewDto)
    );
  }

  setInitialSelectedAddresses(): void {
    const apContact = this.getContact(ContactRoleEnum.APContact);
    const arContact = this.getContact(ContactRoleEnum.ARContact);

    if (apContact?.companySSIN && apContact.contactAddressDetail?.addressLine1) {
      this.apContactSelectedAdd = apContact.contactAddressDetail;
    }
    if (arContact?.companySSIN && arContact.contactAddressDetail?.addressLine1) {
      this.arContactSelectedAdd = arContact.contactAddressDetail;
    }
  }

  getContact(role: ContactRoleEnum): AppTransactionContactDto {
    return this.appTransactionsForViewDto?.appTransactionContacts?.find(
      (x) => x.contactRole === role
    );
  }

  updateTabInfo(addObj: any, contactRole: ContactRoleEnum): void {
    const contactIndex = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(
      (x) => x.contactRole === contactRole
    );

    const dto = new AppTransactionContactDto();
    dto.contactRole = contactRole;
    dto.contactAddressCode = addObj.code;
    dto.contactAddressId = addObj.id;
    dto.contactAddressTypyId = addObj.typeId;
    dto.contactAddressLine1 = addObj?.selectedAddressObj?.addressLine1;
    dto.contactAddressLine2 = addObj?.selectedAddressObj?.addressLine2;
    dto.contactAddressName = addObj?.selectedAddressObj?.name;
    dto.contactAddressPostalCode = addObj?.selectedAddressObj?.postalCode;
    dto.contactAddressState = addObj?.selectedAddressObj?.state;
    dto.contactAddressDetail = addObj?.selectedAddressObj;

    if (contactIndex === -1) {
      this.appTransactionsForViewDto.appTransactionContacts.push(dto);
    } else {
      Object.assign(
        this.appTransactionsForViewDto.appTransactionContacts[contactIndex],
        dto
      );
    }

    if (contactRole === ContactRoleEnum.APContact) {
      this.apContactSelectedAdd = addObj.selectedAddressObj;
    } else {
      this.arContactSelectedAdd = addObj.selectedAddressObj;
    }

    this.validateContacts();
  }

  validateContacts(): void {
    const apContact = this.getContact(ContactRoleEnum.APContact);
    const arContact = this.getContact(ContactRoleEnum.ARContact);

    this.enableSAveApcontact = !!(
      apContact?.contactAddressDetail?.addressLine1 || apContact?.contactAddressId
    );
    this.enableSAveArcontact = !!(
      arContact?.contactAddressDetail?.addressLine1 || arContact?.contactAddressId
    );

    this.isContactsValid =
      this.enableSAveApcontact &&
      this.enableSAveArcontact &&
      !!this.appTransactionsForViewDto.paymentTermsId;

    if (this.isContactsValid) {
      this.BillingInfoValid.emit(ShoppingCartoccordionTabs.BillingInfo);
    }
  }

  isContactFormValid(value: boolean, sectionIndex: number): void {
    this.isContactsValid = value;
    if (value) this.validateContacts();
    else sectionIndex === 1 ? (this.enableSAveApcontact = false) : (this.enableSAveArcontact = false);
  }

  loadpayTermsListListist(): void {
    this._appEntitiesServiceProxy
      .getAllEntitiesByTypeCode('PAYMENT-TERMS')
      .subscribe((res) => {
        this.payTermsListList = res;
        if (!this.appTransactionsForViewDto.paymentTermsId && res.length === 1) {
          this.appTransactionsForViewDto.paymentTermsId = res[0]?.value;
          this.appTransactionsForViewDto.paymentTermsCode = res[0]?.code;
        }
      });
  }

  onchangePayment($event: any): void {
    const index = this.payTermsListList.findIndex((x) => x.value === $event?.value);
    if (index >= 0) {
      this.appTransactionsForViewDto.paymentTermsId = this.payTermsListList[index].value;
      this.appTransactionsForViewDto.paymentTermsCode = this.payTermsListList[index].code;
    }
    this.validateBillingTab()
  }

  reloadAddresscomponentAPContact(data: any): void {
    this.apContactdata = data;
    this.contactIdApContact = data?.compId;
    this.AddressComponentChild?.['first']?.getAddressList(data?.compssin);
  }

  reloadAddresscomponentARContact(data: any): void {
    this.arContactdata = data;
    this.contactIdARContact = data?.compId;
    const component =
      this.AddressComponentChild?.['second'] || this.AddressComponentChild?.['last'];
    component?.getAddressList(data?.compssin);
  }

  createOrEditTransaction(): void {
    this.showMainSpinner();

    const formatDate = (date) => moment.utc(date.toLocaleString());

    this.appTransactionsForViewDto.enteredDate = formatDate(
      this.appTransactionsForViewDto.enteredDate
    );
    this.appTransactionsForViewDto.startDate = formatDate(
      this.appTransactionsForViewDto.startDate
    );
    this.appTransactionsForViewDto.availableDate = formatDate(
      this.appTransactionsForViewDto.availableDate
    );
    this.appTransactionsForViewDto.completeDate = formatDate(
      this.appTransactionsForViewDto.completeDate
    );

    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this._AppTransactionServiceProxy
      .createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
          this.refreshShoppingCart.emit(true);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.storeOldDto();
          this.showSaveBtn
            ? (this.showSaveBtn = false)
            : this.ontabChange.emit(ShoppingCartoccordionTabs.BillingInfo);
        }
      });
  }

  updateApContact(addObj: any): void {
    this.updateTabInfo(addObj, ContactRoleEnum.APContact);
    if(addObj){
      this.enableSAveApcontact = true
      this.validateBillingTab()
    }
  }

  updateArContact(addObj: any): void {
    this.updateTabInfo(addObj, ContactRoleEnum.ARContact);
    if(addObj){
      this.enableSAveArcontact = true
      this.validateBillingTab()
    }
  }

  onshowSaveBtn($event: boolean): void {
    this.showSaveBtn = $event;
  }

  onshowBillingEditMode($event: boolean): void {
    if ($event) this.createOrEditBillingInfo = true;
  }

  onUpdateAppTransactionsForViewDto($event: GetAppTransactionsForViewDto): void {
    this.appTransactionsForViewDto = $event;
    this.validateBillingTab()

  }

  save(): void {
    this.createOrEditBillingInfo = false;
    this.setAddress();
    this.createOrEditTransaction();
  }

  cancel(): void {
    this.appTransactionsForViewDto = JSON.parse(
      JSON.stringify(this.oldappTransactionsForViewDto)
    );
    this.apContactSelectedAdd = null;
    this.arContactSelectedAdd = null;
    this.setAddress();
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditBillingInfo = false;
    this.showSaveBtn = false;
  }

  setAddress(): void {
    const updateAddress = (role: ContactRoleEnum, selectedAddress: any) => {
      const index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(
        (x) => x.contactRole === role
      );
      if (index >= 0) {
        this.appTransactionsForViewDto.appTransactionContacts[index].contactAddressDetail = selectedAddress;
        this.appTransactionsForViewDto.appTransactionContacts[index].contactAddressId = selectedAddress?.id;
      }
    };

    if (!this.apContactSelectedAdd) {
      const apContact = this.getContact(ContactRoleEnum.APContact);
      this.apContactSelectedAdd = apContact?.contactAddressDetail;
    }

    if (!this.arContactSelectedAdd) {
      const arContact = this.getContact(ContactRoleEnum.ARContact);
      this.arContactSelectedAdd = arContact?.contactAddressDetail;
    }

    updateAddress(ContactRoleEnum.APContact, this.apContactSelectedAdd);
    updateAddress(ContactRoleEnum.ARContact, this.arContactSelectedAdd);
    this.validateBillingTab()
  }

  GetContactDefaults(): void {
    this._AccountsServiceProxy.getContactDefaults().subscribe((res) => {
      if (!this.appTransactionsForViewDto.paymentTermsId) {
        this.appTransactionsForViewDto.paymentTermsId = res.paymentTermsId;
        this.appTransactionsForViewDto.paymentTermsCode = res.paymentTermsCode;
      }
    });
  }
  validateBillingTab() {
    if (this.enableSAveArcontact && this.enableSAveApcontact && this.appTransactionsForViewDto.paymentTermsId) { 
      this.isContactsValid = true;
      this.BillingInfoValid.emit(ShoppingCartoccordionTabs.BillingInfo);

    } else {
      this.isContactsValid = false;
    }
    
  }
}
