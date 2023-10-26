import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AccountBranchDto, AppEntitiesServiceProxy, AppTransactionContactDto, AppTransactionServiceProxy, ContactRoleEnum, GetAccountInformationOutputDto, GetAppTransactionsForViewDto, GetContactInformationDto, LookupLabelDto, PagedResultDtoOfGetAccountInformationOutputDto } from "@shared/service-proxies/service-proxies";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import { stringInsert } from "@devexpress/analytics-core/analytics-internal";

@Component({
    selector: "app-contact",
    templateUrl: "./contact.component.html",
    styleUrls: ["./contact.component.scss"],
})
export class ContactComponent implements OnInit, OnChanges {
    companeyNames: any[];
    selectedCompany: GetAccountInformationOutputDto;
    selectedContact: GetContactInformationDto = new GetContactInformationDto();
    @Input() showDepartment: boolean = false;
    selectedBranch: AccountBranchDto;
    selectedPhoneType: LookupLabelDto;
    __selectedPhoneTypeValue: number;
    @Output() formValidityChanged = new EventEmitter<boolean>();
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("activeTab") activeTab: number;      
    @Input("isCreateOrEdit") isCreateOrEdit: boolean;
    @Input("salesRepIndex") salesRepIndex: number = 1;
    @Input("shipInfoIndex") shipInfoIndex:number;
    @Output("updateAppTransactionsForViewDto") updateAppTransactionsForViewDto = new EventEmitter<GetAppTransactionsForViewDto>();
    @Output() loadAddressComponent = new EventEmitter<object>();

    appTransactionContactsIndex = -1;

    allPhoneTypes: LookupLabelDto[];

    allContacts: GetContactInformationDto[];
    allBranches;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;


    constructor(
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {

    }

    ngOnInit(): void {
        this.resetSelectedData();

    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.appTransactionsForViewDto && this.activeTab !=null && this.activeTab >= 0) {
            this.getAllCompanies();
                this.getAppTransactionContactsIndex();
            this.getPhoneType();
        }
    }
    resetSelectedData() {
        this.selectedCompany = null;
        this.selectedBranch = null;
        this.selectedContact = null;
        this.selectedPhoneType = null;
        this.__selectedPhoneTypeValue = 0;
    }

    onChangeCompany() {
        this.getContacts();
        this.getBranches();
        if (this.loadAddressComponent) {
            this.loadAddressComponent.emit({ compssin: this.selectedCompany?.accountSSIN, compId: this.selectedCompany?.id });
        }
    }

    getAppTransactionContactsIndex() {
        this.appTransactionContactsIndex =-1;
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
                _contactRole = ContactRoleEnum.APContact;
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


    getPhoneType() {
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;

            if (!this.selectedPhoneType) {
                this.selectedPhoneType = this.allPhoneTypes?.find(x => x.value == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneTypeId);
                this.__selectedPhoneTypeValue = this.selectedPhoneType?.value;
            }
        });
    }
    onchangePhoneType($event) {
        this.selectedPhoneType = this.allPhoneTypes?.find(x => x.value == $event?.value);
        this.__selectedPhoneTypeValue = this.selectedPhoneType?.value;
    }

    getContacts() {
        if (this.selectedCompany && this.selectedCompany?.accountSSIN) {
            this._AppTransactionServiceProxy.getAccountRelatedContactsList(this.selectedCompany?.accountSSIN, undefined).subscribe(result => {
                this.allContacts = result;
                if (!this.selectedContact)
                    this.selectedContact = this.allContacts?.find(x => x.ssin == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactSSIN);
            });
        }
    }

    getBranches() {
        if (this.selectedCompany && this.selectedCompany?.accountSSIN) {
            this._AppTransactionServiceProxy.getAccountBranches(this.selectedCompany?.accountSSIN).subscribe(result => {
                this.allBranches = result;
                if (!this.selectedBranch)
                    this.selectedBranch = this.allBranches?.find(x => x.name == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.branchName);
            });
        }
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
            .subscribe((res: PagedResultDtoOfGetAccountInformationOutputDto) => {
                this.companeyNames = [...res.items];
             //   if (!this.selectedCompany)
                    this.selectedCompany = this.companeyNames?.find(x => x.accountSSIN == this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.companySSIN)

                if (this.selectedCompany && this.selectedCompany?.accountSSIN) {
                    this.getBranches();
                    this.getContacts();
                    if (this.loadAddressComponent) {
                        this.loadAddressComponent.emit({ compssin: this.selectedCompany?.accountSSIN, compId: this.selectedCompany?.id });
                    }
                }

            });
    }

    isValidForm(): boolean {
        let isValid =false;
        if (this.appTransactionsForViewDto?.appTransactionContacts && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]) {
            if (this.selectedCompany?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companyName = this.selectedCompany?.name;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].companySSIN = this.selectedCompany?.accountSSIN;
            }
            if (this.__selectedPhoneTypeValue) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeName = this.selectedPhoneType?.label;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactPhoneTypeId = this.selectedPhoneType?.value;
                this.__selectedPhoneTypeValue = this.selectedPhoneType?.value;
            }

            if (this.selectedBranch?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchName = this.selectedBranch?.name;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].branchSSIN = this.selectedBranch?.ssin;
            }

            if (this.selectedContact?.name) {
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactName = this.selectedContact?.name;
                this.appTransactionsForViewDto.appTransactionContacts[this.appTransactionContactsIndex].contactSSIN = this.selectedContact?.ssin;
            }
             isValid =
                (this.selectedCompany != undefined && this.selectedCompany?.name != '') &&
                (this.selectedContact?.name != undefined && this.selectedContact?.name != '') &&
                (this.selectedPhoneType != undefined && this.selectedPhoneType?.label != '') &&
                (this?.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneTypeId != undefined && this?.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneTypeId > 0) &&
                (this?.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactPhoneNumber != undefined) &&
                (this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail != undefined && this.appTransactionsForViewDto?.appTransactionContacts[this.appTransactionContactsIndex]?.contactEmail != '') &&
                (this.showDepartment ? (this.appTransactionsForViewDto?.buyerDepartment != undefined && this.appTransactionsForViewDto?.buyerDepartment != '') : true);



            this.formValidityChanged.emit(isValid);
            if (isValid) {
                this.updateAppTransactionsForViewDto.emit(this.appTransactionsForViewDto);
            }

        }
        return isValid;
    }

    ngDoCheck() {
        this.isValidForm();
    }

}
