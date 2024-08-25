import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AccountBranchDto, AppEntitiesServiceProxy, AppTransactionContactDto, AppTransactionServiceProxy, ContactRoleEnum, GetAccountInformationOutputDto, GetAppTransactionsForViewDto, GetContactInformationDto, LookupLabelDto, PagedResultDtoOfGetAccountInformationOutputDto, PhoneNumberAndtype, TransactionType } from "@shared/service-proxies/service-proxies";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { stringInsert } from "@devexpress/analytics-core/analytics-internal";
import { AppComponentBase } from "@shared/common/app-component-base";
import { EMPTY, switchMap } from "rxjs";

@Component({
    selector: "app-contact",
    templateUrl: "./contact.component.html",
    styleUrls: ["./contact.component.scss"],
})
export class ContactComponent extends AppComponentBase implements OnInit, OnChanges {
    companeyNames: any[];
    @Input() showDepartment: boolean = false;
    __selectedPhoneTypeValue: number;
    @Output() formValidityChanged = new EventEmitter<boolean>();
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("activeTab") activeTab: number;
    @Input("currentTab") currentTab: number;
    @Input("isCreateOrEdit") isCreateOrEdit: boolean;
    @Input("salesRepIndex") salesRepIndex: number = 1;
    @Input("shipInfoIndex") shipInfoIndex: number;
    @Input("billingIndexInfo") billingIndexInfo: number;
    @Output("updateAppTransactionsForViewDto") updateAppTransactionsForViewDto = new EventEmitter<GetAppTransactionsForViewDto>();
    @Output() loadAddressComponent = new EventEmitter<object>();

    appTransactionContactsIndex = -1;

    allPhoneTypes: PhoneNumberAndtype[];

    allContacts: GetContactInformationDto[];
    allBranches;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
    companyFilterValue: string = "";
    tempAccount: boolean = false;
    tempContact: boolean = false;
    companyNamePlaceholder: string = "Select Company Name";
    defaultcompanyNamePlaceholder: string = "Select Company Name";

    contactNamePlaceholder: string = "Select Contact Name";
    defaultcontactNamePlaceholder: string = "Select Contact Name";
    contactFilterValue: string = "";
    
    constructor(
        injector: Injector,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.resetSelectedData(); 
        this.setSelectedData();
     //   this.getAllCompaniesData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.appTransactionsForViewDto && this.activeTab != null && (this.activeTab >=0) ) {
            this.companeyNames=this.appTransactionsForViewDto?.companeyNames;
            this.showMainSpinner();
            //   this.resetSelectedData();
            this.getAppTransactionContactsIndex();
            this.getAllCompaniesData();
        }
    }
    resetSelectedData() {
        if(this.appTransactionContactsIndex>=0){
       if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany)
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = null;
        
          if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch)
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch = null;
        
          if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact)
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = null;
        
          if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType)
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
        
          if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectContactPhoneNumber)
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = null;

          if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContactEmail)
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = null;
        
        this.__selectedPhoneTypeValue = 0;
        this.companyFilterValue = "";
        this.companyNamePlaceholder = "Select Company Name";
        this.contactNamePlaceholder = "Select Contact Name";
        this.tempAccount = false;
        this.tempContact = false;
        this.contactFilterValue = "";
        }
    }

    setSelectedData(){
        if(this.appTransactionContactsIndex>=0){
        if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany){
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany=new GetAccountInformationOutputDto();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.name =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.accountSSIN =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companySSIN;

        }
      
        if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch){
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch=new AccountBranchDto();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.name =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchName;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.ssin =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchSSIN;
        }
      
        if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact){
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact=new GetContactInformationDto();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.name =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.ssin =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactSSIN;
        }

        if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType){
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType=new PhoneNumberAndtype();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType.phoneTypeName =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType.phoneTypeId =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeId;
        }
        if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectContactPhoneNumber)
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber;
    
    
        if(!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContactEmail)
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail;
    
    } 

    }

    onChangeCompany() {
        var tempContact:boolean=false;
        
        if (this.tempAccount && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany) {
            tempContact = true;
            this.tempAccount = false;
            this.companyFilterValue = "";
        }
        this.getContacts(tempContact);
        this.getBranches();
        if (this.loadAddressComponent) {
            this.loadAddressComponent.emit({ compssin: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, compId: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.id });
        }
    }

    getAppTransactionContactsIndex() {
        this.appTransactionContactsIndex = -1;
        let _contactRole: ContactRoleEnum;
        switch (this.activeTab) {
            case ShoppingCartoccordionTabs.orderInfo:
                _contactRole = ContactRoleEnum.Creator;
                break;

            case ShoppingCartoccordionTabs.BuyerContactInfo:
                _contactRole = ContactRoleEnum.Buyer;
                break;


            case ShoppingCartoccordionTabs.SellerContactInfo:
                _contactRole = ContactRoleEnum.Seller;
                break;

            case ShoppingCartoccordionTabs.SalesRepInfo:
                if (this.salesRepIndex == 1)
                    _contactRole = ContactRoleEnum.SalesRep1;
                else
                    _contactRole = ContactRoleEnum.SalesRep2;
                break;

            case ShoppingCartoccordionTabs.ShippingInfo:
                if (this.shipInfoIndex == 1)
                    _contactRole = ContactRoleEnum.ShipFromContact;
                else
                    _contactRole = ContactRoleEnum.ShipToContact;
                break;


            case ShoppingCartoccordionTabs.BillingInfo:
                if (this.billingIndexInfo == 1)
                    _contactRole = ContactRoleEnum.APContact;
                else
                    _contactRole = ContactRoleEnum.ARContact;
                break;
        };
        if (!this.appTransactionsForViewDto?.appTransactionContacts || this.appTransactionsForViewDto?.appTransactionContacts?.length == 0)
            this.appTransactionsForViewDto.appTransactionContacts = [];

        else
            this.appTransactionContactsIndex = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == _contactRole);

        if (this.appTransactionContactsIndex < 0) {
            var appTransactionContactDto: AppTransactionContactDto = new AppTransactionContactDto();
            appTransactionContactDto.contactRole = _contactRole;
            this.appTransactionsForViewDto.appTransactionContacts.push(appTransactionContactDto);
            this.appTransactionContactsIndex = this.appTransactionsForViewDto?.appTransactionContacts.length - 1;
        }
    }


    /*  getPhoneType() {
         this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
             this.allPhoneTypes = result;
 
             // if (!this.selectedPhoneType) {
             this.selectedPhoneType = this.allPhoneTypes?.find(x => x.value == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneTypeId);
             if (!this.selectedPhoneType)
                 this.selectedPhoneType = null;
             this.__selectedPhoneTypeValue = this.selectedPhoneType?.value;
             //  }
 
         });
     } */
    onchangePhoneType($event) {
        if ($event?.value)
            var indx = this.allPhoneTypes?.findIndex(x => x.phoneTypeId == $event?.value?.phoneTypeId);
        else
            var indx = this.allPhoneTypes?.findIndex(x => x.phoneTypeId == $event?.phoneTypeId);
        if (indx >= 0)
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = this.allPhoneTypes[indx];

        if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType)
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
        this.__selectedPhoneTypeValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId

        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = ! this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber  ?  this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber : this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber ;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = ! this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContactEmail  ?  this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail : this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail ;
        
        
        }

        getContacts(tempContact:boolean=false) {
            if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {
                this._AppTransactionServiceProxy.getAccountRelatedContactsList(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, undefined).subscribe(result => {
                    this.allContacts = result;
    
                    if ((tempContact &&  this.allContacts?.length>0)  ||  (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactSSIN) ) {
                        this.tempContact=true;
                        this.contactNamePlaceholder = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName + "*";
    
                        this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName;
                        if (this.contactFilterValue)
                            this.handleContactSearch(this.contactFilterValue);
                    }
                    else {
                        this.tempContact=false;
                        if(this.appTransactionsForViewDto)
                        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = this.allContacts?.find(x => x.ssin == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactSSIN);
    
                        if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact){
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = null;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = "";
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = "";

                        }
    
                        else
                            this.onChangeContact(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact);
                    }
                });
            }
    
            else {
                this.allContacts = [];
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = null;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = "";
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = "";
            }
    
        }
    
    handleContactSearch($event) {
        setTimeout(() => {
            this._AppTransactionServiceProxy.getAccountRelatedContactsList(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, $event.filter)
                .subscribe((res: any) => {
                    this.allContacts = [...res];
                });
        }, 1000);
    }
  
    getBranches() {
        if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {
            this.showMainSpinner();
            this._AppTransactionServiceProxy.getAccountBranches(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN).subscribe(result => {
                this.allBranches = result;
                if(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.branchName){
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch = this.allBranches?.find(x => x.name == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.branchName);

                }else if (this.allBranches.length==1){
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch =this.allBranches[0];
                }
                this.hideMainSpinner();

               /* if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch)
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch = null;*/
            });
        }
    }
    getAllCompaniesData() {
       
                //////////////////////////////////////////////////// I36 -Temp Account scenario
                if ((this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN == "0" || !this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN) && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].companyName) {
                    this.tempAccount = true;
                    this.companyNamePlaceholder = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].companyName + "*";

                    this.companyFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].companyName;
                    if (this.companyFilterValue)
                        this.handleCompanySearch(this.companyFilterValue);
                }
                else {
                    this.tempAccount = false;
                    if(this.appTransactionsForViewDto)
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = this.companeyNames?.find(x => x.accountSSIN == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN)

                    if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {
                        this.getBranches();
                        this.getContacts();
                        if (this.loadAddressComponent) {
                            this.loadAddressComponent.emit({ compssin: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, compId: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.id });
                        }
                    }
                    else
                    if(this.appTransactionsForViewDto)
                        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = null;
                }

                this.hideMainSpinner();
    }

    isValidForm(): boolean {
        let isValid = false;
        if (this.appTransactionsForViewDto?.appTransactionContacts && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]) {
            if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companySSIN = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN;
            }
            if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.name;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactSSIN = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.ssin;
            }
            if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeName;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeId = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId;
                this.__selectedPhoneTypeValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId;
            }

            if (this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber)
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber;

                if (this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail)
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail;

                

                if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchName = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchSSIN = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.ssin;
            }


            isValid =
                (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name != '') &&
                (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name != '');
                //(this.showDepartment ? (this.appTransactionsForViewDto?.buyerDepartment != undefined && this.appTransactionsForViewDto?.buyerDepartment != '') : true);

                // (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail != '') &&

            this.formValidityChanged.emit(isValid);
            if (isValid) {
                this.updateAppTransactionsForViewDto.emit(this.appTransactionsForViewDto);
            }

        }
        return isValid;
    }
    
    
    onChangeEmail($event){
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail;

    }

    onChangePhoneNumber($event){
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber;
    }

    onChangeContact($event) {
        if (this.tempContact && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact) {
            this.tempContact = false
            this.contactFilterValue = "";
        }
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = "";
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = "";

        


        if ($event?.value) {
            this.allPhoneTypes = $event.value.phoneList;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = $event?.value;
            // if(!this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber)
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber =  $event?.value?.phone ;
            // if(!this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail)
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail =  $event?.value?.email ;
        }

        else {
            this.allPhoneTypes = $event.phoneList;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = $event;
            // if(!this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber)
            // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber =  $event?.phone ;
            // if(!this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail)
            // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail =  $event?.emaail ;
        } 


        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = this.allPhoneTypes?.find(x => x.phoneTypeId == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneTypeId);

        if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType)
           {
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = ! this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber  ?  this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber : this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber ;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = ! this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail  ?  this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail : this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail ;
        } 
           

        else
            this.onchangePhoneType(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType);

        this.__selectedPhoneTypeValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId;

    }


    handleCompanySearch($event) {
        setTimeout(() => {
            this._AppTransactionServiceProxy
                .getRelatedAccounts(
                    $event.filter,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,false,null
                )
                .subscribe((res: any) => {
                    this.companeyNames = [...res.items];
                    // this.sellerCompanies = [...res.items];
                });
        }, 1000);
    }

    ngDoCheck() {
        this.isValidForm();
    }

}
