import {
    Injector,
    Component,
    OnInit,
    ViewEncapsulation,
    OnChanges,
    Output,
    EventEmitter,
    Input,
    ViewChild,
} from "@angular/core";
import { MenuItem } from "primeng/api";
import {
    FormBuilder,
    FormGroup,
    FormGroupName,
    Validators,
} from "@angular/forms";
import { DatePipe } from "@angular/common";
import { finalize } from "rxjs";
import { Dropdown } from "primeng/dropdown";
import {
    LinkedUserDto,
    MessageServiceProxy,
    ProfileServiceProxy,
    UserLinkServiceProxy,
    GetMaintainanceForViewDto,
    MaintainancesServiceProxy,
    AppTransactionServiceProxy,
    ICreateOrEditAppTransactionsDto,
    TransactionType,
    ValidateTransaction,
    AppMarketplaceItemsServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ShoppingCartViewComponentComponent } from "@app/admin/app-shoppingCart/Components/shopping-cart-view-component/shopping-cart-view-component.component";
import { AppComponentBase } from "@shared/common/app-component-base";
import { throws } from "assert";
import { UserClickService } from "@shared/utils/user-click.service";
import { AppConsts } from "@shared/AppConsts";
import { get } from "http";
import { ProductCatalogueReportParams } from "@app/main/app-items/appitems-catalogue-report/models/product-Catalogue-Report-Params";
import * as moment from "moment";

@Component({
    templateUrl: "./createTransactionModal.component.html",
    selector: "createTransactionModal",
    styleUrls: ["./createTransactionModal.component.scss"],
    providers:[AppMarketplaceItemsServiceProxy]
})
export class CreateTransactionModal extends AppComponentBase implements OnInit,OnChanges {
    dt: string;
    public orderForm: FormGroup;
    submitted: boolean = false;
    salesOrderControls: ICreateOrEditAppTransactionsDto;
    selectedCar: number;
    buyerCompanies: any[];
    buyerBranches: any[];
    sellerBranches: any[];
    sellerCompanies: any[];
    buyerContacts: any[];
    sellerContacts: any[];
    searchTimeout: any;
    buyerComapnyId: number = 0;
    sellerCompanyId: number = 0;
    sellerCompanySSIN: number = 0;
    buyerCompanySSIN: number = 0;
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
    byerBranchAutoselectFirst:boolean=false;
    minDate:Date;
    roleDdval:any;
    @Input() orderNo: string;
    @Input() fullName: string;
    @Input() display: boolean = false;
    @Input() formType: string;
    @Input() modalheaderName: string;
    @Input() roles: any[];
    @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild("shoppingCartModal", { static: true })
    shoppingCartModal: ShoppingCartViewComponentComponent;
    addNew = true;
    invalidBuyerPhoneNumber = "";
    invalidSellerPhoneNumber = "";
    invalidBuyerContactEMailAddress = "";
    invalidSellerContactEMailAddress = "";
    sellerPhoneLabel: string = "Phone Number";
    buyerPhoneLabel: string = "Phone Number";


    body: any;
    setCurrentUserActiveTransaction: boolean = false;
    invokeAction = '/DXXRDV';
    reportUrl="";
    printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams()
    minCompleteDate:Date;
    minStartDate:Date;
    sellerCurrencyCode;

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppMarketplaceItemsServiceProxy:AppMarketplaceItemsServiceProxy,
        private userClickService: UserClickService,
        private router: Router
    ) {
        super(injector);
        this.orderForm = this.fb.group({
            startDate: [ Date, [Validators.required]],
            completeDate: ["", [Validators.required]],
            availableDate: ["", [Validators.required]],
            sellerCompanyName: ["", [Validators.required]],
            sellerContactName: [""],
            sellerContactEMailAddress: ["", [Validators.email]],
            sellerContactPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
            buyerCompanyName: ["", [Validators.required]],
            buyerContactName: [""],
            buyerContactEMailAddress: ["", [Validators.email]],
            buyerContactPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
            buyerCompanyBranch:["", [Validators.required]],
            sellerCompanyBranch:["", [Validators.required]],
            istemp: [false],
        });
        this.orderForm.reset();
        this.getAllCompanies();
        this.orderForm.controls['startDate'].setValue(new Date());
        this.changeStartDate(this.orderForm.get('startDate'));
    }
    ngOnChanges(){
        this.orderForm = this.fb.group({
            startDate: [ Date, [Validators.required]],
            completeDate: ["", [Validators.required]],
            availableDate: ["", [Validators.required]],
            sellerCompanyName: ["", [Validators.required]],
            sellerContactName: [""],
            sellerContactEMailAddress: ["", [Validators.email]],
            sellerContactPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
            buyerCompanyName: ["", [Validators.required]],
            buyerContactName: [""],
            buyerContactEMailAddress: ["", [Validators.email]],
            buyerContactPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
            buyerCompanyBranch:["", [Validators.required]],
            sellerCompanyBranch:["", [Validators.required]],
            istemp: [false],
        });
        this.orderForm.reset();
        this.orderForm.controls['startDate'].setValue(new Date());
        this.changeStartDate(this.orderForm.get('startDate'));
        this.getUserDefultRole();

    }
    getUserDefultRole(){
       /* var transactionType: TransactionType;
        if (this.formType.toUpperCase() == "SO")
            transactionType = TransactionType.SalesOrder;
        if (this.formType.toUpperCase() == "PO")
            transactionType = TransactionType.PurchaseOrder;*/
        this._AppTransactionServiceProxy.getUserDefaultRole(this.formType?.toUpperCase()).subscribe(result=>{
            if (this.formType?.toUpperCase() == "SO"){
                if(result.toLowerCase().includes('seller')){
                  this.roleDdval=this.roles.filter(role=>role.code==1)[0];

                }else{
                    this.roleDdval=this.roles.filter(role=>role.code!==1)[0];
                }
            }else if (this.formType?.toUpperCase() == "PO"){
                if(result.toLowerCase().includes('buyer')){
                    this.roleDdval=this.roles.filter(role=>role.code==2)[0];

                }else{
                    this.roleDdval=this.roles.filter(role=>role.code!==2)[0];
                }
            }
            this.handleRoleChange({value:this.roleDdval});
        })
    }
    getBranches(accountSSIN,objectToChangeName) {
            this._AppTransactionServiceProxy.getAccountBranches(accountSSIN).subscribe(result => {
                if(objectToChangeName=='buyer'){
                  this.buyerBranches=result;
                   if(result.length==1){
                    this.orderForm.controls['buyerCompanyBranch'].setValue(result[0]);

                   }
                }else{
                    this.sellerBranches=result;
                    if(result.length==1){
                        this.orderForm.controls['sellerCompanyBranch'].setValue(result[0]);
    
                       }
                }
            }); 
    }
    getAllCompanies() {
        this._AppTransactionServiceProxy
            .getRelatedAccounts(
                "",
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
                undefined,true
            )
            .subscribe((res: any) => {
                this.buyerCompanies = [...res.items];
                this.sellerCompanies = [...res.items];
            });
    }

    isBuyerTempAccount: boolean = false;
    isSellerTempAccount: boolean = false;
    isBuyer: boolean = false;
    isSeller: boolean = false;
    selectTempBuyer() {
        this.isBuyerTempAccount = !this.isBuyerTempAccount;
        this.isCompantIdExist = this.isBuyerTempAccount;
        if (this.isBuyerTempAccount) {
            this.orderForm.controls["buyerCompanyName"].reset();
            
        }
    }
    selectTempSeller() {
        this.isSellerTempAccount = !this.isSellerTempAccount;
    }
    handleRoleChange(data: any) {
        
        this.role = data?.value?.name;
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
                    this.orderForm.get("sellerContactName").setValue(res.name);
                    this.orderForm.get("sellerCompanyName").setValue(res.name);
                    this.orderForm.get('sellerContactPhoneNumber').setValue(res.phone)
                    this.orderForm.get('sellerContactEMailAddress').setValue(res.email)
                    // remove buyer values
                    this.orderForm.get("buyerContactName").reset();
                    this.orderForm.get("buyerCompanyName").reset();
                    this.orderForm.get("buyerContactEMailAddress").reset();
                    this.orderForm.get("buyerContactPhoneNumber").reset();
                    this.orderForm.get("sellerCompanyBranch").reset();
                    this.orderForm.get("buyerCompanyBranch").reset();
                    this.sellerBranches=[];
                    this.getBranches(this.sellerCompanySSIN ,'seller')
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
                    this.orderForm.get("buyerContactName").setValue(res.name);
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
                    this.buyerBranches=[];
                    this.getBranches(this.buyerCompanySSIN ,'buyer')

                });
        } else {
            // i'm a sales rep
            this.isSeller = false;
            this.isBuyer = false;
            this.isBuyerTempAccount = false;
            this.isCompantIdExist = false;
            this.isSellerCompanyIdExist = false;
            // this.buyerCompanies = []
            // this.sellerCompanies = []
            // this.sellerContacts = []
            // this.buyerContacts = []
            //this.orderForm.reset();
        }
    }

    handleBuyerCompanySearch(event: any) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this._AppTransactionServiceProxy
                .getRelatedAccounts(
                    event.filter,
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
                    undefined,true
                )
                .subscribe((res: any) => {
                    
                    this.buyerCompanies = [...res.items];
                    // this.sellerCompanies = [...res.items];
                });
        }, 1000);
    }
    handleSellerCompanySearch(event: any) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this._AppTransactionServiceProxy
                .getRelatedAccounts(
                    event.filter,
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
                    undefined,true
                )
                .subscribe((res: any) => {
                    
                    this.sellerCompanies = [...res.items];
                });
        }, 1000);
    }

    handleBuyerCompanyChange(event: any) {
        this.buyerComapnyId = event.value.id;
        this.buyerCompanySSIN = event.value.accountSSIN;
        this.currencyCode = event.value.currencyCode;
        this.areSame = false
        this.orderForm.get('buyerContactPhoneNumber').setValue(event.value.phone)
        this.orderForm.get('buyerContactEMailAddress').setValue(event.value.email)

        this.handleBuyerNameSearch("");
        this.buyerBranches=[];
        this.getBranches(event.value.accountSSIN,'buyer')
    }

    handleSellerCompanyChange(event: any) {
        this.sellerCompanyId = event.value.id;
        this.sellerCompanySSIN = event.value.accountSSIN;
        this.sellerCurrencyCode=event.value.currencyCode;
        this.areSame = false
        this.orderForm.get('sellerContactPhoneNumber').setValue(event.value.phone)
        this.orderForm.get('sellerContactEMailAddress').setValue(event.value.email)
        this.handleSellerNameSearch("");
        this.sellerBranches=[];
        this.getBranches(event.value.accountSSIN,'seller')
    }

    handleBuyerNameSearch(event: any) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this._AppTransactionServiceProxy
                .getAccountRelatedContacts(this.buyerComapnyId, event.filter)
                .subscribe((res: any) => {
                    this.buyerContacts = [...res];

                });
        }, 500);
    }
    handleSellerNameSearch(event: any) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            console.log(this.buyerComapnyId);
            this._AppTransactionServiceProxy
                .getAccountRelatedContacts(this.sellerCompanyId, event.filter)
                .subscribe((res: any) => {
                    this.sellerContacts = [...res];
                });
        }, 500);
    }
    handleBuyerNameChange(event: any) {
        this.buyerContactId = event.value.id;
        this.buyerContactSSIN = event.value.ssin;
        this.orderForm
            .get("buyerContactEMailAddress")
            .setValue(event.value.email);
        this.orderForm
            .get("buyerContactPhoneNumber")
            .setValue(event.value.phone);

        this.invalidBuyerPhoneNumber = "";
        this.buyerPhoneLabel = event?.value?.phoneTypeName ?   event?.value?.phoneTypeName + " Number" : this.buyerPhoneLabel;

    }
    handleSellerNameChange(event: any) {
        console.log(">>", event.value);
        this.sellerContactId = event.value.id;
        this.sellerContactSSIN = event.value.ssin;
        this.orderForm
            .get("sellerContactEMailAddress")
            .setValue(event.value.email);
        this.orderForm
            .get("sellerContactPhoneNumber")
            .setValue(event.value.phone);

        this.sellerPhoneLabel = event?.value?.phoneTypeName ?  event?.value?.phoneTypeName + " Number" : this.sellerPhoneLabel;

    }

    areSame: boolean = false;
    async getStarted() {

        if(this.isBuyerTempAccount){
        this.orderForm = this.fb.group({
            buyerCompanyBranch:["", null]
        }) 
    }

        if ((!this.sellerCompanyId || !this.buyerComapnyId)  || (this.sellerCompanyId !== this.buyerComapnyId)) {
            this.areSame = false;
            this.submitted = true;
            this.invalidBuyerPhoneNumber = "";
            this.invalidBuyerContactEMailAddress = "";
            this.invalidSellerContactEMailAddress = "";

            if (
                this.orderForm.get("buyerContactPhoneNumber")?.value && this.orderForm.get("buyerContactPhoneNumber")?.value?.length < 5
            )
                this.invalidBuyerPhoneNumber = "Buyer phone Number too short";

            if (
                this.orderForm.get("buyerContactPhoneNumber")?.value && this.orderForm.get("buyerContactPhoneNumber")?.value?.length >
                20
            )
                this.invalidBuyerPhoneNumber = "Buyer phone Number too long";

            this.invalidSellerPhoneNumber = "";
            if (
                this.orderForm.get("sellerContactPhoneNumber")?.value && this.orderForm.get("sellerContactPhoneNumber")?.value?.length < 5
            )
                this.invalidSellerPhoneNumber = "Seller phone Number too short";

            if (
                this.orderForm.get("sellerContactPhoneNumber")?.value && this.orderForm.get("sellerContactPhoneNumber")?.value?.length >
                20
            )
                this.invalidSellerPhoneNumber = "Seller phone Number too long";

            if (
                this.orderForm.get("buyerContactEMailAddress")?.value && this.orderForm.get("buyerContactEMailAddress")?.value?.length < 5
            )
                this.invalidBuyerContactEMailAddress = "Email Address is too short";

            if (
                this.orderForm.get("buyerContactEMailAddress")?.value && this.orderForm.get("buyerContactEMailAddress")?.value?.length > 100
            )
                this.invalidBuyerContactEMailAddress = "Email Address is too long";

            if (
                this.orderForm.get("sellerContactEMailAddress")?.value && this.orderForm.get("sellerContactEMailAddress")?.value?.length < 5
            )
                this.invalidSellerContactEMailAddress = "Email Address is too short";

            if (
                this.orderForm.get("sellerContactEMailAddress")?.value && this.orderForm.get("sellerContactEMailAddress")?.value?.length > 100
            )
                this.invalidSellerContactEMailAddress = " Email Address is too long";


            if (this.invalidSellerPhoneNumber || this.invalidBuyerPhoneNumber || this.invalidBuyerContactEMailAddress || this.invalidSellerContactEMailAddress)
                return;
            if (this.orderForm.invalid) {
                Object.keys(this.orderForm.controls).forEach(key => {
                    const control = this.orderForm.get(key);
                    if (control.invalid) {
                        console.log('Invalid control:', key, 'Value:', control.value);
                    }
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
                        sellerContactName:
                            this.orderForm.value?.sellerContactName?.name &&
                                this.orderForm.value?.sellerContactName?.name !==
                                null
                                ? this.orderForm.value?.sellerContactName?.name
                                : null,
                        buyerContactName: this.isBuyerTempAccount
                            ? this.orderForm.value?.buyerContactName
                            : this.orderForm.value?.buyerContactName?.name &&
                                this.orderForm.value?.buyerContactName !== null
                                ? this.orderForm.value?.buyerContactName?.name
                                : null,
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
                        buyerBranchName: this.orderForm.controls['buyerCompanyBranch']?.value?.name,
                        sellerBranchSSIN:  this.orderForm.controls['sellerCompanyBranch']?.value?.ssin,
                        sellerBranchName: this.orderForm.controls['sellerCompanyBranch']?.value?.name,
                        completeDate: moment.utc(this.orderForm.controls['completeDate']?.value?.toLocaleString()),
                        startDate: moment.utc(this.orderForm.controls['startDate']?.value?.toLocaleString()),
                        availableDate: moment.utc(this.orderForm.controls['availableDate']?.value?.toLocaleString())
                    };
                    // buyerId:
                    //         this.buyerComapnyId === 0 ? null : this.buyerComapnyId,
                    //     sellerId: this.sellerCompanyId,
                    // if (this.formType === "SO") {

                    /*  if (
                         !this.sellerCompanySSIN?.toString() ||
                         !this.buyerCompanySSIN?.toString()
                     ) {
                         this.addNew = true;
                         console.log(
                             ">> before calling add addTransaction function 2",
                             this.orderNo
                         );
                         this.addTransaction();
                     } else await this.validateShoppingCart(); */
                    await this.validateShoppingCart();
                    // } else {
                    // this.btnLoader = true;
                    // this._AppTransactionServiceProxy
                    //     .createOrEditPurchaseOrder(body)
                    //     .pipe(finalize(() => (this.btnLoader = false)))
                    //     .subscribe((response: any) => {
                    //         console.log(response);
                    //         this.display = false;
                    //         this.modalClose.emit(false);
                    //         this.reset();
                    //     });
                    // }
                }
            }
        } else {
            this.areSame = true
        }
    }
    changeStartDate(date){

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
    


        if (!completeDateControl?.value || completeDateControl?.value?.getTime() <= date?.value?.getTime()) {
            this.orderForm.controls['completeDate'].setValue(this.minDate);
        }

        if (!availableDateControl?.value || availableDateControl?.value?.getTime() <= date?.value?.getTime()) {
            this.orderForm.controls['availableDate'].setValue(this.minDate);
        }

        this.minCompleteDate = this.orderForm.get('completeDate')?.value;
        this.minStartDate = this.orderForm.get('startDate')?.value;
       //this.orderForm.controls['startDate'].setValue(moment.utc(date.toLocaleString()));
    
   

    }

    changeCompleteDate(event) {
        const newDate = event.value;
    
        this.orderForm.controls['availableDate'].setValue(newDate);
        this.minCompleteDate = newDate;
        this.minStartDate = this.orderForm.get('startDate')?.value;

        // Check if the new date is different from the current value to prevent infinite loops
        if (newDate?.getTime() !== this.orderForm.controls['completeDate']?.value?.getTime()) 
            this.orderForm.controls['completeDate'].setValue(newDate);
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
                            text: "Conflict between the new order and the active shopping cart order",
                            icon: "info",
                            showCancelButton: true,
                            confirmButtonText:
                                "Continue with the Shopping Cart",
                            cancelButtonText: "Continue with the new order",
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
                console.log(
                    ">> before calling add addTransaction function 1 ",
                    this.orderNo
                );
                this.addTransaction();
            });
    }



    addTransaction() {
        console.log(">> before add new condition", this.orderNo);

        if (this.addNew) {
            console.log(">> after add new condition", this.orderNo);
            this.showMainSpinner();
            this.btnLoader = true;
            this._AppTransactionServiceProxy
                .createOrEdit(this.body)
                .pipe(finalize(() => (this.btnLoader = false)))
                .subscribe((response: any) => {
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

                    //////
                    this.printInfoParam.reportTemplateName=this.transactionReportTemplateName;
                    this.printInfoParam.TransactionId=response;
                //  this.printInfoParam.orderType=this.formType.toUpperCase();
                    this.printInfoParam.orderConfirmationRole=this.getTransactionRole(this.body.enteredByUserRole);
                    this.printInfoParam.saveToPDF=true;
                    this.printInfoParam.tenantId = this.appSession?.tenantId
                    this.printInfoParam.userId = this.appSession?.userId
                    this.reportUrl = this.printInfoParam.getReportUrl()
                    ///////
                    console.log(response);
                    this.display = false;
                    this.modalClose.emit(false);
                    this.reset();
                    localStorage.setItem(
                        "SellerId",
                        JSON.stringify(this.sellerCompanyId)
                    );
                    console.log(
                        ">> after seting transaction number to localstorage ",
                        this.orderNo
                    );
                    localStorage.setItem("transNO", this.orderNo);
                    localStorage.setItem(
                        "contactSSIN",
                        JSON.stringify(this.buyerContactSSIN)
                    );

                    localStorage.setItem(
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
                            this.currencyCode=  this.appSession.tenant.currencyInfoDto;
                            
                        localStorage.setItem(
                            "currencyCode",
                            JSON.stringify(this.currencyCode)
                        );
                    }


                     ////////////////////////////
                    this._AppMarketplaceItemsServiceProxy
                     .checkCurrencyExchangeRate(this.currencyCode)
                     .subscribe((res: boolean) => {
                         if(!res){
                              Swal.fire({
                                 title: "",
                                 text: "Currency exchange rate hasn't been defined switching to seller currency",
                                 icon: "info",
                                 showCancelButton: false,
                                 confirmButtonText:
                                     "Ok",
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


                             this.currencyCode=  this.sellerCurrencyCode ? this.sellerCurrencyCode :this.appSession.tenant.currencyInfoDto ;
                             localStorage.setItem(
                                 "currencyCode",
                                 JSON.stringify(this.currencyCode)
                             );
                         }
                         }); 
                             //////////////////////////

                             
                    if (location.href.toString() == AppConsts.appBaseUrl + "/app/main/marketplace/products")
                        location.reload();
                    else
                        this.router.navigateByUrl("app/main/marketplace/products");
                });
        }
        this.display = false;
    }
    @ViewChild("Role")
    Role: Dropdown;
    reset() {
        this.isSeller = false;
        this.isBuyer = false;
        this.isBuyerTempAccount = false;
        this.isCompantIdExist = false;
        this.getAllCompanies();
        this.sellerContacts = [];
        this.buyerContacts = [];
        this.orderForm.reset();
        this.role = "";
        this.Role.value = {};
        this.submitted = false;
        this.roles = [];
        this.isSellerCompanyIdExist = false;
        this.invalidSellerPhoneNumber = "";
        this.invalidBuyerPhoneNumber = "";
        this.invalidBuyerContactEMailAddress = "";
        this.invalidSellerContactEMailAddress = "";
    }

    cancel() {
        this.isSeller = false;
        this.isBuyer = false;
        this.isBuyerTempAccount = false;
        this.isSellerCompanyIdExist = false;
        this.isCompantIdExist = false;
        this.getAllCompanies();
        this.sellerContacts = [];
        this.buyerContacts = [];
        this.orderForm.reset();
        this.role = "";
        this.modalClose.emit(false);
        this.display = false;
        this.Role.value = {};
        this.submitted = false;
        this.roles = [];
        this.invalidSellerPhoneNumber = "";
        this.invalidBuyerPhoneNumber = "";
        this.invalidBuyerContactEMailAddress = "";
        this.invalidSellerContactEMailAddress = "";

    }

    ngOnInit(): void {
        console.log(">> oninit", this.orderNo);
        let today = new Date();
        let month = today.getMonth();
        let year = today.getFullYear();
        let prevMonth = (month === 0) ? 11 : month -1;
        let prevYear = (prevMonth === 11) ? year - 1 : year;
        let nextMonth = (month === 11) ? 0 : month + 1;
        let nextYear = (nextMonth === 0) ? year + 1 : year;
        this.minDate = new Date();
        this.minDate.setMonth(prevMonth);
        this.minDate.setFullYear(prevYear);
    }
}
