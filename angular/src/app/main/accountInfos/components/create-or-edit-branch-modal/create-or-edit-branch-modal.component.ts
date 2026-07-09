import { Component, ViewChild, Injector, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
    BranchDto,
    AccountsServiceProxy,
    LookupLabelDto,
    AppEntitiesServiceProxy,
    AppContactAddressDto,
    AppAddressDto,
    AccountDto
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'createOrEditBranchModal',
    styleUrls: ['./create-or-edit-branch-modal.component.scss', '../accountInfo/accountInfo.component.scss'],
    templateUrl: './create-or-edit-branch-modal.component.html'
})
export class CreateOrEditBranchModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Input() billingAddressDef: LookupLabelDto
    @Input() directShippingAddressDef: LookupLabelDto
    @Input() distributionCenterAddressDef: LookupLabelDto
    @Input() mailingAddressDef: LookupLabelDto
   @Input('accountData') accountData: AccountDto
   
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


// Dialog state
showApplyAddressDialog = false;

// Keep what user selected until he decides
private pendingSelectedAddress: any = null;
private pendingAddressSlot: number = 0; // 1..4
private isNewBranch = false;

    currentLang:string
    isArabic:boolean = true
    constructor(
        injector: Injector,
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
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
    }

    addressSelected(address) {
        this.active = true;
        this.modal.show();
      
        const isPersonal = this.accountData?.accountTypeId == 21;
      
        if (!isPersonal) {
          // normal behavior: only selected slot
          const slotRef = this.getSlotRef(this.currSelectAddress);
          this.fillContactAddress(slotRef, address);
          return;
        }
      
        // personal: open dialog
        this.pendingSelectedAddress = address;
        this.pendingAddressSlot = this.currSelectAddress;
        this.showApplyAddressDialog = true;
      }
      
      

    show(accountId?: number, branchId?: number, parentId?: number): void {
        this.isNewBranch = !branchId; 
        this.address1 = this.clearAddress();
        this.address2 = this.clearAddress();
        this.address3 = this.clearAddress();
        this.address4 = this.clearAddress();
        this.showMainSpinner();

        if (!branchId) {
            this.branch = new BranchDto();
            this.branch.accountId = accountId
            this.branch.phone1TypeId = null;
            this.branch.phone2TypeId = null;
            this.branch.phone3TypeId = null;
            this.accountInfoLoded = true;
            // this.setDefaultPhoneTypes();
            this.branch.id = branchId;
            this.branch.parentId = parentId;
            this.active = true;
            this.modal.show();
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
                // this.setDefaultPhoneTypes();
                this.hideMainSpinner();
                this.active = true;
                this.modal.show();
            });
        }

        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            // this.allPhoneTypes = result;
            this.allPhoneTypes = this.filterPhoneTypesForAccount(result);
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

    getNumberphone1Number(e) {
        // this.branch.phone1Number=e;
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
    // setDefaultPhoneTypes(): void {


    //     if (!this.accountInfoLoded || !this.phoneTypesLoaded) return;
    //     if (this.branch.phone1TypeId == 0 || this.branch.phone1TypeId == null || this.branch.phone1TypeId == undefined) {
    //         this.branch.phone1TypeId = this.allPhoneTypes.length > 0 ? this.allPhoneTypes[0].value : this.branch.phone1TypeId;
    //         this.branch.phone2TypeId = this.allPhoneTypes.length > 1 ? this.allPhoneTypes[1].value : this.branch.phone2TypeId;
    //         this.branch.phone3TypeId = this.allPhoneTypes.length > 2 ? this.allPhoneTypes[2].value : this.branch.phone3TypeId;
    //     }
    // }

    // Add inside the component (private helpers)
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
            tenantId: tenantId,
        });
    }

    private pushAddress(contactAddr: any, addressTypeDef: LookupLabelDto): void {
        if (!contactAddr || !(contactAddr.addressId > 0)) return;

        contactAddr.addressTypeId = addressTypeDef.value;
        contactAddr.addressTypeCode = addressTypeDef.code;
        contactAddr.contactCode = this.branch.code;
        contactAddr.addressCode = contactAddr.code;

        contactAddr.addressFk = this.toAppAddressDto(
            contactAddr,
            this.branch?.tenantId
        );

        this.branch.contactAddresses.push(contactAddr);
    }

    save(): void {
        this.saving = true;

        this.branch.code = this.branchCode;
        this.branch.contactAddresses = [];

        this.pushAddress(this.address1, this.billingAddressDef);
        this.pushAddress(this.address2, this.directShippingAddressDef);
        this.pushAddress(this.address3, this.distributionCenterAddressDef);
        this.pushAddress(this.address4, this.mailingAddressDef);

        const addNew = !this.branch.id;

        this.branch.accountId = this.appSession.user.accountId;

        this._AccountsServiceProxy.createOrEditBranch(this.branch)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(value => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                addNew ? this.branchAdded.emit(value) : this.branchUpdated.emit(value);
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    getCodeValue(code: string) {
        this.branchCode = code;
    }


    private fillContactAddress(target: AppContactAddressDto, address: any): void {
        target.addressId = address.id;
        target.code = address.code;
        target.name = address.name;
        target.addressLine1 = address.addressLine1;
        target.addressLine2 = address.addressLine2;
        target.city = address.city;
        target.state = address.state;
        target.postalCode = address.postalCode;
        target.countryId = address.countryId;
        target.countryIdName = address.countryIdName;
      }
      
      private getSlotRef(slot: number): AppContactAddressDto {
        switch (slot) {
          case 1: return this.address1;
          case 2: return this.address2;
          case 3: return this.address3;
          case 4: return this.address4;
          default: return this.address1;
        }
      }
      
      private applyAddressToAllSlots(address: any): void {
        this.fillContactAddress(this.address1, address);
        this.fillContactAddress(this.address2, address);
        this.fillContactAddress(this.address3, address);
        this.fillContactAddress(this.address4, address);
      }
      applySelectedAddressOnly(): void {
        if (!this.pendingSelectedAddress) return;
      
        const slotRef = this.getSlotRef(this.pendingAddressSlot);
        this.fillContactAddress(slotRef, this.pendingSelectedAddress);
      
        this.resetApplyDialog();
      }
      
      applySelectedAddressToAll(): void {
        if (!this.pendingSelectedAddress) return;
      
        this.applyAddressToAllSlots(this.pendingSelectedAddress);
      
        this.resetApplyDialog();
      }
      
      cancelApplyDialog(): void {
    
        this.resetApplyDialog();
      }
      
      private resetApplyDialog(): void {
        this.showApplyAddressDialog = false;
        this.pendingSelectedAddress = null;
        this.pendingAddressSlot = 0;
      }
      
      private filterPhoneTypesForAccount(types: LookupLabelDto[]): LookupLabelDto[] {
        const isPersonal = this.accountData?.accountTypeId == 21;
        if (!isPersonal) return types || [];
      
        return (types || []).filter(t => (t?.code || '').toUpperCase() !== 'BUSINE');
      }
      
      
      private getTypeIdByCode(code: string): number | null {
        const target = (code || '').toUpperCase();
        const found = (this.allPhoneTypes || []).find(x => ((x as any).code || '').toUpperCase() === target);
        return found?.value ?? null;
      }
      
      setDefaultPhoneTypes(): void {
        if (!this.phoneTypesLoaded) return;
      
        const isPersonal = this.accountData?.accountTypeId === 21;
        if (!isPersonal) {
      
          if (!this.branch.phone1TypeId) this.branch.phone1TypeId = this.allPhoneTypes?.[0]?.value ?? null;
          if (!this.branch.phone2TypeId) this.branch.phone2TypeId = this.allPhoneTypes?.[1]?.value ?? null;
          if (!this.branch.phone3TypeId) this.branch.phone3TypeId = this.allPhoneTypes?.[2]?.value ?? null;
          return;
        }
      
   
        const mobileId = this.getTypeIdByCode('MOBILE'); // 817
        const homeId   = this.getTypeIdByCode('HOME');   // 815
        const cell2Id  = this.getTypeIdByCode('CELLP');  // 534384
      
    
        if (this.isNewBranch) {
          this.branch.phone1TypeId = mobileId;
          this.branch.phone2TypeId = homeId;
          this.branch.phone3TypeId = cell2Id;
          return;
        }
  
        if (!this.branch.phone1TypeId) this.branch.phone1TypeId = mobileId;
        if (!this.branch.phone2TypeId) this.branch.phone2TypeId = homeId;
        if (!this.branch.phone3TypeId) this.branch.phone3TypeId = cell2Id;
      }
      
      
      
}
