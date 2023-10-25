import {
    Injector,
    Component,
    OnInit,
    ViewEncapsulation,
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
} from "@shared/service-proxies/service-proxies";

@Component({
    templateUrl: "./createTransactionModal.component.html",
    selector: "createTransactionModal",
    styleUrls: ["./createTransactionModal.component.scss"],
})
export class CreateTransactionModal implements OnInit {
    dt: string;
    public orderForm: FormGroup;
    submitted: boolean = false;
    salesOrderControls: ICreateOrEditAppTransactionsDto;
    selectedCar: number;
    buyerCompanies: any[];
    sellerCompanies: any[];
    buyerContacts: any[];
    sellerContacts: any[];
    searchTimeout: any;
    buyerComapnyId: number = 0;
    sellerCompanyId: number = 0;
    sellerContactId: number;
    buyerContactId: number;
    isCompantIdExist: boolean = false;
    isSellerCompanyIdExist: boolean = false;
    role: string;
    isRoleExist: boolean = false;
    btnLoader: boolean = false;

    @Input() orderNo: string;
    @Input() fullName: string;
    @Input() display:boolean =false
    @Input() formType:string
    @Input() modalheaderName:string
    @Input()roles:any[]
    @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();


    constructor(
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy
    ) {
        this.orderForm = this.fb.group({
            sellerCompanyName: ["", [Validators.required]],
            sellerName: [""],
            sellerEMailAddress: ["", [Validators.email]],
            sellerPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
            buyerCompanyName: ["", [Validators.required]],
            buyerName: [""],
            buyerEMailAddress: ["", [Validators.email]],
            buyerPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
        });
        this.getAllCompanies();
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
                undefined
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
    }
    selectTempSeller() {
        this.isSellerTempAccount = !this.isSellerTempAccount;
    }
    handleRoleChange(data: any) {
        this.role = data.value.name;
        this.isRoleExist = false;
        if (data.value.code === 1) {
            // i'm a Seller
            this.isSeller = true;
            this.isBuyer = false;
            this.buyerContacts = [];
            this._AppTransactionServiceProxy
                .getCurrentTenantAccountProfileInformation()
                .subscribe((res: any) => {
                    this.sellerCompanyId = res.id;
                    this.isSellerCompanyIdExist = true;
                    this.isCompantIdExist = false;
                    this.handleSellerNameSearch("");
                    // add seller values
                    this.orderForm.get("sellerName").setValue(res.name);
                    this.orderForm.get("sellerCompanyName").setValue(res.name);
                    // remove buyer values
                    this.orderForm.get("buyerName").reset();
                    this.orderForm.get("buyerCompanyName").reset();
                    this.orderForm.get("buyerEMailAddress").reset();
                    this.orderForm.get("buyerPhoneNumber").reset();
                });
        } else if (data.value.code === 2) {
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
                    this.handleBuyerNameSearch("");
                    this.orderForm.get("buyerName").setValue(res.name);
                    this.orderForm.get("buyerCompanyName").setValue(res.name);

                    // remove seller values
                    this.orderForm.get("sellerName").reset();
                    this.orderForm.get("sellerCompanyName").reset();
                    this.orderForm.get("sellerEMailAddress").reset();
                    this.orderForm.get("sellerPhoneNumber").reset();
                });
        } else {
            // i'm a sales rep
            this.isSeller = false;
            this.isBuyer = false;
            this.isBuyerTempAccount = false;
            this.isCompantIdExist = false;
            // this.buyerCompanies = []
            // this.sellerCompanies = []
            // this.sellerContacts = []
            // this.buyerContacts = []
            this.orderForm.reset();
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
                    undefined
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
                    undefined
                )
                .subscribe((res: any) => {
                    this.sellerCompanies = [...res.items];
                });
        }, 1000);
    }
    handleBuyerCompanyChange(event: any) {
        this.buyerComapnyId = event.value.id;
        this.handleBuyerNameSearch("");
    }
    handleSellerCompanyChange(event: any) {
        this.sellerCompanyId = event.value.id;
        this.handleSellerNameSearch("");
    }

    handleBuyerNameSearch(event: any) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            console.log(this.buyerComapnyId);
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
        this.orderForm.get("buyerEMailAddress").setValue(event.value.email);
        this.orderForm.get("buyerPhoneNumber").setValue(event.value.phone);
    }
    handleSellerNameChange(event: any) {
        this.sellerContactId = event.value.id;
        this.orderForm.get("sellerEMailAddress").setValue(event.value.email);
        this.orderForm.get("sellerPhoneNumber").setValue(event.value.phone);
    }

    getStarted() {
        this.submitted = true;
        if (this.orderForm.invalid) {
            return;
        } else {
            if (this.role === "") {
                this.isRoleExist = true;
                this.btnLoader = false;
            } else {
                let formValue = this.orderForm
                    .value as ICreateOrEditAppTransactionsDto;
                let body: any = {
                    sllerName:
                        this.orderForm.value?.sellerName?.name &&
                        this.orderForm.value?.sellerName?.name !== null
                            ? this.orderForm.value?.sellerName?.name
                            : null,
                    buyerName: this.isBuyerTempAccount
                        ? this.orderForm.value?.buyerName
                        : this.orderForm.value?.buyerName?.name &&
                          this.orderForm.value?.buyerName !== null
                        ? this.orderForm.value?.buyerName?.name
                        : null,
                    sellerContactId: this.sellerContactId,
                    buyerContactId: this.buyerContactId,
                    sellerEmailAddress: formValue?.sellerEMailAddress,
                    buyerEmailAddress: formValue?.buyerEMailAddress,
                    buyerPhone: formValue?.buyerPhoneNumber,
                    sellerphone: formValue?.sellerPhoneNumber,
                    buyerCompanyName: this.isCompantIdExist
                        ? formValue?.buyerCompanyName
                        : this.orderForm.value?.buyerCompanyName?.name &&
                          this.orderForm.value?.buyerCompanyName?.name !== null
                        ? this.orderForm.value?.buyerCompanyName?.name
                        : null,
                    sellerCompanyName: this.isSellerCompanyIdExist
                        ? this.orderForm.value?.sellerCompanyName
                        : this.orderForm.value?.sellerCompanyName?.name &&
                          this.orderForm.value?.sellerCompanyName?.name !== null
                        ? this.orderForm.value?.sellerCompanyName?.name
                        : null, // company name condition if dropdown or input
                    buyerId: this.buyerComapnyId,
                    sellerId: this.sellerCompanyId,
                    enteredUserByRole: this.role,
                    code: this.orderNo,
                };
                if (this.formType === "SO") {
                    this.btnLoader = true;
                    this._AppTransactionServiceProxy
                        .createOrEditSalesOrder(body)
                        .pipe(finalize(() => (this.btnLoader = false)))
                        .subscribe((response: any) => {
                            console.log(response);
                            this.display = false;
                            this.modalClose.emit(false)
                            this.reset();
                        });
                } else {
                    this.btnLoader = true;
                    this._AppTransactionServiceProxy
                        .createOrEditPurchaseOrder(body)
                        .pipe(finalize(() => (this.btnLoader = false)))
                        .subscribe((response: any) => {
                            console.log(response);
                            this.display = false;
                            this.modalClose.emit(false)
                            this.reset();
                        });
                }
            }
        }
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
        this.modalClose.emit(false)
        this.display = false;
        this.Role.value = {};
        this.submitted = false;
        this.roles = [];
    }

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
}
