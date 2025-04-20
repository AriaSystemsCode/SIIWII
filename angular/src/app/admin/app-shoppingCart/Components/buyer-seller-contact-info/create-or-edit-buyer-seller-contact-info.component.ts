import { Component, Injector, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { AccountBranchDto, AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
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
  @Output() refreshShoppingCart = new EventEmitter<boolean>();
  @Output() TempComp = new EventEmitter<boolean>();

  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  oldappTransactionsForViewDto: GetAppTransactionsForViewDto;
  isContactsValid = false;

  cancelBtn: boolean = false;
  saveBtn: boolean = false;


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));

  }

  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }

  onshowBuyer_sellerEditMode($event) {
    if ($event)
      this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = true : this.createOrEditSellerContactInfo = true;
  }
  save() {
    this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = false : this.createOrEditSellerContactInfo = false;
    this.createOrEditTransaction();
  }
  cancel() {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = false : this.createOrEditSellerContactInfo = false;
    this.showSaveBtn = false;
  }
  synchronizeContactDetails() {
    // Find the Buyer contact
    const buyerContact = this.appTransactionsForViewDto.appTransactionContacts.find(
      contact => contact.contactRole === 1
    );
    this.appTransactionsForViewDto.buyerCompanyName = buyerContact.companyName
    this.appTransactionsForViewDto.buyerCompanySSIN = buyerContact.companySSIN
    this.appTransactionsForViewDto.buyerContactName = buyerContact.contactName
    this.appTransactionsForViewDto.buyerBranchName = buyerContact.branchName
    this.appTransactionsForViewDto.buyerBranchSSIN = buyerContact.branchSSIN
    this.appTransactionsForViewDto.buyerContactEMailAddress = buyerContact.contactEmail
    this.appTransactionsForViewDto.buyerContactPhoneNumber = buyerContact.contactPhoneNumber
    this.appTransactionsForViewDto.contactPhoneTypeId = buyerContact.contactPhoneTypeId 
    this.appTransactionsForViewDto.contactPhoneTypeName = buyerContact.contactPhoneTypeName 
    this.appTransactionsForViewDto.selectedPhoneType =  buyerContact.selectedPhoneType 


    if (buyerContact && this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo) {

      // List of roles to synchronize with Buyer contact
      const rolesToUpdate = [6, 4]; // 6: ShipToContact, 4: ShipFromContact

      rolesToUpdate.forEach(role => {
        // Find the contact for the specified role
        const roleContact = this.appTransactionsForViewDto.appTransactionContacts.find(
          contact => contact.contactRole === role
        );


        if (roleContact) {
          // Synchronize relevant properties
          roleContact.companyName = buyerContact.companyName;
          roleContact.companySSIN = buyerContact.companySSIN;
          roleContact.branchName = buyerContact.branchName;
          roleContact.branchSSIN = buyerContact.branchSSIN
          roleContact.contactName = buyerContact.contactName;
          roleContact.contactEmail = buyerContact.contactEmail;
          roleContact.contactPhoneNumber = buyerContact.contactPhoneNumber;
          roleContact.contactPhoneTypeId = buyerContact.contactPhoneTypeId;
          roleContact.contactPhoneTypeName = buyerContact.contactPhoneTypeName;
          roleContact.selectedPhoneType = buyerContact.selectedPhoneType;
        }
      });

    }
  }
  createOrEditTransaction() {
    this.synchronizeContactDetails();
    this.showMainSpinner()
    this.applyNeededPropertiesBeforeSaving()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => {
        this.hideMainSpinner();


      }))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          this.refreshShoppingCart.emit(true)
          if (!this.showSaveBtn)
            this.ontabChange.emit(this.activeTab);
          else
            this.showSaveBtn = false;

        }
      });
  }

  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;

  }

  validateTempBuyer($event) {

    this.TempComp.emit($event);



  }

  isContactFormValid(value) {
    if (this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo || this.activeTab == this.shoppingCartoccordionTabs.SellerContactInfo) {

      this.isContactsValid = value;
      if (value) {

        this.isContactsValid = true;
        if (this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo)
          this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.BuyerContactInfo);

        if (this.activeTab == this.shoppingCartoccordionTabs.SellerContactInfo)
          this.buyer_seller_contactInfoValid.emit(ShoppingCartoccordionTabs.SellerContactInfo);
      }
    }

  }


  applyNeededPropertiesBeforeSaving(){

    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.appTransactionsForViewDto.appTransactionContacts[1].companyCode = this.appTransactionsForViewDto?.appTransactionContacts[1].selectedCompany.code
    this.appTransactionsForViewDto.appTransactionContacts[1].contactCode = this.appTransactionsForViewDto?.appTransactionContacts[1].selectedContact.code
    this.appTransactionsForViewDto.appTransactionContacts[1].branchCode = this.appTransactionsForViewDto?.appTransactionContacts[1].selectedBranch.code
  }




}
