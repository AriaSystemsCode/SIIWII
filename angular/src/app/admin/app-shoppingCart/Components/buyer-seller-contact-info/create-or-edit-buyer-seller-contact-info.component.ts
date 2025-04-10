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
  @Output("TempComp") TempComp: EventEmitter<boolean> = new EventEmitter<boolean>()


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
    this.appTransactionsForViewDto.buyerCompanyName= buyerContact.companyName 
    this.appTransactionsForViewDto.buyerCompanySSIN = buyerContact.companySSIN
    this.appTransactionsForViewDto.buyerContactName = buyerContact.contactName 
    this.appTransactionsForViewDto.buyerBranchName =  buyerContact.branchName
    this.appTransactionsForViewDto.buyerBranchSSIN = buyerContact.branchSSIN 
    this.appTransactionsForViewDto.buyerContactEMailAddress = buyerContact.contactEmail 
    this.appTransactionsForViewDto.buyerContactPhoneNumber = buyerContact.contactPhoneNumber 
     this.appTransactionsForViewDto.contactPhoneTypeId = buyerContact.contactPhoneTypeId 
     this.appTransactionsForViewDto.contactPhoneTypeName = buyerContact.contactPhoneTypeName 
     this.appTransactionsForViewDto.selectedPhoneType = buyerContact.selectedPhoneType 
    // this.appTransactionsForViewDto.buyerContactSSIN = buyerContact.contactSSIN 
    // Log the Buyer contact
    console.log("Buyer Contact before sync:", buyerContact);

    if (buyerContact &&  this.activeTab == this.shoppingCartoccordionTabs.BuyerContactInfo ) {

        // List of roles to synchronize with Buyer contact
        const rolesToUpdate = [6, 4]; // 6: ShipToContact, 4: ShipFromContact

        rolesToUpdate.forEach(role => {
            // Find the contact for the specified role
            const roleContact = this.appTransactionsForViewDto.appTransactionContacts.find(
                contact => contact.contactRole === role
            );

            // Log the role contact before updatin

            if (roleContact) {
                // Synchronize relevant properties
                // roleContact.selectedBranch = new AccountBranchDto
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
                // roleContact.contactAddressCity = buyerContact.contactAddressCity;
                // roleContact.contactAddressCode = buyerContact.contactAddressCode;
                // roleContact.contactAddressCountryCode = buyerContact.contactAddressCountryCode;
                // roleContact.contactAddressCountryId = buyerContact.contactAddressCountryId;
                // roleContact.contactAddressDetail = { ...buyerContact.contactAddressDetail };
                // roleContact.contactAddressLine1 = buyerContact.contactAddressLine1;
                // roleContact.contactAddressLine2 = buyerContact.contactAddressLine2;
                // roleContact.contactAddressName = buyerContact.contactAddressName;
                // roleContact.contactAddressPostalCode = buyerContact.contactAddressPostalCode;
                // roleContact.contactAddressState = buyerContact.contactAddressState;

                // Log the updated role contact after synchronization
                console.log(`Role Contact after sync (Role: ${role}):`, roleContact);
            } 
        });

  //             buyerContact.companyName = this.appTransactionsForViewDto.buyerCompanyName
  // buyerContact.companySSIN = this.appTransactionsForViewDto.buyerCompanySSIN
  // buyerContact.contactName = this.appTransactionsForViewDto.buyerContactName
  // buyerContact.branchName = this.appTransactionsForViewDto.buyerBranchName
  // buyerContact.branchSSIN = this.appTransactionsForViewDto.buyerBranchSSIN
  // buyerContact.contactEmail = this.appTransactionsForViewDto.buyerContactEMailAddress
  // buyerContact.contactPhoneNumber = this.appTransactionsForViewDto.buyerContactPhoneNumber
  // buyerContact.contactSSIN = this.appTransactionsForViewDto.buyerContactSSIN
    } 
}
  createOrEditTransaction() {
    this.synchronizeContactDetails();
    this.showMainSpinner()
      let enteredDate = this.appTransactionsForViewDto.enteredDate.toLocaleString();
            let startDate = this.appTransactionsForViewDto.startDate.toLocaleString();
            let availableDate = this.appTransactionsForViewDto.availableDate.toLocaleString();
            let completeDate = this.appTransactionsForViewDto.completeDate.toLocaleString();
        
        
            this.appTransactionsForViewDto.enteredDate = moment.utc(enteredDate);
            this.appTransactionsForViewDto.startDate = moment.utc(startDate);
            this.appTransactionsForViewDto.availableDate = moment.utc(availableDate);
            this.appTransactionsForViewDto.completeDate = moment.utc(completeDate);
    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone; 
    this.appTransactionsForViewDto.appTransactionContacts[1].companyCode = this.appTransactionsForViewDto?.appTransactionContacts[1].selectedCompany.code
    this.appTransactionsForViewDto.appTransactionContacts[1].contactCode = this.appTransactionsForViewDto?.appTransactionContacts[1].selectedContact.code
    this.appTransactionsForViewDto.appTransactionContacts[1].branchCode = this.appTransactionsForViewDto?.appTransactionContacts[1].selectedBranch.code
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() =>  {this.hideMainSpinner();
        console.log(this.appTransactionsForViewDto?.appTransactionContacts[1]?.selectedCompany,'00000')
        console.log(this.appTransactionsForViewDto?.appTransactionContacts[1]?.selectedContact,'11111')
        console.log(this.appTransactionsForViewDto?.appTransactionContacts[1]?.selectedBranch,'22222')
        // this.generatOrderReport.emit(true); 
      //  this.SuccessMsg = true
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
