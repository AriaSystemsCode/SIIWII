import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
    GetOrderDetailsForViewDto,
} from "@shared/service-proxies/service-proxies";
import { ShoppingCartMode } from "../shopping-cart-view-component/ShoppingCartMode";
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";

@Component({
    selector: "app-contact",
    templateUrl: "./contact.component.html",
    styleUrls: ["./contact.component.scss"],
})
export class ContactComponent {
    @Input() isReviewMode: boolean = false;
    companeyNames: any[];
    selectedCompany: any;
    contactName: string;
    departmentName: string;
    @Input() showDepartment: boolean = false;
    selectedBranch: any;
    PhoneNumber: string;
    selectedPhoneType: any;
    email: string;
    public ShoppingCartMode = ShoppingCartMode;
    phoneTypes: any[] = [];
    @Output() formValidityChanged = new EventEmitter<boolean>();
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("activeTab") activeTab: number;
    @Output("updateAppTransactionsForViewDto") updateAppTransactionsForViewDto = new EventEmitter<GetAppTransactionsForViewDto>();
    appTransactionContactsIndex = 0;

    constructor(
        private _AppTransactionServiceProxy: AppTransactionServiceProxy
    ) {
        this.getAllCompanies();
        this.phoneTypes = [
            { label: "Home", value: 1 },
            { label: "Home Fax", value: 2 },
            { label: "Mobile", value: 3 },
            { label: "Work", value: 5 },
            { label: "Work Fax", value: 6 },
            { label: "Main", value: 7 },
            { label: "Other", value: 4 },
        ];
    }

    ngOnInit(): void {
        this.getAppTransactionContactsIndex();
        this.selectedCompany = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companyName;
        this.selectedPhoneType = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneTypeName;
        this.selectedBranch = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.branchName;
        this.contactName = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactName;
        this.PhoneNumber = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneNumber;
        this.email = this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail;
        this.departmentName = this.appTransactionsForViewDto?.buyerDepartment;
    }

    getAppTransactionContactsIndex() {
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
                //It36 _contactRole SalesRep2
                _contactRole = ContactRoleEnum.SalesRep1;
                break;

            case ShoppingCartoccordionTabs.ShippingInfo:
                //It36 _contactRole ShipToContact
                _contactRole = ContactRoleEnum.ShipFromContact;
                break;


            case ShoppingCartoccordionTabs.BillingInfo:
                //It36 _contactRole ARContact
                _contactRole = ContactRoleEnum.APContact;
                break;
        };

        this.appTransactionContactsIndex = this.appTransactionsForViewDto.appTransactionContacts.findIndex(x => x.contactRole == _contactRole);



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
                this.companeyNames = [...res.items];
            });
    }

    isValidForm(): boolean {
        // Check if all required fields have values

        this.getAppTransactionContactsIndex();
        if (this.selectedCompany?.name) {
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName = this.selectedCompany?.name;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companySSIN = this.selectedCompany?.accountSSIN;
        }
        if (this.selectedPhoneType?.name)
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = this.selectedPhoneType?.name;

        if (this.selectedBranch?.name) {
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchName = this.selectedBranch?.name;
            this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchSSIN = this.selectedBranch?.accountSSIN;
        }

        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName = this.contactName;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneNumber = this.PhoneNumber;
        this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactEmail = this.email;
        this.appTransactionsForViewDto.buyerDepartment = this.departmentName;


        const isValid =
            (this.selectedCompany != undefined && this.selectedCompany != '') &&
            (this.contactName != undefined && this.contactName != '') &&
            (this.selectedPhoneType != undefined && this.selectedPhoneType != '') &&
            (this.PhoneNumber != undefined && this.PhoneNumber != '') &&
            (this.email != undefined && this.email != '') &&
            (this.selectedBranch != undefined && this.selectedBranch != '') &&
            (this.showDepartment ? (this.departmentName != undefined && this.departmentName != '') : true);


        this.formValidityChanged.emit(isValid);
        this.updateAppTransactionsForViewDto.emit(this.appTransactionsForViewDto);
        // Emit the result to the parent component
        return isValid;
    }

    ngDoCheck() {
        this.isValidForm();
    }
}
