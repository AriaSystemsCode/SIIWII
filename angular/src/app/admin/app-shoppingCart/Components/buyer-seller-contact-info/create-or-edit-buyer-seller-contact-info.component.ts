import {
  Component,
  Injector,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import {
  AccountBranchDto,
  AppAddressDto,
  AppTransactionServiceProxy,
  GetAppTransactionsForViewDto
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';
import * as moment from 'moment';

@Component({
  selector: 'app-create-or-edit-buyer-seller-contact-info',
  templateUrl: './create-or-edit-buyer-seller-contact-info.component.html',
  styleUrls: ['./create-or-edit-buyer-seller-contact-info.component.scss']
})
export class CreateOrEditBuyerSellerContactInfoComponent extends AppComponentBase
  implements OnInit, OnChanges {
  @Input() activeTab: number;
  @Input() currentTab: number;
  @Input() appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input() createOrEditbuyerContactInfo = true;
  @Input() createOrEditSellerContactInfo = true;
  @Input() showSaveBtn = false;
  @Input() canChange = true;

  @Output() buyer_seller_contactInfoValid = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output() ontabChange = new EventEmitter<ShoppingCartoccordionTabs>();
  @Output() generatOrderReport = new EventEmitter<boolean>();
  @Output() refreshShoppingCart = new EventEmitter<boolean>();
  @Output() TempComp = new EventEmitter<boolean>();

  oldappTransactionsForViewDto: GetAppTransactionsForViewDto;
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  visible = false;
  cancelBtn = false;
  saveBtn = false;
  SuccessMsg = false;
  isContactsValid = false;

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
  }

  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }

  onshowBuyer_sellerEditMode($event) {
    if ($event) {
      this.activeTab === this.shoppingCartoccordionTabs.BuyerContactInfo
        ? this.createOrEditbuyerContactInfo = true
        : this.createOrEditSellerContactInfo = true;
    }
  }

  save() {
    this.activeTab === this.shoppingCartoccordionTabs.BuyerContactInfo
      ? this.createOrEditbuyerContactInfo = false
      : this.createOrEditSellerContactInfo = false;

    this.synchronizeContactDetailsAndSave();
  }

  cancel() {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.activeTab === this.shoppingCartoccordionTabs.BuyerContactInfo
      ? this.createOrEditbuyerContactInfo = false
      : this.createOrEditSellerContactInfo = false;

    this.showSaveBtn = false;
  }

  synchronizeContactDetailsAndSave() {
    const buyerContact = this.appTransactionsForViewDto.appTransactionContacts.find(
      contact => contact.contactRole === 1
    );
    if (!buyerContact) return;

    const rolesToUpdate = [6, 4];
    this.appTransactionsForViewDto.buyerCompanyName = buyerContact.companyName;
    this.appTransactionsForViewDto.buyerCompanySSIN = buyerContact.companySSIN;
    this.appTransactionsForViewDto.buyerContactName = buyerContact.contactName;
    this.appTransactionsForViewDto.buyerBranchName = buyerContact.branchName;
    this.appTransactionsForViewDto.buyerBranchSSIN = buyerContact.branchSSIN;
    this.appTransactionsForViewDto.buyerContactEMailAddress = buyerContact.contactEmail;
    this.appTransactionsForViewDto.buyerContactPhoneNumber = buyerContact.contactPhoneNumber;
    this.appTransactionsForViewDto.contactPhoneTypeId = buyerContact.contactPhoneTypeId;
    this.appTransactionsForViewDto.contactPhoneTypeName = buyerContact.contactPhoneTypeName;
    this.appTransactionsForViewDto.selectedPhoneType = buyerContact.selectedPhoneType;

    rolesToUpdate.forEach(role => {
      const roleContact = this.appTransactionsForViewDto.appTransactionContacts.find(
        contact => contact.contactRole === role
      );
      if (roleContact) {
        roleContact.companyName = buyerContact.companyName;
        roleContact.companySSIN = buyerContact.companySSIN;
        roleContact.branchName = buyerContact.branchName;
        roleContact.branchSSIN = buyerContact.branchSSIN;
        roleContact.contactName = buyerContact.contactName;
        roleContact.contactEmail = buyerContact.contactEmail;
        roleContact.contactPhoneNumber = buyerContact.contactPhoneNumber;
        roleContact.contactPhoneTypeId = buyerContact.contactPhoneTypeId;
        roleContact.contactPhoneTypeName = buyerContact.contactPhoneTypeName;
        roleContact.selectedPhoneType = buyerContact.selectedPhoneType;
      }
    });

    const companySSIN = buyerContact.companySSIN;
    this._AppTransactionServiceProxy.getCompanyDefaultAddresses(companySSIN, null).subscribe(defaults => {
      if (!defaults?.length) return;

      this._AppTransactionServiceProxy.getCompanyAddresses(companySSIN, null).subscribe(allAddresses => {
        const shipToDefault = defaults.find(a => a.addressType === 'Shipping');
        const billingDefault = defaults.find(a => a.addressType === 'Billing');

        const shipToContact = this.appTransactionsForViewDto.appTransactionContacts.find(c => c.contactRole === 6);
        const apContact = this.appTransactionsForViewDto.appTransactionContacts.find(c => c.contactRole === 4);

        if (shipToDefault && shipToContact) {
          const fullShipToAddress = allAddresses.find(a => a.id === shipToDefault.addressId);
          if (fullShipToAddress) {
            this.applyAddressToContact(shipToContact, fullShipToAddress);
          }
        }

        if (billingDefault && apContact) {
          const fullBillingAddress = allAddresses.find(a => a.id === billingDefault.addressId);
          if (fullBillingAddress) {
            this.applyAddressToContact(apContact, fullBillingAddress);
          }
        }

        this.createOrEditTransaction();
      });
    });
  }

  private applyAddressToContact(contact, address): void {
    if (!contact || !address) return;
  
    contact.contactAddressCode = address.code;
    contact.contactAddressName = address.name;
    contact.contactAddressCity = address.city;
    contact.contactAddressCountryCode = address.countryCode;
    contact.contactAddressCountryId = address.countryId;
    contact.contactAddressLine1 = address.addressLine1;
    contact.contactAddressLine2 = address.addressLine2;
    contact.contactAddressPostalCode = address.postalCode;
    contact.contactAddressState = address.state;
  
    // Ensure full initialization via DTO
    const dto = new AppAddressDto();
    dto.init({
      ...address,
      contactEmail: contact.contactEmail,
      contactPhone: contact.contactPhoneNumber,
    });
  
    contact.contactAddressDetail = dto;
    contact.contactAddressId = address.id; // ensure correct link
  }
  

  createOrEditTransaction() {
    this.showMainSpinner()

   let enteredDate = moment(this.appTransactionsForViewDto?.enteredDate).toDate();
    let startDate = moment(this.appTransactionsForViewDto?.startDate).toDate();
    let availableDate = moment(this.appTransactionsForViewDto?.availableDate).toDate();
    let completeDate = moment(this.appTransactionsForViewDto?.completeDate).toDate();

    this.appTransactionsForViewDto.enteredDate = moment.utc(moment(enteredDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.startDate = moment.utc(moment(startDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.availableDate = moment.utc(moment(availableDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.completeDate = moment.utc(moment(completeDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone; 
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() =>  {this.hideMainSpinner();

        // this.generatOrderReport.emit(true); 
      //  this.SuccessMsg = true
        }))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          this.refreshShoppingCart.emit(true);
          if (!this.showSaveBtn) {
            this.ontabChange.emit(this.activeTab);
          } else {
            this.showSaveBtn = false;
          }
        }
      });
  }

  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  validateTempBuyer($event) {
    this.TempComp.emit($event);
  }

  isContactFormValid(value: boolean) {
    if (this.activeTab === this.shoppingCartoccordionTabs.BuyerContactInfo || this.activeTab === this.shoppingCartoccordionTabs.SellerContactInfo) {
      this.isContactsValid = value;
      if (value) {
        const tab = this.activeTab === this.shoppingCartoccordionTabs.BuyerContactInfo
          ? ShoppingCartoccordionTabs.BuyerContactInfo
          : ShoppingCartoccordionTabs.SellerContactInfo;

        this.buyer_seller_contactInfoValid.emit(tab);
      }
    }
  }
}
