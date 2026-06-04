import {
    Injector,
    Component,
    OnInit,
    OnChanges,
    Output,
    EventEmitter,
    Input,
    ViewChild,
} from "@angular/core";
import { SelectItem } from "primeng/api";
import {
    FormBuilder,
    FormGroup,
    Validators,
} from "@angular/forms";
import { finalize } from "rxjs";
import { Dropdown } from "primeng/dropdown";
import {

    AppTransactionServiceProxy,
    ICreateOrEditAppTransactionsDto,
    TransactionType,
    ValidateTransaction,
    AppMarketplaceItemsServiceProxy,
    LookupLabelDto,
    CurrencyInfoDto,
    AppEntitiesServiceProxy,
    CreateOrEditAccountInfoDto,

} from "@shared/service-proxies/service-proxies";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { AppComponentBase } from "@shared/common/app-component-base";
import { UserClickService } from "@shared/utils/user-click.service";
import { AppConsts } from "@shared/AppConsts";
import { ProductCatalogueReportParams } from "@app/main/app-items/appitems-catalogue-report/models/product-Catalogue-Report-Params";
import * as moment from "moment";
import { Calendar } from "primeng/calendar";
import { TransactionInformationComponent } from "../../app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component";

@Component({
    templateUrl: "./createTransactionModal.component.html",
    selector: "createTransactionModal",
    styleUrls: ["./createTransactionModal.component.scss"],
    providers: [AppMarketplaceItemsServiceProxy]
})
export class CreateTransactionModal extends AppComponentBase implements OnInit, OnChanges {
    @ViewChild('calendar1') calendar1: Calendar;
    @ViewChild('calendar2') calendar2: Calendar;
    @ViewChild('calendar3') calendar3: Calendar;
    @ViewChild('calendar4') calendar4: Calendar;
    @ViewChild('autoComplete') autoComplete: any;
    @ViewChild("shoppingCartModal", { static: true }) shoppingCartModal: TransactionInformationComponent;
    @ViewChild("Role") Role: Dropdown;

    @Input() orderNo: string;
    @Input() fullName: string;
    @Input() display: boolean = false;
    @Input() formType: string;
    @Input() modalheaderName: string;
    @Input() roles: any[];

    @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

    orderForm: FormGroup;
    submitted: boolean = false;
    buyerCompanies: any[];
    buyerBranches: any[];
    sellerBranches: any[];
    sellerCompanies: any[];
    buyerContacts: any[];
    sellerContacts: any[];
    searchTimeout: any;
    buyerComapnyId: number = 0;
    sellerCompanyId: number = 0;
    sellerCompanySSIN: string = ""
    buyerCompanySSIN: string = ""
    sellerContactId: number = 0;
    buyerContactId: number = 0;
    buyerContactSSIN!: string | undefined;
    sellerContactSSIN!: string | undefined;
    isCompantIdExist: boolean = false;
    isSellerCompanyIdExist: boolean = false;
    role: string;
    isRoleExist: boolean = false;
    btnLoader: boolean = false;
    currencyCode: any = null;
    minDate: Date;
    roleDdval: any;

    addNew = true;
    invalidBuyerPhoneNumber = "";
    invalidSellerPhoneNumber = "";
    invalidBuyerContactEMailAddress = "";
    invalidSellerContactEMailAddress = "";
    sellerPhoneLabel: string = "Phone Number";
    buyerPhoneLabel: string = "Phone Number";
    showAdd: boolean = false

    body: any;
    setCurrentUserActiveTransaction: boolean = false;
    invokeAction = '/DXXRDV';
    reportUrl = "";
    printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams()
    minCompleteDate: Date;
    minStartDate: Date;
    minSEnteredDate: Date;
    sellerCurrencyCode;
    searchTerm: string = undefined;
    searchTermSeller: string = undefined;
    filteredBuyerContacts: any[];
    selectedBuyerContact: any | string = '';
    filteredSellerContacts: any[];
    selectedSellerContact: any | string = '';
    today: Date;
    startDateMsg: boolean = false
    comtDateMsg: boolean = false
    avalabletDateMsg: boolean = false
    showAddTextBtn: boolean = false
    showAddSellBtn: boolean = false
    showAddBuyBtn: boolean = false
    areSame: boolean = false;

    allCurrencies: LookupLabelDto[];
    allCurrenciesDto: CurrencyInfoDto[];
    allPriceLevel: SelectItem[] = [];
    accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto()

    isBuyerTempAccount: boolean = false;
    isSellerTempAccount: boolean = false;
    isBuyer: boolean = false;
    isSeller: boolean = false;

    primeDateFormat = 'mm/dd/yy'; // default
    languageSettingName  =AppConsts.languageSettingName;
    currentLang:string
    isArabic:boolean = true
    showSellerRelationshipIcon:boolean=false;
    showBuyerRelationshipIcon:boolean=false;
    buyerRelationshipName:string="";
    sellerRelationshipName:string="";
    buyerCompanyRelationId;
    sellerCompanyRelationId;
    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private userClickService: UserClickService,
        private router: Router,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,

    ) {
        super(injector);
        this.initForm()
        this.orderForm.reset();
        this.getUserDefultRole();
        this.changeStartDate(this.orderForm.get('startDate'));
        this.tenantRoleService.loadRoles();
    }

    initForm() {
        this.orderForm = this.fb.group({
            enteredDate: [new Date()],
            startDate: [Date, [Validators.required]],
            completeDate: ["", [Validators.required]],
            availableDate: ["", [Validators.required]],
            sellerCompanyName: ["", [Validators.required]],
            sellerContactName: [""],
            sellerContactEMailAddress: ["", [Validators.email]],
            sellerContactPhoneNumber: ["", [Validators.pattern(/^(\+?[1-9]\d{0,2}(\s|-)?(\(?\d{1,4}\)?(\s|-)?)+|\d{1,20}|0\d{9,14})$/)]],
            buyerCompanyName: ["", [Validators.required]],
            buyerContactName: [''],
            buyerContactEMailAddress: ["", [Validators.email]],
            buyerContactPhoneNumber: ["", [Validators.pattern(/^(\+?[1-9]\d{0,2}(\s|-)?(\(?\d{1,4}\)?(\s|-)?)+|\d{1,20}|0\d{9,14})$/)]],
            buyerCompanyBranch: ["", [Validators.required]],
            sellerCompanyBranch: ["", [Validators.required]],
            istemp: [false],
            buyerBranchName: [""],
            reference: [""],
            priceLevel: ['MSRP'],
            currencyId: [this.appSession.tenant.currencyInfoDto.value],
            buyerCompanySSIN: [''],

        });
        this.orderForm.reset();
        this.buyerCompanySSIN = ''
        this.orderForm.controls['startDate'].setValue(new Date());
        this.orderForm.controls['enteredDate'].setValue(new Date());
        this.buyerCompanySSIN = ''
        this.sellerCompanyRelationId="";
        this.buyerCompanyRelationId="";
    }

    updateControlState() {
        const control = this.orderForm.get('buyerContactName');
        if (this.buyerComapnyId === 0) {
            control.disable();
        } else {
            control.enable();
        }
    }
    openCalendar(calendar: Calendar) {
        calendar.inputfieldViewChild.nativeElement.click();
    }


    ngOnChanges() {
        this.getCurrencies();
        this.getCurrenciesDto();
        this.allPriceLevel = this.getPriceLevel();
        this.updateControlState()
        this.initForm()
        this.changeStartDate(this.orderForm.get('startDate'));
        this.getUserDefultRole();
    }

    getUserDefultRole() {
        this._AppTransactionServiceProxy.getUserDefaultRole(this.formType?.toUpperCase()).subscribe(result => {
            if (this.formType?.toUpperCase() == "SO") {
                if (result?.toLowerCase()?.includes('seller') && this.tenantRoleService.soRolesOptions
  .map(x => x.name?.toLowerCase())
  .some(x => x.includes('seller'))) {
                    this.roleDdval = this.tenantRoleService.soRolesOptions.filter(role => role.code == 1)[0];

                } else {
                    this.roleDdval = this.tenantRoleService.soRolesOptions.filter(role => role.code !== 1)[0];
                }
            } else if (this.formType?.toUpperCase() == "PO") {
                if (result?.toLowerCase()?.includes('buyer')&&  this.tenantRoleService.poRolesOptions
  .map(x => x.name?.toLowerCase())
  .some(x => x.includes('buyer'))) {
                    this.roleDdval = this.tenantRoleService.poRolesOptions.filter(role => role.code == 2)[0];

                } else {
                    this.roleDdval = this.tenantRoleService.poRolesOptions.filter(role => role.code !== 2)[0];
                }
            }
            this.handleRoleChange({ value: this.roleDdval });
        })
    }
    getBranches(accountSSIN, objectToChangeName) {
        this._AppTransactionServiceProxy.getAccountBranches(accountSSIN).subscribe(result => {
            if (objectToChangeName == 'buyer') {
                this.buyerBranches = result;
                if (result.length == 1) {
                    this.orderForm.controls['buyerCompanyBranch'].setValue(result[0]);

                }
            } else {
                this.sellerBranches = result;
                if (result.length == 1) {
                    this.orderForm.controls['sellerCompanyBranch'].setValue(result[0]);

                }
            }
        });
    }



    selectTempBuyer() {
        this.isBuyerTempAccount = !this.isBuyerTempAccount;
        this.isCompantIdExist = this.isBuyerTempAccount;
        if (this.isBuyerTempAccount) {
            this.buyerCompanySSIN = ''
            this.areSame = false
            this.orderForm.controls["buyerCompanyBranch"].clearValidators();
            this.orderForm.controls["buyerCompanyBranch"].reset();
            this.orderForm.controls["buyerCompanyName"].reset();
            this.orderForm.controls["buyerCompanySSIN"].setValue('');
            this.orderForm.controls["buyerContactName"].reset();
            this.orderForm.controls["buyerContactEMailAddress"].reset();
            this.orderForm.controls["buyerContactPhoneNumber"].reset();
            this.orderForm.controls["buyerCompanySSIN"].setValue('');
        }

        else
            this.orderForm.controls["buyerCompanyBranch"].setValidators([Validators.required]);
        this.orderForm.controls["buyerCompanyBranch"].updateValueAndValidity();

    }
    selectTempSeller() {
        this.isSellerTempAccount = !this.isSellerTempAccount;

        if (this.isSellerTempAccount) {
            this.orderForm.controls["sellerCompanyBranch"].clearValidators();
            this.orderForm.controls["sellerCompanyBranch"].reset();
            this.orderForm.controls["sellerCompanyName"].reset();
        }

        else
            this.orderForm.controls["sellerCompanyBranch"].setValidators([Validators.required]);


        this.orderForm.controls["buyerCompanyBranch"].updateValueAndValidity();

    }
    handleRoleChange(data: any) {
        this.role = data?.value?.name;
        this.handleSellerCompanySearch('')
        this.handleBuyerCompanySearch('')
        this.isRoleExist = false;
        if (data?.value?.code === 1) {
            // i'm a Seller
            this.isSeller = true;
            this.isBuyer = false;
            this.buyerContacts = [];
            this._AppTransactionServiceProxy
                .getCurrentTenantAccountProfileInformation()
                .subscribe((res: any) => {
                    this.sellerCompanyId = res.id;
                    this.sellerCompanySSIN = res.accountSSIN;
                    this.isSellerCompanyIdExist = true;
                    this.isCompantIdExist = false;
                    this.handleSellerNameSearch("");
                    // add seller values
                    // this.selectedSellerContact = { name: `${this.appSession?.user?.name}  ${this.appSession?.user?.surname}` }
                    

                    this.orderForm.get("sellerCompanyName").setValue(res.name);
                    this.orderForm.get('sellerContactPhoneNumber').setValue(res.phone)
                    this.orderForm.get('sellerContactEMailAddress').setValue(res.email)
                    this.preselectSellerContact();
                    // remove buyer values
                    this.orderForm.get("buyerContactName").reset();
                    this.orderForm.get("buyerCompanyName").reset();
                    this.orderForm.get("buyerContactEMailAddress").reset();
                    this.orderForm.get("buyerContactPhoneNumber").reset();
                    this.orderForm.get("sellerCompanyBranch").reset();
                    this.orderForm.get("buyerCompanyBranch").reset();
                    this.sellerBranches = [];
                    this.getBranches(this.sellerCompanySSIN, 'seller')
                });
        } else if (data?.value?.code === 2) {
            // i'm a buyer
            this.isSeller = false;
            this.isBuyer = true;
            this.sellerContacts = [];
            this._AppTransactionServiceProxy
                .getCurrentTenantAccountProfileInformation()
                .subscribe((res: any) => {
                    this.isCompantIdExist = true;
                    this.isSellerCompanyIdExist = false;
                    // add buyer values
                    this.buyerComapnyId = res.id;
                    this.buyerCompanySSIN = res.accountSSIN;
                    this.handleBuyerNameSearch("");
                    this.selectedBuyerContact = { name: `${this.appSession?.user?.name}  ${this.appSession?.user?.surname}` }
                    this.orderForm.get("buyerCompanyName").setValue(res.name);
                    this.orderForm.get('buyerContactPhoneNumber').setValue(res.phone)
                    this.orderForm.get('buyerContactEMailAddress').setValue(res.email)

                    // remove seller values
                    this.orderForm.get("sellerContactName").reset();
                    this.orderForm.get("sellerCompanyName").reset();
                    this.orderForm.get("sellerContactEMailAddress").reset();
                    this.orderForm.get("sellerContactPhoneNumber").reset();
                    this.orderForm.get("sellerCompanyBranch").reset();
                    this.orderForm.get("buyerCompanyBranch").reset();
                    this.buyerBranches = [];
                    this.getBranches(this.buyerCompanySSIN, 'buyer')

                });
        } else if (data?.value?.name == "I'm an Independent buying office.") {
            // remove buyer values
            this.isSeller = false;
            this.isBuyer = false;
            this.isCompantIdExist = false;
            this.isSellerCompanyIdExist = false;
            this.orderForm.get("buyerContactName").reset();
            this.orderForm.get("buyerCompanyName").reset();
            this.orderForm.get("buyerContactEMailAddress").reset();
            this.orderForm.get("buyerContactPhoneNumber").reset();
            this.orderForm.get("sellerCompanyBranch").reset();
            this.orderForm.get("buyerCompanyBranch").reset();
        } else {
            // i'm a sales rep
            this.isSeller = false;
            this.isBuyer = false;
            this.isCompantIdExist = false;
            this.isSellerCompanyIdExist = false;
            // remove seller values
            this.orderForm.get("sellerContactName").reset();
            this.orderForm.get("sellerCompanyName").reset();
            this.orderForm.get("sellerContactEMailAddress").reset();
            this.orderForm.get("sellerContactPhoneNumber").reset();
            this.orderForm.get("sellerCompanyBranch").reset();
            this.orderForm.get("buyerCompanyBranch").reset();

        }


    }

    handleBuyerCompanySearch(event: any) {
        const filter = typeof event === 'string' ? event : (event?.filter ?? '');
      
        this._AppTransactionServiceProxy
          .getRelatedAccounts(
            filter,
            undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined,undefined,
            true,
            this.role == "I'm an Independent buying office." ? 'SO' : this.formType?.toUpperCase() , this.role
          )
          .subscribe((res: any) => {
            this.buyerCompanies = [...(res.items || [])];
            if(this.role == "I'm an Independent buying office."){
   if (this.buyerCompanies.length === 1) {
              const only = this.buyerCompanies[0];
      
              this.buyerComapnyId = only.id;
              this.buyerCompanySSIN = only.accountSSIN;
              this.currencyCode = only.currencyCode;

              this.orderForm.get("buyerCompanyName")?.setValue(only, { emitEvent: false });

              this.orderForm.get("buyerContactPhoneNumber")?.setValue(only.phone);
              this.orderForm.get("buyerContactEMailAddress")?.setValue(only.email);

              this.handleBuyerCompanyChange({ value: only });
            }
            }
         
          });
      }
      
    handleSellerCompanySearch(event: any) {
        const filter = typeof event === 'string' ? event : (event?.filter ?? '');
      
        this._AppTransactionServiceProxy
          .getRelatedAccounts(
            filter,
            undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined,undefined,
            true,
            this.role == "I'm an Independent Sales Rep." ? 'PO' : this.formType?.toUpperCase() ,this.role
          )
          .subscribe((res: any) => {
            this.sellerCompanies = [...(res.items || [])];
            if( this.role == "I'm an Independent Sales Rep." ) {
  if (this.sellerCompanies.length === 1) {
              const only = this.sellerCompanies[0];
      
              this.sellerCompanyId = only.id;
              this.sellerCompanySSIN = only.accountSSIN;
              this.sellerCurrencyCode = only.currencyCode;

              this.orderForm.get("sellerCompanyName")?.setValue(only, { emitEvent: false });
      
              this.orderForm.get("sellerContactPhoneNumber")?.setValue(only.phone);
              this.orderForm.get("sellerContactEMailAddress")?.setValue(only.email);

              this.handleSellerCompanyChange({ value: only });
            }
            }
   
          
          });
      }
      

    handleBuyerCompanyChange(event: any) {
        this.searchTerm = ''
        this.selectedBuyerContact = ''
        this.buyerComapnyId = event.value.id;
        this.buyerCompanySSIN = event.value.accountSSIN;
        this.buyerCompanyRelationId=event.value.relationId;
        this.currencyCode = event.value.currencyCode;
        this.areSame = false
        this.orderForm.get('buyerContactPhoneNumber').setValue(event.value.phone)
        this.orderForm.get('buyerContactEMailAddress').setValue(event.value.email)
        this.handleBuyerNameSearch("");
        this.buyerBranches = [];
        this.getBranches(this.buyerCompanySSIN, 'buyer')

          this.showBuyerRelationshipIcon = true;
       this.getBuyerRelationshipName ();
    }

    handleSellerCompanyChange(event: any) {
        this.selectedSellerContact = ''

        this.sellerCompanyId = event.value.id;
        this.sellerCompanySSIN = event.value.accountSSIN;
        this.sellerCompanyRelationId=event.value.relationId;

        this.sellerCurrencyCode = event.value.currencyCode;
        this.areSame = false
        this.orderForm.get('sellerContactPhoneNumber').setValue(event.value.phone)
        this.orderForm.get('sellerContactEMailAddress').setValue(event.value.email)
        this.handleSellerNameSearch("");
        this.sellerBranches = [];
        this.getBranches(this.sellerCompanySSIN, 'seller')

         this.showSellerRelationshipIcon = true;
        this.getSellerRelationshipName();
    }

    getBuyerRelationshipName() {
        const lowerRole = this.role?.toLowerCase();

        if (lowerRole.includes('seller')) {
            this.buyerRelationshipName = this.l('SellingToBuyerAsSeller');

        } else if (lowerRole.includes('sales rep')) {
            this.buyerRelationshipName = this.l('ConnectedToBuyerAsSalesRep');

        } else if (lowerRole.includes('buying office')) {
            this.buyerRelationshipName = this.l('BuyingOnBehalfBuyer');

        } else {
            this.buyerRelationshipName = '';
        }
    }

    
    getSellerRelationshipName() {
        const lowerRole = this.role?.toLowerCase();

        if (lowerRole.includes('sales rep')) {
            this.sellerRelationshipName = this.l('SellingOnBehalfSeller');

        } else if (lowerRole.includes('buyer')) {
            this.sellerRelationshipName = this.l('BuyingFromSellerAsBuyer');

        } else if (lowerRole.includes('buying office')) {
            this.sellerRelationshipName = this.l('ConnectedToSellerAsBuyingOffice');

        } else {
            this.sellerRelationshipName = '';
        }
    }



    loadInitialContacts() {
        this._AppTransactionServiceProxy
            .getAccountRelatedContacts(this.buyerComapnyId, '')
            .subscribe((res: any) => {
                this.buyerContacts = res;
                this.filteredBuyerContacts = res; // Show all contacts initially
            });
    }

    loadInitialSellerContacts() {
        this._AppTransactionServiceProxy
            .getAccountRelatedContacts(this.sellerCompanyId, '')
            .subscribe((res: any) => {
                this.sellerContacts = res;
                this.filteredSellerContacts = res; // Show all contacts initially
            });
    }


    handleBuyerNameSearch(event: any) {
        if (this.buyerContacts && this.buyerContacts.length > 0) {
            // Filtering logic
            const query = event?.query?.toLowerCase();
            this.filteredBuyerContacts = this.buyerContacts.filter(contact =>
                contact?.name?.toLowerCase().includes(query)
            );
        } else {

            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this._AppTransactionServiceProxy
                    .getAccountRelatedContacts(this.buyerComapnyId, event?.query)
                    .subscribe((res: any) => {
                        this.buyerContacts = [...res];
                        // Apply filtering after fetching data
                        this.filteredBuyerContacts = this.buyerContacts.filter(contact =>
                            contact?.name?.toLowerCase().includes(event?.query?.toLowerCase())
                        );
                    });
            }, 300);
        }
    }



    handleSellerNameSearch(event: any) {

        if (this.sellerContacts && this.sellerContacts.length > 0) {
            // Filtering logic
            const query = event?.query?.toLowerCase();
            this.filteredSellerContacts = this.sellerContacts.filter(contact =>
                contact?.name?.toLowerCase().includes(query)
            );
        } else {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {

                this._AppTransactionServiceProxy
                    .getAccountRelatedContacts(this.sellerCompanyId, event?.query)
                    .subscribe((res: any) => {


                        this.sellerContacts = [...res];
                        // Apply filtering after fetching data
                        this.filteredSellerContacts = this.sellerContacts.filter(contact =>
                            contact?.name?.toLowerCase().includes(event?.query?.toLowerCase())
                        );

                    });
            }, 500);
        }
    }


    handleBuyerNameChange(event: any) {


        this.buyerContactId = event?.id;
        this.buyerContactSSIN = event?.ssin;
        if (event?.email != null) {
            this.orderForm
                .get("buyerContactEMailAddress")
                .setValue(event?.email);
        }
        if (event?.phone != null) {
            this.orderForm
                .get("buyerContactPhoneNumber")
                .setValue(event?.phone);
        }


        this.invalidBuyerPhoneNumber = "";
        this.buyerPhoneLabel = event?.phoneTypeName ? event?.phoneTypeName + " Number" : this.buyerPhoneLabel;



    }
    private preselectSellerContact(): void {
        this._AppTransactionServiceProxy
          .getAccountRelatedContacts(this.sellerCompanyId, '')
          .subscribe((res: any[]) => {
            this.sellerContacts = res || [];
            this.filteredSellerContacts = this.sellerContacts;
      
            const userEmail = (this.appSession?.user?.emailAddress || '').toLowerCase();
      
            const pick =
              this.sellerContacts.find(c => (c.email || '').toLowerCase() === userEmail) ||
              this.sellerContacts.find(c => c.isDefault) ||
              this.sellerContacts[0];
      
            if (pick) {
              // set the control value so the UI shows the selected contact
              this.orderForm.get('sellerContactName')?.setValue(pick);
              this.selectedSellerContact = pick;
      
              // reuse your existing logic to fill ssin/id/phone/email
              this.handleSellerNameChange(pick);
            }
          });
      }
      
    handleSellerNameChange(event: any) {

        this.sellerContactId = event?.id;
        this.sellerContactSSIN = event?.ssin;
        if (event?.email != null) {
            this.orderForm
                .get("sellerContactEMailAddress")
                .setValue(event?.email);
        }
        if (event?.phone != null) {
            this.orderForm
                .get("sellerContactPhoneNumber")
                .setValue(event?.phone);
        }


        this.sellerPhoneLabel = event?.phoneTypeName ? event?.phoneTypeName + " Number" : this.sellerPhoneLabel;

    }

    async getStarted() {

        if (this.isBuyerTempAccount) {
            this.orderForm.patchValue({
                buyerContactName: this.orderForm.controls['buyerContactName']?.value,
                buyerCompanyName: this.orderForm.controls['buyerCompanyName']?.value,
            });
            localStorage.setItem('tempPriceLevel', this.orderForm.controls['priceLevel']?.value)

        }


        if (this.isSellerTempAccount) {
            this.orderForm.patchValue({
                sellerContactName: this.orderForm.controls['sellerContactName']?.value,
                sellerCompanyName: this.orderForm.controls['sellerCompanyName']?.value,
            });
        }

        if ((this.sellerCompanyId !== this.buyerComapnyId)) {
            this.areSame = false;
            this.submitted = true;
            this.invalidBuyerPhoneNumber = "";
            this.invalidBuyerContactEMailAddress = "";
            this.invalidSellerContactEMailAddress = "";

            if (
                this.orderForm.get("buyerContactPhoneNumber")?.value && this.orderForm.get("buyerContactPhoneNumber")?.value?.length < 5
            )
                this.invalidBuyerPhoneNumber = this.l('BuyerPhoneNumberTooShort');

            if (
                this.orderForm.get("buyerContactPhoneNumber")?.value && this.orderForm.get("buyerContactPhoneNumber")?.value?.length >
                20
            )
                this.invalidBuyerPhoneNumber = this.l('BuyerPhoneNumberTooLong');

            this.invalidSellerPhoneNumber = "";
            if (
                this.orderForm.get("sellerContactPhoneNumber")?.value && this.orderForm.get("sellerContactPhoneNumber")?.value?.length < 5
            )
                this.invalidSellerPhoneNumber =  this.l('SellerPhoneNumberTooShort');

            if (
                this.orderForm.get("sellerContactPhoneNumber")?.value && this.orderForm.get("sellerContactPhoneNumber")?.value?.length >
                20
            )
                this.invalidSellerPhoneNumber = this.l('SellerPhoneNumberTooLong');

            if (
                this.orderForm.get("buyerContactEMailAddress")?.value && this.orderForm.get("buyerContactEMailAddress")?.value?.length < 5
            )
                this.invalidBuyerContactEMailAddress = this.l('EmailAddressTooShort');

            if (
                this.orderForm.get("buyerContactEMailAddress")?.value && this.orderForm.get("buyerContactEMailAddress")?.value?.length > 100
            )
                this.invalidBuyerContactEMailAddress = this.l('EmailAddressTooLong');

            if (
                this.orderForm.get("sellerContactEMailAddress")?.value && this.orderForm.get("sellerContactEMailAddress")?.value?.length < 5
            )
                this.invalidSellerContactEMailAddress = this.l('EmailAddressTooShort');

            if (
                this.orderForm.get("sellerContactEMailAddress")?.value && this.orderForm.get("sellerContactEMailAddress")?.value?.length > 100
            )
                this.invalidSellerContactEMailAddress =  this.l('EmailAddressTooLong');


            if (this.invalidSellerPhoneNumber || this.invalidBuyerPhoneNumber || this.invalidBuyerContactEMailAddress || this.invalidSellerContactEMailAddress)
                return;
            if (this.orderForm.invalid) {
                Object.keys(this.orderForm.controls).forEach(key => {
                    const control = this.orderForm.get(key);

                });
                return;
            } else {
                if (this.role === "") {
                    this.isRoleExist = true;
                    this.btnLoader = false;
                } else {
                    let formValue = this.orderForm
                        .value as ICreateOrEditAppTransactionsDto;
                    this.body = {

                        sellerContactName: this.isSellerTempAccount
                            ? this.orderForm.value?.sellerContactName
                            : this.orderForm.value?.sellerContactName?.name &&
                                this.orderForm.value?.sellerContactName !== null
                                ? this.orderForm.value?.sellerContactName?.name
                                : this.orderForm.controls['sellerContactName']?.value ? this.orderForm.controls['sellerContactName']?.value : null,

                        buyerContactName: this.isBuyerTempAccount
                            ? this.orderForm.controls['buyerContactName']?.value
                            : this.orderForm.value?.buyerContactName?.name &&
                                this.orderForm.value?.buyerContactName !== null
                                ? this.orderForm.value?.buyerContactName?.name
                                : this.orderForm.controls['buyerContactName']?.value ? this.orderForm.controls['buyerContactName']?.value : null,
                        sellerContactId:
                            this.sellerContactId === 0
                                ? null
                                : this.sellerContactId,
                        buyerContactId:
                            this.buyerContactId === 0
                                ? null
                                : this.buyerContactId,
                        sellerContactEmailAddress:
                            formValue?.sellerContactEMailAddress,
                        buyerContactEmailAddress:
                            formValue?.buyerContactEMailAddress,
                        buyerContactPhoneNumber:
                            formValue?.buyerContactPhoneNumber,
                        sellerContactPhoneNumber:
                            formValue?.sellerContactPhoneNumber,
                        buyerCompanyName: this.isCompantIdExist
                            ? formValue?.buyerCompanyName
                            : this.orderForm.value?.buyerCompanyName?.name &&
                                this.orderForm.value?.buyerCompanyName?.name !==
                                null
                                ? this.orderForm.value?.buyerCompanyName?.name
                                : null,
                        sellerCompanyName: this.isSellerCompanyIdExist
                            ? this.orderForm.value?.sellerCompanyName
                            : this.orderForm.value?.sellerCompanyName?.name &&
                                this.orderForm.value?.sellerCompanyName?.name !==
                                null
                                ? this.orderForm.value?.sellerCompanyName?.name
                                : null, // company name condition if dropdown or input
                        enteredByUserRole: this.role,
                        code: this.orderNo,
                        transactionType: this.formType === "SO" ? 0 : 1,
                        sellerContactSSIN: this.sellerContactSSIN,
                        buyerContactSSIN: this.buyerContactSSIN,
                        sellerCompanySSIN: this.sellerCompanySSIN,
                        buyerCompanySSIN: this.buyerCompanySSIN,
                        buyerBranchSSIN: this.orderForm.controls['buyerCompanyBranch']?.value?.ssin,
                        buyerBranchName: this.isBuyerTempAccount ? this.orderForm.controls['buyerBranchName']?.setValue('Main') : this.orderForm.controls['buyerCompanyBranch']?.value?.name,
                        sellerBranchSSIN: this.orderForm.controls['sellerCompanyBranch']?.value?.ssin,
                        sellerBranchName: this.orderForm.controls['sellerCompanyBranch']?.value?.name,
                        completeDate: moment(this.orderForm.controls['completeDate']?.value).format('YYYY-MM-DD'),
                        enteredDate: moment(this.orderForm.controls['enteredDate']?.value).format('YYYY-MM-DD'),
                        startDate: moment(this.orderForm.controls['startDate']?.value).format('YYYY-MM-DD'),
                        availableDate: moment(this.orderForm.controls['availableDate']?.value).format('YYYY-MM-DD'),
                        reference: this.orderForm.controls['reference']?.value ? this.orderForm.controls['reference']?.value : "",
                        priceLevel: this.orderForm.controls['priceLevel']?.value ? this.orderForm.controls['priceLevel']?.value : "MSRP",
                        currencyId: this.orderForm.controls['currencyId']?.value ? this.orderForm.controls['currencyId']?.value : this.appSession.tenant.currencyInfoDto.value
                    };



                    await this.validateShoppingCart();

                }
            }
        } else if (this.orderForm.controls['enteredByUserRole']?.value == "I'm a Seller" || this.orderForm.controls['enteredByUserRole']?.value == "I'm a Buyer") {
            this.areSame = false
        } else {
            this.areSame = true
        }


    }

    changeStartDate(date) {

        const newDate = new Date();

        let month = date?.value?.getMonth();
        let year = date?.value?.getFullYear();
        let day = date?.value?.getDate();

        let monthVal = (month === 11) ? 0 : month + 1;
        let yearVal = (monthVal === 0) ? year + 1 : year;
        this.minDate = newDate;
        this.minDate.setDate(day);
        this.minDate.setMonth(monthVal);
        this.minDate.setFullYear(yearVal);
        const completeDateControl = this.orderForm.controls['completeDate'];
        const availableDateControl = this.orderForm.controls['availableDate'];
        const startDateControl = this.orderForm.controls['startDate'];




        if (!completeDateControl?.value || completeDateControl?.value?.getTime() <= date?.value?.getTime()) {
            this.orderForm.controls['completeDate'].setValue(this.minDate);
        }

        if (!availableDateControl?.value || availableDateControl?.value?.getTime() <= date?.value?.getTime()) {
            this.orderForm.controls['availableDate'].setValue(this.minDate);
        }

        this.minCompleteDate = this.orderForm.get('completeDate')?.value;
        this.minStartDate = this.orderForm.get('startDate')?.value;
        this.minSEnteredDate = this.orderForm.get('enteredDate')?.value;

        const selectedStartDate = new Date(startDateControl.value);
        if (selectedStartDate < this.minSEnteredDate) {
            this.startDateMsg = true
            startDateControl.setErrors({ minDate: true });
        } else {

            this.startDateMsg = false
            startDateControl.setErrors(null);
        }


    }


    changeEnteredDate(date) {
        let day = date?.value?.getDate();
        let month = date?.value?.getMonth();
        let year = date?.value?.getFullYear();

        // Use local time
        this.minDate = new Date(year, month, day);
        this.minSEnteredDate = this.orderForm.get('enteredDate')?.value;
        this.orderForm.controls['startDate'].setValue(this.orderForm.get('enteredDate')?.value);
    }

    changeCompleteDate(event) {
        const newDate = new Date(event.value);

        this.orderForm.controls['availableDate'].setValue(newDate);
        this.minCompleteDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        this.minStartDate = this.orderForm.get('startDate')?.value;

        if (newDate?.getTime() !== this.orderForm.controls['completeDate']?.value?.getTime()) {
            this.orderForm.controls['completeDate'].setValue(newDate);
        }

        const selectedCompleteDate = new Date(this.orderForm.controls['completeDate']?.value);
        if (selectedCompleteDate < this.orderForm.get('startDate')?.value) {
            this.comtDateMsg = true;
            this.orderForm.controls['completeDate']?.setErrors({ minDate: true });
        } else {
            this.comtDateMsg = false;
            this.orderForm.controls['completeDate']?.setErrors(null);
        }
    }

    changeAvailbeDate(event) {
        const selectedAvailableDate = new Date(this.orderForm.controls['availableDate']?.value);
        if (selectedAvailableDate < this.orderForm.get('completeDate')?.value) {
            this.avalabletDateMsg = true;
            this.orderForm.controls['availableDate']?.setErrors({ minDate: true });
        } else {
            this.avalabletDateMsg = false;
            this.orderForm.controls['availableDate']?.setErrors(null);
        }
    }




    async validateShoppingCart() {
        this.showMainSpinner();
        var transactionType: TransactionType;
        if (this.formType?.toUpperCase() == "SO")
            transactionType = TransactionType.SalesOrder;
        if (this.formType?.toUpperCase() == "PO")
            transactionType = TransactionType.PurchaseOrder;
        let sellerCompanySSIN = "";
        if (this.sellerCompanySSIN)
            sellerCompanySSIN = this.sellerCompanySSIN?.toString();

        let buyerCompanySSIN = "";
        if (this.buyerCompanySSIN)
            buyerCompanySSIN = this.buyerCompanySSIN?.toString();

        await this._AppTransactionServiceProxy
            .validateBuyerSellerTransaction(
                sellerCompanySSIN,
                buyerCompanySSIN,
                transactionType
            )
            .subscribe(async (res) => {
                this.setCurrentUserActiveTransaction = false;
                switch (res.validateOrder) {
                    case ValidateTransaction.FoundShoppingCart:
                        this.addNew = false;
                        this.shoppingCartModal.show(res.shoppingCartId);
                        this.hideMainSpinner();
                        break;

                    case ValidateTransaction.NotFound:
                    case ValidateTransaction.NotFoundShoppingCartForTemp:
                        this.setCurrentUserActiveTransaction = true;
                        this.addNew = true;
                        break;

                    case ValidateTransaction.FoundInAnotherTransaction:
                    case ValidateTransaction.FoundShoppingCartForTemp:
                        this.hideMainSpinner();
                        await Swal.fire({
                            title: "",
                            text: this.l('ConflictNewOrderActiveCart'),
                            icon: "info",
                            showCancelButton: true,
                            confirmButtonText: this.l('ContinueWithShoppingCart'),
                            cancelButtonText: this.l('ContinueWithNewOrder'),
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            backdrop: true,
                            customClass: {
                                popup: "popup-class",
                                icon: "icon-class",
                                content: "content-class",
                                actions: "actions-class",
                                confirmButton: "confirm-button-class2",
                            },
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                this.addNew = false;
                                this.shoppingCartModal.show(res.shoppingCartId);
                                this.display = false;
                                this.hideMainSpinner();
                            } else {
                                this.setCurrentUserActiveTransaction = true;
                                this.addNew = true;
                            }

                        });
                        break;
                    default:
                        this.hideMainSpinner();
                        break;
                }

                this.addTransaction();
            });
    }



    addTransaction() {

        if (this.addNew) {
            this.showMainSpinner();
            this.btnLoader = true;

            this.body.buyerRelationId  = this.sellerCompanyRelationId;
            this.body.sellerRelationId = this.buyerCompanyRelationId;
            this._AppTransactionServiceProxy
                .createOrEdit(this.body)
                .pipe(finalize(() => {
                    this.btnLoader = false
                    localStorage.removeItem("comNew");
                    localStorage.removeItem("conNew");
                    localStorage.removeItem("productFilters");
                }))
                .subscribe((response: any) => {
                              
                    localStorage.setItem("transId", JSON.stringify(response));

                    if (this.setCurrentUserActiveTransaction) {
                        this._AppTransactionServiceProxy
                            .setCurrentUserActiveTransaction(
                                response
                            )
                            .subscribe((res) => {
                                this.addNew = true;
                                this.userClickService.userClicked("refreshShoppingInfoInTopbar");
                                this.display = false;
                                this.hideMainSpinner();
                            });
                    }
                    this.hideMainSpinner();

                    this.printInfoParam.reportTemplateName = this.transactionReportTemplateName;
                    this.printInfoParam.TransactionId = response;
                    this.printInfoParam.orderConfirmationRole = this.getTransactionRole(this.body.enteredByUserRole);
                    this.printInfoParam.saveToPDF = true;
                    this.printInfoParam.tenantId = this.appSession?.tenantId
                    this.printInfoParam.userId = this.appSession?.userId
                    this.reportUrl = this.printInfoParam.getReportUrl()

                    this.display = false;
                    this.modalClose.emit(false);
                    this.reset();
                    localStorage.setItem("fromSellerRoom", JSON.stringify(true));
                    localStorage.setItem("fromMarketPlace", JSON.stringify(false));
                    localStorage.setItem(
                        "SellerId",
                        JSON.stringify(this.sellerCompanyId)
                    );

                    localStorage.setItem("transNO", this.orderNo);
                    localStorage.setItem(
                        "contactSSIN",
                        JSON.stringify(this.buyerContactSSIN)
                    );

                    sessionStorage.setItem(
                        "SellerSSIN",
                        JSON.stringify(this.sellerCompanySSIN)
                    );

                    if (this.isBuyerTempAccount) {
                        localStorage.setItem(
                            "currencyCode",
                            JSON.stringify(null)
                        );
                    } else {
                        localStorage.setItem(
                            "BuyerSSIN",
                            JSON.stringify(this.buyerCompanySSIN)
                        );


                        if (this.formType?.toUpperCase() == "PO")
                            this.currencyCode = this.appSession.tenant.currencyInfoDto;

                        localStorage.setItem(
                            "currencyCode",
                            JSON.stringify(this.sellerCurrencyCode)
                        );
                    }

                    if (this.currencyCode) {
                        this._AppMarketplaceItemsServiceProxy
                            .checkCurrencyExchangeRate(this.currencyCode)
                            .subscribe((res: boolean) => {
                                if (!res) {
                                    Swal.fire({
                                        title: "",
                                        text: this.l('CurrencyRateNotDefined'),
                                        icon: "info",
                                        showCancelButton: false,
                                        confirmButtonText:
                                          this.l('Ok') ,
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        backdrop: true,
                                        customClass: {
                                            popup: "popup-class",
                                            icon: "icon-class",
                                            content: "content-class",
                                            actions: "actions-class",
                                            confirmButton: "confirm-button-class2",
                                        },
                                    });


                                    this.currencyCode = this.sellerCurrencyCode ? this.sellerCurrencyCode : this.appSession.tenant.currencyInfoDto;
                                    localStorage.setItem(
                                        "currencyCode",
                                        JSON.stringify(this.currencyCode)
                                    );
                                }
                            });
                    }

                    else {
                        this.currencyCode = this.sellerCurrencyCode ? this.sellerCurrencyCode : this.appSession.tenant.currencyInfoDto;
                        localStorage.setItem(
                            "currencyCode",
                            JSON.stringify(this.currencyCode)
                        );
                    }

                    if (location.href.toString() == AppConsts.appBaseUrl + "/app/main/marketplace/products")
                        location.reload();
                    else
                        this.router.navigateByUrl("app/main/marketplace/products");
                });
        }
        this.display = false;
    }

    reset() {
        this.isSeller = false;
        this.isBuyer = false;
        this.isBuyerTempAccount = false;
        this.isCompantIdExist = false;
        this.handleSellerCompanySearch('')
        this.handleBuyerCompanySearch('')
        this.sellerContacts = [];
        this.buyerContacts = [];
        this.orderForm.reset();
        this.role = "";
        this.Role.value = {};
        this.submitted = false;
       // this.roles = [];
        this.isSellerCompanyIdExist = false;
        this.invalidSellerPhoneNumber = "";
        this.invalidBuyerPhoneNumber = "";
        this.invalidBuyerContactEMailAddress = "";
        this.invalidSellerContactEMailAddress = "";
        this.showBuyerRelationshipIcon = false;
        this.showSellerRelationshipIcon = false;
        this.buyerRelationshipName = '';
        this.sellerRelationshipName = '';
        this.sellerCompanyRelationId = "";
        this.buyerCompanyRelationId = "";
    }


    changeTouchState(event) {
        this.orderForm.controls['currencyId'].setValue(event.value)
    }

    changePrice(event) {
        this.orderForm.controls['priceLevel'].setValue(event.value)

    }
    getCurrencies() {
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });
    }

    getCurrenciesDto() {
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrenciesDto = result;
        });
    }

    ngOnInit(): void {
        this.primeDateFormat = this.languageSettingName != 'en-GB'
        ? 'mm/dd/yy'
        : 'dd/mm/yy';
        this.today = new Date()
        this.updateControlState()
        this.initForm()
        let today = new Date();
        let month = today.getMonth();
        let year = today.getFullYear();
        let prevMonth = (month === 0) ? 11 : month - 1;
        let prevYear = (prevMonth === 11) ? year - 1 : year;
        this.minDate = new Date();
        this.minDate.setMonth(prevMonth);
        this.minDate.setFullYear(prevYear);
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false

    }

    cancel() {
        this.isSeller = false;
        this.isBuyer = false;
        this.isBuyerTempAccount = false;
        this.isSellerCompanyIdExist = false;
        this.isCompantIdExist = false;
        this.orderForm.controls["buyerCompanySSIN"].setValue('');
        this.areSame = false
        this.buyerComapnyId = 0
        this.handleSellerCompanySearch('')
        this.handleBuyerCompanySearch('')
        this.sellerContacts = [];
        this.buyerContacts = [];
        this.orderForm.reset();
        this.role = "";
        this.modalClose.emit(false);
        this.display = false;
        this.Role.value = {};
        this.submitted = false;
       // this.roles = [];
        this.invalidSellerPhoneNumber = "";
        this.invalidBuyerPhoneNumber = "";
        this.invalidBuyerContactEMailAddress = "";
        this.invalidSellerContactEMailAddress = "";
        this.showBuyerRelationshipIcon = false;
        this.showSellerRelationshipIcon = false;
        this.buyerRelationshipName = '';
        this.sellerRelationshipName = '';
        this.sellerCompanyRelationId = "";
        this.buyerCompanyRelationId = "";
}
}
