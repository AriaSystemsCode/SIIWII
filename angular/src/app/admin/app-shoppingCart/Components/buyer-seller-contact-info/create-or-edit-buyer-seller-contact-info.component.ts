import { Component, Injector, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';

@Component({
  selector: 'app-create-or-edit-buyer-seller-contact-info',
  templateUrl: './create-or-edit-buyer-seller-contact-info.component.html',
  styleUrls: ['./create-or-edit-buyer-seller-contact-info.component.scss']
})
export class CreateOrEditBuyerSellerContactInfoComponent extends AppComponentBase
  implements OnInit, OnChanges {
  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("buyer_seller_contactInfoValid") buyer_seller_contactInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  companies: any[];
  searchTimeout: any;
  selectedPhoneType;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()

  @Input("createOrEditbuyerContactInfo") createOrEditbuyerContactInfo: boolean = true;
  @Input("createOrEditSellerContactInfo") createOrEditSellerContactInfo: boolean = true;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  oldappTransactionsForViewDto;
  @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("refreshShoppingCart") refreshShoppingCart: EventEmitter<boolean> = new EventEmitter<boolean>()

  @Input("canChange")  canChange:boolean=true;
  visible: boolean = false;
  cancelBtn: boolean = false;
  saveBtn: boolean = false;
  SuccessMsg: boolean = false;
  TempComp :boolean = false
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {
    console.log(  this.TempComp,'  this.TempCompiniiiiit')

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
    this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ? this.createOrEditbuyerContactInfo = false : this.createOrEditSellerContactInfo = false;
    this.showSaveBtn = false;
  }
  synchronizeContactDetails() {
    // Find the Buyer contact
    const buyerContact = this.appTransactionsForViewDto.appTransactionContacts.find(
        contact => contact.contactRole === 1
    );

    // Log the Buyer contact
    console.log("Buyer Contact before sync:", buyerContact);

    if (buyerContact) {
        // List of roles to synchronize with Buyer contact
        const rolesToUpdate = [6, 4]; // 6: ShipToContact, 4: ShipFromContact

        rolesToUpdate.forEach(role => {
            // Find the contact for the specified role
            const roleContact = this.appTransactionsForViewDto.appTransactionContacts.find(
                contact => contact.contactRole === role
            );

            // Log the role contact before updating
            console.log(`Role Contact before sync (Role: ${role}):`, roleContact);

            if (roleContact) {
                // Synchronize relevant properties
                roleContact.companyName = buyerContact.companyName;
                roleContact.companySSIN = buyerContact.companySSIN;
                roleContact.branchName = buyerContact.branchName;
                roleContact.branchSSIN = buyerContact.branchSSIN
                // roleContact.contactSSIN = buyerContact.contactSSIN;                
                roleContact.contactName = buyerContact.contactName;
                roleContact.contactEmail = buyerContact.contactEmail;
                roleContact.contactPhoneNumber = buyerContact.contactPhoneNumber;
                roleContact.contactPhoneTypeId = buyerContact.contactPhoneTypeId;
                roleContact.contactPhoneTypeName = buyerContact.contactPhoneTypeName;
                roleContact.contactAddressCity = buyerContact.contactAddressCity;
                roleContact.contactAddressCode = buyerContact.contactAddressCode;
                roleContact.contactAddressCountryCode = buyerContact.contactAddressCountryCode;
                roleContact.contactAddressCountryId = buyerContact.contactAddressCountryId;
                // roleContact.contactAddressDetail = { ...buyerContact.contactAddressDetail };
                roleContact.contactAddressLine1 = buyerContact.contactAddressLine1;
                roleContact.contactAddressLine2 = buyerContact.contactAddressLine2;
                roleContact.contactAddressName = buyerContact.contactAddressName;
                roleContact.contactAddressPostalCode = buyerContact.contactAddressPostalCode;
                roleContact.contactAddressState = buyerContact.contactAddressState;

                // Log the updated role contact after synchronization
                console.log(`Role Contact after sync (Role: ${role}):`, roleContact);
            } else {
                console.warn(`No contact found for role: ${role}`);
            }
        });
    } else {
        console.warn("No Buyer contact found to sync with.");
    }
}
  createOrEditTransaction() {
    // this.synchronizeContactDetails();
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() =>  {this.hideMainSpinner();
        // this.generatOrderReport.emit(true); 
         this.SuccessMsg = true}))
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

  isTempComp($event) {

    this.TempComp = $event;
   

   
  }

  isContactsValid: boolean = false;
  isContactFormValid(value) {
    if(this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo ||this.activeTab==this.shoppingCartoccordionTabs.SellerContactInfo)
    {

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





}
