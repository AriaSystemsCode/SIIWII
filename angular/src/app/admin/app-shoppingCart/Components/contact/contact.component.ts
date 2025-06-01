import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AccountBranchDto, AccountsServiceProxy, AppEntitiesServiceProxy, AppTransactionContactDto, AppTransactionServiceProxy, ContactRoleEnum, CurrencyInfoDto, GetAccountInformationOutputDto, GetAppTransactionsForViewDto, GetContactInformationDto, LookupLabelDto, PagedResultDtoOfGetAccountInformationOutputDto, PhoneNumberAndtype, TransactionType } from "@shared/service-proxies/service-proxies";
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

 
    constructor(
        injector: Injector,
  
        private cdr: ChangeDetectorRef,
        private _accountsServiceProxy :AccountsServiceProxy,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
        super(injector);
        
    }

    ngOnInit(): void {
        if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN) {
            this.onClearText();
        }
    
        this.resetSelectedData();
        this.setSelectedData();
    
        // ✅ Fetch contacts and phone list if contact exists
        if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.ssin) {
            this.getContacts();
        } else {
            this.getBranches();
        }
    
        const value = localStorage.getItem("comNew");
        if (value) this.comNew = Boolean(value);
    
        const value2 = localStorage.getItem("conNew");
        if (value2) this.conNew = Boolean(value2);
    
        this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex].contactName;
        this.isValidForm()
    }
    

    ngOnChanges(changes: SimpleChanges) {
      
     
       if( (changes?.currentTab?.currentValue !== undefined &&
        this.activeTab ==changes?.currentTab?.currentValue ) || (changes?.isCreateOrEdit !== undefined))
        {
            if(changes?.currentTab?.currentValue)
            this.activeTab =changes?.currentTab?.currentValue;
        if (this.appTransactionsForViewDto && this.activeTab != null && (this.activeTab >=0) ) {
            this.companeyNames=this.appTransactionsForViewDto?.companeyNames;
            this.showMainSpinner();
            //   this.resetSelectedData();
            this.getAppTransactionContactsIndex();
            this.getAllCompaniesData();
           
            // this.setSelectedData();
        this.isValidForm()
         
            

        }
        this.isValidForm()
        if (changes.addressValid && this.addressValid) {
            this.isValidForm(); // Call the validation function when addressValid is updated
          }

    }


  

  
    }

    addName(event) {
        const companyName = event.target.value;
        console.log(companyName, 'event.target.value');
    
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = 
            new GetAccountInformationOutputDto({
                id: 0, // Default or generate a new ID
                name: companyName,
                accountSSIN: '', // Keep other properties empty or set default values
                currencyCode: new CurrencyInfoDto(),
                email: '',
                phone: '',
                phoneTypeId: undefined,
                phoneTypeName: ''
            });
    
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName = companyName;
    

    }
    


    createManualCompany(event,type?:string){
        // this.isTempComp.emit(event?.target?.checked)
        if(type == 'company'){
            // this.comNew = event?.target?.checked
            localStorage.setItem("comNew",   JSON.stringify(event?.target?.checked));
            this.appTransactionsForViewDto.createManualAccount = event?.target?.checked

        }
        else if (type == 'contact'){
            // this.conNew = event?.target?.checked
            localStorage.setItem("conNew",   JSON.stringify( event?.target?.checked));
          

            this.appTransactionsForViewDto.createManualContact = event?.target?.checked

        }
        this.isValidForm();

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
            if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany = new GetAccountInformationOutputDto();
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.name =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany.accountSSIN =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companySSIN;
            }
    
            if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch = new AccountBranchDto();
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.name =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchName || '*Main*';
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedBranch.ssin =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchSSIN;
            }
    
            if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact = new GetContactInformationDto();
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.name =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.ssin =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactSSIN;
            }
    
            if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = new PhoneNumberAndtype();
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType.phoneTypeName =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType.phoneTypeId =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeId;

                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType.phoneNumber =  this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber;
            }
    
            if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectContactPhoneNumber)
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber;
    
            if (!this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContactEmail)
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail =
                    this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail;
    
           
            if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.ssin) {
                this.getContacts(true);  // Fetch the contact's phone list
            }
        }
        this.isValidForm()

    }
    
    onChangeCompany(event) {
       
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
        this.getBranches();
        if (this.loadAddressComponent) {
            this.loadAddressComponent.emit({ compssin: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.accountSSIN, compId: this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.id });
        }
        this.contactFilterValue = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.contactName || '';
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact=new GetContactInformationDto();
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContact.name = ''
          this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName = null
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectContactPhoneNumber = event?.phone
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedContactEmail = event?.email

        this.isValidForm();
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
            console.log($event, '444444 <<<');
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
        

        getBranches() {
            const contact = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex];
            
            if (contact?.selectedCompany?.accountSSIN) {
                this.showMainSpinner();
        
                this._AppTransactionServiceProxy.getAccountBranches(contact.selectedCompany.accountSSIN)
                    .subscribe(result => {
                        this.allBranches = result;
        
                        // Assign the correct branch
                        if (contact.branchName) {
                            contact.selectedBranch = this.allBranches?.find(x => x.name === contact.branchName);
                        } else if (this.allBranches.length === 1) {
                            contact.selectedBranch = this.allBranches[0];
                        }
        
                        //  Ensure `getBranchDetails` is only called when `selectedBranch` exists
                        if (contact.selectedBranch) {
                            this.getBranchDetails(contact.selectedBranch.id)
                        } else {
                            this.hideMainSpinner(); // Hide spinner if no branch is selected
                        }
                    });
            }
            this.hideMainSpinner(); // Hide spinner if no branch is selected
            this.isValidForm()
 

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


            // if(this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany)
               
            if((this.appTransactionsForViewDto?.buyerCompanySSIN == '' || this.appTransactionsForViewDto?.buyerCompanySSIN == null) && this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo ) {
                (isValid) =    (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name != '') &&  (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name != '' )  &&  
                     
                    (this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany == this.companeyNames?.find(x => x.accountSSIN == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN) ?  this.comNew == false:
                     this.comNew == true )     &&  ((this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedCompany != this.companeyNames?.find(x => x.accountSSIN != this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN))&&( this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedContact?.name == null  )? this.conNew == false :  this.conNew == true )  
            } else {
              
                // if(this.activeTab==this.shoppingCartoccordionTabs.BuyerContactInfo) {
                    (isValid) = (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedCompany?.name != '') &&
                    (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedBranch?.name != ''  ) 
              
      
            // }
            // else {

            // }
        }
               
                //(this.showDepartment ? (this.appTransactionsForViewDto?.buyerDepartment != undefined && this.appTransactionsForViewDto?.buyerDepartment != '') : true);

                // (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail != '') &&

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

              this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName = event.name;
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


getBranchDetails(id) {
    if ( !id || this.branchData?.id === id) return; // Prevent redundant calls

    this._accountsServiceProxy.getBranchForEdit(id).subscribe(res => {
        this.branchData = res; 
        console.log(this.branchData, 'Branch Data Received');
        this.extractPhoneTypes(this.branchData,'changed');
    });
         this.isValidForm();
}

extractPhoneTypes(response: any,changeBranch?:any) {
    console.log(response, 'Response in extractPhoneTypes');


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

        //  Assign correct phone type based on selected phone number
        // if (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneNumber) {
        //     const selectedPhone = this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber;
        //     const matchedPhoneType = this.allPhoneTypes.find(p => p.phoneNumber === selectedPhone);

        //     // this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].selectedPhoneType = matchedPhoneType;
        // console.log(matchedPhoneType, 'matchedPhoneType');

        // }
        if(changeBranch =='changed'){
            this.onchangePhoneType(this.allPhoneTypes[0]);

        }
        // this.onchangePhoneType(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType);
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

    // this.onchangePhoneType(this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.selectedPhoneType);
       
    }

}
