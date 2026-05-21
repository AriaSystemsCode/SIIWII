import { Component, ViewChild, Injector, Output, EventEmitter, Input } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
    BranchDto,
    AccountsServiceProxy,
    LookupLabelDto,
    AppEntitiesServiceProxy,
    AppContactAddressDto,
    AppAddressDto
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'createOrEditBranchModal',
    styleUrls: ['./create-or-edit-branch-modal.component.scss', '../../main/accountInfos/components/accountInfo/accountInfo.component.scss'],
    templateUrl: './create-or-edit-branch-modal.component.html'
})
export class CreateOrEditBranchModalComponent extends AppComponentBase {

    // @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Input() billingAddressDef: LookupLabelDto
    @Input() directShippingAddressDef: LookupLabelDto
    @Input() distributionCenterAddressDef: LookupLabelDto
    @Input() mailingAddressDef: LookupLabelDto

    @Output() branchAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() branchUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectAddress: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    branch: BranchDto = new BranchDto();

    allPhoneTypes: LookupLabelDto[];
    allCurrencies: LookupLabelDto[];
    allLanguages: LookupLabelDto[];

    address1: AppContactAddressDto = new AppContactAddressDto();
    address2: AppContactAddressDto = new AppContactAddressDto();
    address3: AppContactAddressDto = new AppContactAddressDto();
    address4: AppContactAddressDto = new AppContactAddressDto();

    accountInfoLoded: any;
    phoneTypesLoaded: any;
    currSelectAddress: number;
    inputObj1: any;
    entityObjectType: string = "BRANCH";
    stylesObj = {

        'height': "47px"
    };
    branchCode: string = "";

    phonePattern = '^[0-9+()\\-\\s]*$';
    accountId?: number;
    branchId?: number;
    parentId?: number;


    draftAddresses: any;
    pendingSelectedAddress: AppAddressDto;
    pendingSelectedAddressNumber: number;

    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector);

        this.address1 = this.clearAddress();
        this.address2 = this.clearAddress();
        this.address3 = this.clearAddress();
        this.address4 = this.clearAddress();
        if (this.inputObj1) {
            this.inputObj1.setNumber('+91987654321');
        }
    }
    ngOnInit() {
        this.show(this.accountId, this.branchId, this.parentId);
    }

    private applyDraftAndPendingAddress(): void {
        if (this.draftAddresses) {
            this.address1 = this.draftAddresses.address1 || this.clearAddress();
            this.address2 = this.draftAddresses.address2 || this.clearAddress();
            this.address3 = this.draftAddresses.address3 || this.clearAddress();
            this.address4 = this.draftAddresses.address4 || this.clearAddress();
        }

        if (this.pendingSelectedAddress && this.pendingSelectedAddressNumber) {
            this.currSelectAddress = this.pendingSelectedAddressNumber;
            this.addressSelected(this.pendingSelectedAddress);
        }
    }

    // addressSelected(address) {
    //     this.active = true;
    //     // this.modal.show();

    //     let x: AppContactAddressDto;

    //     if (this.currSelectAddress == 1) {
    //         x = this.address1;
    //     }
    //     if (this.currSelectAddress == 2) {
    //         x = this.address2;
    //     }
    //     if (this.currSelectAddress == 3) {
    //         x = this.address3;
    //     }
    //     if (this.currSelectAddress == 4) {
    //         x = this.address4;
    //     }

    //     x.addressId = address.id;
    //     x.code = address.code;
    //     x.name = address.name;
    //     x.addressLine1 = address.addressLine1;
    //     x.addressLine2 = address.addressLine2;
    //     x.city = address.city;
    //     x.state = address.state;
    //     x.postalCode = address.postalCode;
    //     x.countryId = address.countryId;
    //     x.countryIdName = address.countryIdName;

    // }


    addressSelected(address: AppAddressDto): void {
        this.active = true;

        if (!this.currSelectAddress) {
            this.currSelectAddress = 1;
        }

        let x: AppContactAddressDto;

        switch (this.currSelectAddress) {
            case 1:
                x = this.address1 || this.clearAddress();
                this.address1 = x;
                break;

            case 2:
                x = this.address2 || this.clearAddress();
                this.address2 = x;
                break;

            case 3:
                x = this.address3 || this.clearAddress();
                this.address3 = x;
                break;

            case 4:
                x = this.address4 || this.clearAddress();
                this.address4 = x;
                break;

            default:
                x = this.address1 || this.clearAddress();
                this.address1 = x;
                break;
        }


        x.addressFk = undefined;

        x.addressId = address.id;
        x.code = address.code;
        x.name = address.name;
        x.addressLine1 = address.addressLine1;
        x.addressLine2 = address.addressLine2;
        x.city = address.city;
        x.state = address.state;
        x.postalCode = address.postalCode;
        x.countryId = address.countryId;
        x.countryIdName = address.countryIdName;
    }

    show(accountId?: number, branchId?: number, parentId?: number): void {
        this.address1 = this.clearAddress();
        this.address2 = this.clearAddress();
        this.address3 = this.clearAddress();
        this.address4 = this.clearAddress();
        this.showMainSpinner();

        if (!branchId) {
            this.branch = new BranchDto();
            this.branch.accountId = accountId
            this.accountInfoLoded = true;
            this.setDefaultPhoneTypes();
            this.branch.id = branchId;
            this.branch.parentId = parentId;
            this.active = true;
            // this.modal.show();

            this.applyDraftAndPendingAddress();

            this.hideMainSpinner();
        } else {
            this._AccountsServiceProxy.getBranchForEdit(branchId).subscribe(result => {
                this.branch = result;
                var subCode = this.branch.code.indexOf("-");
                // if (subCode >= 0)
                //     this.branchCode = this.branch.code.substring(subCode + 1, this.branch.code.length);
                // else
                this.branchCode = this.branch.code

                if (this.branch.parentId) this.branch.accountId = accountId
                let x1 = this.branch.contactAddresses.find(x => x.addressTypeId == this.billingAddressDef.value)
                if (x1 != undefined) {
                    this.address1 = x1;

                }

                let x2 = this.branch.contactAddresses.find(x => x.addressTypeId == this.directShippingAddressDef.value)
                if (x2 != undefined) this.address2 = x2;

                let x3 = this.branch.contactAddresses.find(x => x.addressTypeId == this.distributionCenterAddressDef.value)
                if (x3 != undefined) this.address3 = x3;

                let x4 = this.branch.contactAddresses.find(x => x.addressTypeId == this.mailingAddressDef.value)
                if (x4 != undefined) this.address4 = x4;

                this.accountInfoLoded = true;
                this.setDefaultPhoneTypes();
                this.active = true;
                this.applyDraftAndPendingAddress();
                this.hideMainSpinner();
                // this.active = true;
                // this.modal.show();
            });
        }

        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;
            this.phoneTypesLoaded = true;
            this.setDefaultPhoneTypes();

        });
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });



    }

    selectAddressClick(addressNumber) {
        this.currSelectAddress = addressNumber;
        this.selectAddress.emit();
    }

    telInputObjectphone1Number(obj) {

        if (!this.branch.phone1CountryKey)
            this.branch.phone1CountryKey = 'us'
        obj.setCountry(this.branch.phone1CountryKey);


    }
    onCountryChangephone1Number(e) {
        this.branch.phone1CountryKey = e.iso2
    }

    getNumberphone2Number(e) {
        this.branch.phone2Number = e;
    }
    telInputObjectphone2Number(obj) {
        if (!this.branch.phone2CountryKey)
            this.branch.phone2CountryKey = 'us'
        obj.setCountry(this.branch.phone2CountryKey);

    }
    onCountryChangephone2Number(e) {
        this.branch.phone2CountryKey = e.iso2

    }

    getNumberphone3Number(e) {
        this.branch.phone3Number = e;
    }
    telInputObjectphone3Number(obj) {
        if (!this.branch.phone3CountryKey)
            this.branch.phone3CountryKey = 'us'
        obj.setCountry(this.branch.phone3CountryKey);
    }
    onCountryChangephone3Number(e) {
        this.branch.phone3CountryKey = e.iso2

    }

    clearAddress() {
        let address = new AppContactAddressDto()

        address.code = ''
        address.name = ''
        address.addressLine1 = ''
        address.addressLine2 = ''
        address.city = ''
        address.state = ''
        address.postalCode = ''

        return address
    }
    setDefaultPhoneTypes(): void {


        if (!this.accountInfoLoded || !this.phoneTypesLoaded) return;
        if (this.branch.phone1TypeId == 0 || this.branch.phone1TypeId == null || this.branch.phone1TypeId == undefined) {
            this.branch.phone1TypeId = this.allPhoneTypes.length > 0 ? this.allPhoneTypes[0].value : this.branch.phone1TypeId;
            this.branch.phone2TypeId = this.allPhoneTypes.length > 1 ? this.allPhoneTypes[1].value : this.branch.phone2TypeId;
            this.branch.phone3TypeId = this.allPhoneTypes.length > 2 ? this.allPhoneTypes[2].value : this.branch.phone3TypeId;
        }
    }


    private toAppAddressDto(src: any, tenantId: number): AppAddressDto {
        return Object.assign(new AppAddressDto(), {
            id: src.addressId,
            code: src.code,
            name: src.name,
            addressLine1: src.addressLine1,
            addressLine2: src.addressLine2,
            city: src.city,
            state: src.state,
            postalCode: src.postalCode,
            countryId: src.countryId,
            countryCode: src.countryCode,
            tenantId: tenantId
        });
    }



    private pushAddress(
        contactAddr: any,
        addressTypeId: number,
        patch?: Record<string, any>
    ): void {
        if (!contactAddr || !(contactAddr.addressId > 0)) return;

        const dto = Object.assign(new AppContactAddressDto(), contactAddr);
        dto.addressTypeId = addressTypeId;

        if (patch) {
            Object.assign(dto, patch);
        }

        dto.addressFk = this.toAppAddressDto(dto, this.branch?.tenantId);

        this.branch.contactAddresses.push(dto);
    }


    save(): void {
        this.saving = true;

        this.branch.code = this.branchCode;


        this.branch.contactAddresses = [];

        this.pushAddress(this.address1, this.billingAddressDef.value);
        this.pushAddress(this.address2, this.directShippingAddressDef.value);
        this.pushAddress(this.address3, this.distributionCenterAddressDef.value);
        this.pushAddress(this.address4, this.mailingAddressDef.value);

        const addNew =
            this.branch.id == null ||
            this.branch.id == undefined ||
            this.branch.id == 0;

        this.branch.accountId = this.appSession.user.accountId;

        this._AccountsServiceProxy.createOrEditBranch(this.branch)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(value => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();

                addNew
                    ? this.branchAdded.emit(value)
                    : this.branchUpdated.emit(value);
            });
    }

    close(): void {
        // this.active = false;
        // this.modal.hide();
        this.currentModalRef.setClass('right-modal slide-right-out');
        this.currentModalRef.hide();
    }

    getCodeValue(code: string) {
        this.branchCode = code;
    }

}
