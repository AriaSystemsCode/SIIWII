import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AccountBranchDto, AccountsServiceProxy, AppEntitiesServiceProxy, AppTransactionContactDto, AppTransactionServiceProxy, ContactRoleEnum, CurrencyInfoDto, GetAccountInformationOutputDto, GetAppTransactionsForViewDto, GetContactInformationDto, LookupLabelDto, PagedResultDtoOfGetAccountInformationOutputDto, PhoneNumberAndtype, SycIdentifierDefinitionsServiceProxy, TransactionType } from "@shared/service-proxies/service-proxies";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { AppComponentBase } from "@shared/common/app-component-base";


@Component({
    selector: "app-contact",
    templateUrl: "./contact.component.html",
    styleUrls: ["./contact.component.scss"],
    changeDetection:ChangeDetectionStrategy.OnPush
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

    allPhoneTypes: any[] = []; 
    filteredPhoneTypes :any
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
    filteredContacts :any[]=[]
    filteredBranches :any[]=[]
    createManualComp: boolean = false;
    branchData:any
    @Input() addressValid: boolean;
    @Output() isTempComp = new EventEmitter<boolean>();
    @Output() validateTempBuyer = new EventEmitter<boolean>();
    conNew:boolean = false
    comNew:boolean = false
    emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

 
    isCompanyExist : boolean = false
    isBranchExist : boolean = false
    isContactExist : boolean = false
    constructor(
        injector: Injector,
  
        private cdr: ChangeDetectorRef,
        private _accountsServiceProxy :AccountsServiceProxy,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
          private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy
    ) {
        super(injector);
        
    }

    async ngOnInit(): Promise<void> {
        this.getAppTransactionContactsIndex(); // Set index first
    
        // Local storage flags
        const value = localStorage.getItem("comNew");
        if (value) this.comNew = Boolean(value);
    
        const value2 = localStorage.getItem("conNew");
        if (value2) this.conNew = Boolean(value2);
    
        // Initial placeholders
        this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactName;
    
        // ✅ Fetch branches first and await
        await this.getBranches();
    
        // ✅ Now safe to reset & set data
        this.resetSelectedData();
        this.setSelectedData();

        // ✅ Final validations
        this.isValidForm();
    
        // ✅ Optional: fetch contacts if needed
        if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {
            this.onClearText();
        }
    
        if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.ssin) {
            this.getContacts();
        }
    }
    

    ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes?.currentTab?.currentValue !== undefined && this.activeTab === changes?.currentTab?.currentValue) ||
            changes?.isCreateOrEdit !== undefined
        ) {
            if (changes?.currentTab?.currentValue) {
                this.activeTab = changes?.currentTab?.currentValue;
            }
    
            if (this.appTransactionsForViewDto && this.activeTab != null && this.activeTab >= 0) {
                this.showMainSpinner();
                this.companeyNames = this.appTransactionsForViewDto?.companeyNames;
    
                this.getAppTransactionContactsIndex();
    
                this.resetSelectedData();
                this.setSelectedData();
    
                this.getAllCompaniesData(); // safe order
            }
    
            if (changes.addressValid && this.addressValid) {
                this.isValidForm();
            }
    
            this.isValidForm();
        }
    }
    

    addName(event) {
        const companyName = event.target.value;
    
        // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = 
        //     new GetAccountInformationOutputDto({
        //         id: 0, // Default or generate a new ID
        //         name: companyName,
        //         accountSSIN: '', // Keep other properties empty or set default values
        //         currencyCode: new CurrencyInfoDto(),
        //         email: '',
        //         phone: '',
        //         phoneTypeId: undefined,
        //         phoneTypeName: ''
        //     });
    
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName = companyName;
    

    }
    


    createManualCompany(event,type?:string){
        // this.isTempComp.emit(event?.target?.checked)
        if(type == 'company'){
            // this.comNew = event?.target?.checked
            localStorage.setItem("comNew",   JSON.stringify(event?.target?.checked));
            this.appTransactionsForViewDto.createManualAccount = event?.target?.checked
            this.saveManualAccount()
            this.saveManualBranch()
        }
        else if (type == 'contact'){
            // this.conNew = event?.target?.checked
            localStorage.setItem("conNew",   JSON.stringify( event?.target?.checked));
          
            this.saveManualContact()

            this.appTransactionsForViewDto.createManualContact = event?.target?.checked

        }
        this.isValidForm();

    }


    async saveManualAccount(){
         let  sequance="";
         let tenancyName = this.appSession.tenancyName;
 
         const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode('TENANTCONTACT',this.appSession.tenantId).toPromise()
         if(getNextEntityCodeRes)
             sequance=getNextEntityCodeRes;
              this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.code= sequance;
              this.cdr.detectChanges(); // ✅ Add this line!
       
    }

    async saveManualBranch(){
        let  sequance="";
        let tenancyName = this.appSession.tenancyName;

        const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode('TENANTBRANCH',this.appSession.tenantId).toPromise()
        if(getNextEntityCodeRes)
            sequance=getNextEntityCodeRes;
             this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.code= sequance;
             this.cdr.detectChanges(); // ✅ Add this line!
      
   }
   async saveManualContact(){
    let  sequance="";
    let tenancyName = this.appSession.tenancyName;

    const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode('MANUALACCOUNTCONTACT',this.appSession.tenantId).toPromise()
    if(getNextEntityCodeRes)
        sequance=getNextEntityCodeRes;
         this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code= sequance;
         this.cdr.detectChanges(); // ✅ Add this line!
  
}
    preventTyping(event: KeyboardEvent): void {
        event.preventDefault();
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
        }
    }
    setSelectedData() {
        if (this.appTransactionContactsIndex >= 0) {
          const contact = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex];
          // Company
          if (!contact.selectedCompany) contact.selectedCompany = new GetAccountInformationOutputDto();
          contact.selectedCompany.name = contact.companyName;
          contact.selectedCompany.accountSSIN = contact.companySSIN;
          contact.selectedCompany.code = contact.companyCode || contact.selectedCompany.code;
      
          // Branch
          if (!contact.selectedBranch) contact.selectedBranch = new AccountBranchDto();
          contact.selectedBranch.name = contact.branchName || "*Main*";
          contact.selectedBranch.ssin = contact.branchSSIN;
          contact.selectedBranch.code = contact.branchCode || contact.selectedBranch.code;
          if (contact.selectedBranch) {
            this.onChangeBranch(contact.selectedBranch); // ✅ Auto trigger
          }
      
          // Contact
          if (!contact.selectedContact) contact.selectedContact = new GetContactInformationDto();
          contact.selectedContact.name = contact.contactName;
          contact.selectedContact.ssin = contact.contactSSIN;
          contact.selectedContact.code = contact.contactCode || contact.selectedContact.code;
      
          // Phone
          if (!contact.selectedPhoneType) contact.selectedPhoneType = new PhoneNumberAndtype();
          contact.selectedPhoneType.phoneTypeName = contact.contactPhoneTypeName;
          contact.selectedPhoneType.phoneTypeId = contact.contactPhoneTypeId;
      
          contact.selectContactPhoneNumber = contact.contactPhoneNumber || contact.selectContactPhoneNumber;
          contact.selectedContactEmail = contact.contactEmail || contact.selectedContactEmail;
        }
      }
      
    
    onChangeCompany(event) {
      
       this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.code = event?.code
       this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyCode = event?.code

        var tempContact:boolean=false;
        
        if (this.tempAccount && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany) {
            tempContact = true;
            this.tempAccount = false;
            this.companyFilterValue = "";
            this.defaultcompanyNamePlaceholder = ''
            this.contactNamePlaceholder = ''
            this.cdr.detectChanges();
        }
        this.getContacts(tempContact);
        // this.getBranches();
        if (this.loadAddressComponent) {
            this.loadAddressComponent.emit({ compssin: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, compId: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.id });
        }
        this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.contactName || '';
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact=new GetContactInformationDto();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.name = ''
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = event?.phone
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = event?.email

        this.isValidForm();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.code =''
       this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code = ''
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




    onchangePhoneType($event) {
        if ($event?.value) {
   
    
            var indx = this.allPhoneTypes?.findIndex(x => x.phoneTypeId == $event?.value?.phoneTypeId);
    
            if ($event?.value?.phoneNumber) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = $event?.value?.phoneNumber;
            } else {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = null;
            }
    
            // ✅ Ensure ContactPhoneTypeName is set correctly
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = 
                $event?.value?.phoneTypeName || "Default Type";
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = 
                $event?.value?.phoneNumber ;
        } else {
           
    
            var indx = this.allPhoneTypes?.findIndex(x => x.phoneTypeId == $event?.phoneTypeId);
    
            if (indx >= 0) {
         
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = $event;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = 
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType?.phoneNumber;
                
                // ✅ Ensure ContactPhoneTypeName is set correctly
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = 
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType?.phoneTypeName || "Default Type";
            }
        }
    
        if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType) {
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
            this.__selectedPhoneTypeValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId;
    
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber =
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber || "";
    
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail =
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail || "";
            
            // ✅ Set default value to avoid empty validation errors
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = "Default Type";
        }
    }
    
     getContacts(tempContact:boolean=false) {
            if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {

                this._AppTransactionServiceProxy.getAccountRelatedContactsList(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, undefined).subscribe(result => {
                    this.allContacts = result;
    
                    if (tempContact &&  this.allContacts?.length>0  || (!tempContact && !this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactSSIN &&  this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactName) ) {
                        this.tempContact=true;
                        this.contactNamePlaceholder = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName + "*";
    
                        this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName;
                        if (this.contactFilterValue){
                            this.handleContactSearch(this.contactFilterValue);

                        }
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
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code = "";

                        }
    
                        else
                            this.onChangeContact(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact);
                    }
                });
                
            }
            else if (!this.appTransactionsForViewDto.buyerCompanySSIN){

                this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName;
                // if (this.contactFilterValue){
                //     this.handleContactSearch(this.contactFilterValue);

                // }
            }
            else {
                this.allContacts = [];
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = null;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = "";
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = "";
            }
            this.isValidForm();
            if( this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyCode){
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.code =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyCode;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactCode;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.code =   this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchCode;
            }
                  
        }
   
    
   
        

        onClearText() {
            if(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {

            
            this._AppTransactionServiceProxy.getAccountRelatedContactsList(
                this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, 
                null
            ).subscribe((res: any) => {
           
                this.filteredContacts = [...res];
               
                  
                
            });
        }
        }
        
        handleContactSearch(event) {
            if (!this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = new GetContactInformationDto();
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.name = event?.query;
            }
            if (this.allContacts && this.allContacts.length > 0) {
                // Filtering logic
            const query = event?.query?.toLowerCase();
              
                this.filteredContacts = this.allContacts.filter(contact =>
                    contact?.name?.toLowerCase().includes(query)
                );
            } else {
            // Fetch contacts only if required and ensure selections are maintained
            this._AppTransactionServiceProxy.getAccountRelatedContactsList(
                this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, 
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName
            ).subscribe((res: any) => {
             
                this.allContacts = [...res];
                this.filteredContacts  = this.allContacts.filter(contact =>
                    contact.name.toLowerCase().includes(event?.query?.toLowerCase())
                );
        
                // Set selected contact based on user input but don't overwrite existing selections
        
                
            });
        }
        this.isValidForm()

        }
        

        getBranches(): Promise<void> {
            return new Promise(async (resolve) => { // ✅ make async
                const contact = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex];
                if (contact?.selectedCompany?.accountSSIN) {
                    // this.showMainSpinner();
        
                    this._AppTransactionServiceProxy.getAccountBranches(contact.selectedCompany.accountSSIN)
                        .subscribe(async (result) => { // ✅ make inner function async
                            this.allBranches = result;
        
                            if (contact.branchName) {
                                contact.selectedBranch = this.allBranches?.find(x => x.name === contact.branchName);
                            } else if (this.allBranches.length === 1) {
                                contact.selectedBranch = this.allBranches[0];
                            }
        
                            if (contact.selectedBranch) {
                                await this.getBranchDetails(contact.selectedBranch.id); // ✅ await here
                            } else {
                                this.hideMainSpinner();
                            }
        
                            if (this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyCode) {
                                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.code =
                                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchCode;
                            }
        
                            resolve();
                        }, () => {
                            this.hideMainSpinner();
                            resolve();
                        });
                } else {
                    this.hideMainSpinner();
                    this.isValidForm();
                    resolve();
                }
            });
        }
        
        

        
    getAllCompaniesData() {
       
        this.companyFilterValue = "";
        this.companyNamePlaceholder = "Select Company Name";
        this.contactNamePlaceholder = "Select Contact Name";
        this.tempAccount = false;
        this.tempContact = false;
        this.contactFilterValue = "";
                //////////////////////////////////////////////////// I36 -Temp Account scenario
                if ((this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN == "0" || !this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN) && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].companyName) {
                    this.tempAccount = true;
                    this.companyNamePlaceholder = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].companyName + "*";
                    // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.name ='Main';

                    this.companyFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].companyName;
                    this.contactNamePlaceholder = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName + "*";
                    // this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName;

                    // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.name =  this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactName

                    if (this.companyFilterValue)
                        this.handleCompanySearch(this.companyFilterValue);
                    // this.onChangeContact(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact);
                }
                else {
                    // this.getBranches();
                    this.tempAccount = false;
                    if(this.appTransactionsForViewDto)
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = this.companeyNames?.find(x => x.accountSSIN == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN)

                    if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {


                        //  if(this.isCreateOrEdit){
                        // this.getContacts();

                        // }
                        
                      
                        if (this.loadAddressComponent) {
                            this.loadAddressComponent.emit({ compssin: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, compId: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.id });
                        }
                    } 

                   
                    // else if(this.appTransactionsForViewDto){
                    //     this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = null;
                    //     this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch=null ;
                    //     this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact=null; 
                    //     this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail="" ;
                    //     this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber="";
                    // }
                }

                this.hideMainSpinner();

                this.isValidForm();
    }
    checkFormValidity(): boolean {
        if (!this.appTransactionsForViewDto?.appTransactionContacts?.[this.appTransactionContactsIndex]) {
            return false;
        }
    
        const contact = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex];
    
        const hasCompany = contact?.selectedCompany?.name?.trim() !== '';
        const hasBranch = contact?.selectedBranch?.name?.trim() !== '';
        const isBuyerTab = this.activeTab === this.shoppingCartoccordionTabs.BuyerContactInfo;
        const isBuyerSSINEmpty = !this.appTransactionsForViewDto?.buyerCompanySSIN;
    
        if (isBuyerTab && isBuyerSSINEmpty) {
            const isCompanyNew = contact.selectedCompany === this.companeyNames?.find(x => x.accountSSIN === contact?.selectedCompany?.accountSSIN)
                ? !this.comNew
                : this.comNew;
    
            const isContactNew = contact.selectedCompany !== this.companeyNames?.find(x => x.accountSSIN !== contact?.selectedCompany?.accountSSIN)
                && !contact?.selectedContact?.name
                ? !this.conNew
                : (contact.selectedCompany === this.companeyNames?.find(x => x.accountSSIN === contact?.selectedCompany?.accountSSIN) && !!contact?.selectedContact?.name)
                    ? !this.conNew
                    : this.conNew;
    
            return hasCompany && hasBranch && isCompanyNew && isContactNew;
        }
    
        return hasCompany && hasBranch;
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
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber  = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneNumber;

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

               
            if((this.appTransactionsForViewDto?.buyerCompanySSIN == '' || this.appTransactionsForViewDto?.buyerCompanySSIN == null) && this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo ) {
                (isValid) =    (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name != '') &&  (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name != '' )  &&  
                     
                    (this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany == this.companeyNames?.find(x => x.accountSSIN == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN) ?  this.comNew == false:
                     this.comNew == true )     &&  ((this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany != this.companeyNames?.find(x => x.accountSSIN != this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN))&&( this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.name == null  )? this.conNew == false : (this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany == this.companeyNames?.find(x => x.accountSSIN == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN) && (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.name != null || this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.name != ''  )) ?  this.conNew == false : this.conNew == true )  
            } else {
              
                // if(this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo) {
                    (isValid) = (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name != '') &&
                    (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name != ''  ) 
              
      
            // }
            // else {

            // }
        }
          

            this.formValidityChanged.emit(isValid);
            if((this.appTransactionsForViewDto?.buyerCompanySSIN == '' || this.appTransactionsForViewDto?.buyerCompanySSIN == null) && this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo && isValid ) {
                this.validateTempBuyer.emit(true)
                this.updateAppTransactionsForViewDto.emit(this.appTransactionsForViewDto);

            }
            else if (isValid ) {
                this.updateAppTransactionsForViewDto.emit(this.appTransactionsForViewDto);
            }

        }
        return isValid;
    }


    
    
    onChangeEmail($event){
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail;
        this.isValidForm()

    }

    onChangePhoneNumber(event){
       
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber;
        this.isValidForm()

    }

    onChangeContact(event:any) {
   
      this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code = event?.code
      this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactCode = event?.code

        if (this.tempContact && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact) {
            this.tempContact = false;
            this.contactFilterValue = "";
        }
    
        // Reset contact details
        // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = "";
        // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
        // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = "";
    
        if (event) {
            // Assign new contact details
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = event;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code =  event?.code ;
            
            this.allPhoneTypes = event?.phoneList ;
    if(stop){
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = event?.phone || "";
    }
         
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = event?.phone || "";
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeId = event?.phoneTypeId || "";
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = event?.phoneTypeName || "";
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = event?.email || "";
    
            // ✅ Ensure selected phone type is assigned correctly
            if (event?.phoneList?.length > 0) {
                let matchedPhoneType = event.phoneList.find(p => p.phoneNumber === event.phone);
    
                if (!matchedPhoneType) {
                    // Try to keep the previous selection if it's still valid
                    const prevPhoneType = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType;
                    
                    if (prevPhoneType && event.phoneList.some(p => p.phoneTypeId === prevPhoneType.phoneTypeId)) {
                        matchedPhoneType = event.phoneList.find(p => p.phoneTypeId === prevPhoneType.phoneTypeId);
                    } 
                }
    
                // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = matchedPhoneType;
            }
        } else {
            // Reset selection if event is null
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = null;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = "";
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = "";
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = null;
        }
    
        // Assign selected phone type value (for UI binding)


        this.onchangePhoneType(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType);
    // }
        this.__selectedPhoneTypeValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId || null;
        this.isValidForm();
    }
    
    




    handleCompanySearch(event) {
        
    
        setTimeout(() => {
            this._AppTransactionServiceProxy
                .getRelatedAccounts(
                    event.query,
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
                    // this.filteredContacts = this.companeyNames.filter(contact =>
                    //     contact.name.toLowerCase().includes(event.query.toLowerCase())
                    // );
                    // // this.sellerCompanies = [...res.items];
                });
        }, 1000);
        this.isValidForm();
    }
    handleBranchSearch(event){
    this._AppTransactionServiceProxy.getAccountBranches(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN).subscribe(result => {
        this.allBranches = result;
     
        this.filteredBranches = this.allBranches.filter(contact =>
            contact.name.toLowerCase().includes(event?.query?.toLowerCase())
        );

    
    });
    this.isValidForm();
}

getBranchDetails(id): Promise<void> {
    return new Promise((resolve) => {
        if (!id || this.branchData?.id === id) {
            resolve(); // Important: resolve early
            return;
        }

        this._accountsServiceProxy.getBranchForEdit(id).subscribe(res => {
            this.branchData = res;
            this.extractPhoneTypes(this.branchData, 'changed');
            resolve(); // ✅ Resolve after async call finishes
        }, () => {
            resolve(); // ✅ Ensure resolve on error as well
        });
    });
}


extractPhoneTypes(response: any,changeBranch?:any) {


        let arr: PhoneNumberAndtype[] = [];

        this.allPhoneTypes = [];

        Object.keys(response).forEach((key) => {
            if (key.startsWith("phone") && key.endsWith("TypeId")) {
                const phoneTypeId = response[key];
                const phoneTypeNameKey = key.replace("TypeId", "TypeName");
                const phoneTypeName = response[phoneTypeNameKey];

                const phoneNumberKey = key.replace("TypeId", "Number");
                const phoneNumber = response[phoneNumberKey];

                if (phoneTypeId && phoneTypeName && phoneNumber) {
                    arr.push({
                        phoneNumber: phoneNumber,
                        phoneTypeId: phoneTypeId,
                        phoneTypeName: phoneTypeName,
                        init: () => {},
                        toJSON: () => ({ phoneNumber, phoneTypeId, phoneTypeName })
                    });
                }
            }
        });

        this.allPhoneTypes = [...arr];
        if(changeBranch =='changed'){
            this.onchangePhoneType(this.allPhoneTypes[0]);

        }
        this.cdr.detectChanges(); 
 
    this.isValidForm();
}



  onBranchChange(event){
    this.getBranchDetails(event?.id)
    this.isValidForm()

  }
    ngDoCheck() {
   
if(this.appTransactionsForViewDto?.buyerCompanySSIN != '' || this.appTransactionsForViewDto?.buyerCompanySSIN != null){


        if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType) {
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeName;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeId = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId;

            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneNumber;
            
            this.__selectedPhoneTypeValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType?.phoneTypeId;
        }
       
    }


    const currentContact = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex];

    if (currentContact?.selectedContact && this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyCode) {
        if (currentContact.selectedContact.name === currentContact.contactName) {
            currentContact.selectedContact.code = currentContact.contactCode;
        } else {
            currentContact.selectedContact.code = '';
        }
    } 

}

    // this.onchangePhoneType(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType);
       
    onChangeBranch(event){
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.code = event?.code
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchCode = event?.code
        this.isValidForm()
    }

isCodoExist(code: string,filed:string) {
    if(filed == 'company') {
        if (!code) return; // Avoid unnecessary API calls if code is empty
        this._AppTransactionServiceProxy.isCodeAlreadyExists(code).subscribe(result => {
            this.isCompanyExist = result; // If true, display the message
        });
    } else if (filed == 'contact'){
        if (!code) return; // Avoid unnecessary API calls if code is empty
        this._AppTransactionServiceProxy.isCodeAlreadyExists(code).subscribe(result => {
            this.isContactExist = result; // If true, display the message
        });
    } else {
        if (!code) return; // Avoid unnecessary API calls if code is empty
        this._AppTransactionServiceProxy.isCodeAlreadyExists(code).subscribe(result => {
            this.isBranchExist = result; // If true, display the message
        });
    }
  
}

setBranchCode(event){
    
    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.code = event?.target?.value.toUpperCase()
    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchCode = event?.target?.value.toUpperCase()
}

setCompanyCode(event){
   
    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.code = event?.target?.value.toUpperCase()
    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyCode = event?.target?.value.toUpperCase()
}


setContactCode(event){
    
    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.code = event?.target?.value.toUpperCase()
    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactCode = event?.target?.value.toUpperCase()
}



}
