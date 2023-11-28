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
import { Router } from "@angular/router";

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

    @Input() orderNo: string;
    @Input() fullName: string;
    @Input() display: boolean = false;
    @Input() formType: string;
    @Input() modalheaderName: string;
    @Input() roles: any[];
    @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private router: Router
    ) {
        this.orderForm = this.fb.group({
            sellerCompanyName: ["", [Validators.required]],
            sellerContactName: [""],
            sellerContactEMailAddress: ["", [Validators.email]],
            sellerContactPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
            buyerCompanyName: ["", [Validators.required]],
            buyerContactName: [""],
            buyerContactEMailAddress: ["", [Validators.email]],
            buyerContactPhoneNumber: ["", [Validators.pattern("^[0-9]*$")]],
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
        if (this.isBuyerTempAccount) {
            this.orderForm.controls["buyerCompanyName"].reset();
        }
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
                    console.log(">>", res);
                    this.sellerCompanyId = res.id;
                    this.sellerCompanySSIN = res.accountSSIN;
                    this.isSellerCompanyIdExist = true;
                    this.isCompantIdExist = false;
                    this.handleSellerNameSearch("");
                    // add seller values
                    this.orderForm.get("sellerContactName").setValue(res.name);
                    this.orderForm.get("sellerCompanyName").setValue(res.name);
                    // remove buyer values
                    this.orderForm.get("buyerContactName").reset();
                    this.orderForm.get("buyerCompanyName").reset();
                    this.orderForm.get("buyerContactEMailAddress").reset();
                    this.orderForm.get("buyerContactPhoneNumber").reset();
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
                    this.buyerCompanySSIN = res.accountSSIN;
                    this.handleBuyerNameSearch("");
                    this.orderForm.get("buyerContactName").setValue(res.name);
                    this.orderForm.get("buyerCompanyName").setValue(res.name);

                    // remove seller values
                    this.orderForm.get("sellerContactName").reset();
                    this.orderForm.get("sellerCompanyName").reset();
                    this.orderForm.get("sellerContactEMailAddress").reset();
                    this.orderForm.get("sellerContactPhoneNumber").reset();
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
        this.buyerCompanySSIN = event.value.accountSSIN;
        this.currencyCode = event.value.currencyCode;
        console.log(">>", event.value);
        this.handleBuyerNameSearch("");
    }
    handleSellerCompanyChange(event: any) {
        this.sellerCompanyId = event.value.id;
        this.sellerCompanySSIN = event.value.accountSSIN;
        console.log(">>", event.value);
        this.handleSellerNameSearch("");
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
                    sellerContactName:
                        this.orderForm.value?.sellerContactName?.name &&
                        this.orderForm.value?.sellerContactName?.name !== null
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
                        this.buyerContactId === 0 ? null : this.buyerContactId,
                    sellerContactEmailAddress:
                        formValue?.sellerContactEMailAddress,
                    buyerContactEmailAddress:
                        formValue?.buyerContactEMailAddress,
                    buyerContactPhoneNumber: formValue?.buyerContactPhoneNumber,
                    sellerContactPhoneNumber:
                        formValue?.sellerContactPhoneNumber,
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
                    enteredByUserRole: this.role,
                    code: this.orderNo,
                    transactionType: this.formType === "SO" ? 0 : 1,
                    sellerContactSSIN: this.sellerContactSSIN,
                    buyerContactSSIN: this.buyerContactSSIN,
                    sellerCompanySSIN: this.sellerCompanySSIN,
                    buyerCompanySSIN: this.buyerCompanySSIN,
                };
                // buyerId:
                //         this.buyerComapnyId === 0 ? null : this.buyerComapnyId,
                //     sellerId: this.sellerCompanyId,
                // if (this.formType === "SO") {
                this.btnLoader = true;
                this._AppTransactionServiceProxy
                    .createOrEdit(body)
                    .pipe(finalize(() => (this.btnLoader = false)))
                    .subscribe((response: any) => {
                        console.log(response);
                        this.display = false;
                        this.modalClose.emit(false);
                        this.reset();
                        localStorage.setItem(
                            "SellerId",
                            JSON.stringify(this.sellerCompanyId)
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
                            localStorage.setItem(
                                "currencyCode",
                                JSON.stringify(this.currencyCode)
                            );
                        }
                        this.router.navigateByUrl(
                            "app/main/marketplace/products"
                        );
                    });
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
        this.modalClose.emit(false);
        this.display = false;
        this.Role.value = {};
        this.submitted = false;
        this.roles = [];
    }

    ngOnInit(): void {}
}
