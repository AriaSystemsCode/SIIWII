import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
    AccountsServiceProxy,
    LookupLabelDto,
    AppEntitiesServiceProxy,
    AppAddressDto,
    SycIdentifierDefinitionsServiceProxy
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';


@Component({
    selector: 'createOrEditAddressModal',
    styleUrls: ['./create-or-edit-address-modal.component.scss'],
    templateUrl: './create-or-edit-address-modal.component.html'
})
export class CreateOrEditAddressModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() addressAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() addressUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() createOrEditaddressCanceled: EventEmitter<any> = new EventEmitter<any>();


    active = false;
    saving = false;

    address: AppAddressDto = new AppAddressDto();

    allCountries: LookupLabelDto[];
    branchId: number
    entityObjectType: string = "ADDRESS";
    addressCode: string = "";
            currentLang:string
    isArabic:boolean = true
    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
            private _sycIdentifierDefinitionsServiceProxy:
        SycIdentifierDefinitionsServiceProxy
    ) {
        super(injector);

    }
        ngOnInit(){
                this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    }
    // show(addressId?: number, branch?: any, accountId?: number): void {
    //     this.branchId = branch?.node?.data?.branch?.id

    //     if (!addressId) {
    //         this.address = new AppAddressDto();
    //         this.address.accountId = accountId
    //         this.active = true;
    //         this.modal.show();
    //     } else {
    //         this._accountsServiceProxy.getAddressForEdit(addressId).subscribe(result => {
    //             this.address = result;
    //             var subCode = this.address.code.indexOf("-");
    //             if (subCode >= 0)
    //                 this.addressCode = this.address.code.substring(subCode + 1, this.address.code.length);
    //             else
    //                 this.addressCode = this.address.code
    //             this.active = true;
    //             this.modal.show();
    //         });
    //     }

    //     this._AppEntitiesServiceProxy.getAllCountryForTableDropdown().subscribe(result => {
    //         this.allCountries = result;
    //         let noneOption: LookupLabelDto = Object.assign(new LookupLabelDto(), { label: "None", value: null })
    //         this.allCountries.unshift(noneOption)
    //     });
    //     if(this.address.id == null || this.address.id == undefined || this.address.id == 0){
    //         this._accountsServiceProxy.getAccountForView(this.appSession?.user?.accountId,5)
    //         .subscribe((result)=>{ 
         
    //             this.address.countryId = result?.account?.countryId
          
    //         });
   
    //     }

    // }
async show(
    addressId?: number,
    branch?: any,
    accountId?: number
): Promise<void> {

    this.branchId =
        branch?.node?.data?.branch?.id;

    this.addressCode = '';

    if (!addressId) {

        this.address =
            new AppAddressDto();

        this.address.accountId =
            accountId;

        await this.setNextAddressCode();

        this.active = true;
        this.modal.show();

    } else {

        this._accountsServiceProxy
            .getAddressForEdit(addressId)
            .subscribe(result => {

                this.address =
                    result;

                const subCode =
                    this.address.code
                        ?.indexOf('-');

                if (
                    subCode !== undefined &&
                    subCode >= 0
                ) {
                    this.addressCode =
                        this.address.code.substring(
                            subCode + 1
                        );
                } else {
                    this.addressCode =
                        this.address.code;
                }

                this.active = true;
                this.modal.show();
            });
    }

    this._AppEntitiesServiceProxy
        .getAllCountryForTableDropdown()
        .subscribe(result => {

            this.allCountries =
                result;

            const noneOption:
                LookupLabelDto =
                Object.assign(
                    new LookupLabelDto(),
                    {
                        label: 'None',
                        value: null
                    }
                );

            this.allCountries.unshift(
                noneOption
            );
        });

    if (!addressId) {

        this._accountsServiceProxy
            .getAccountForView(
                this.appSession?.user?.accountId,
                5
            )
            .subscribe(result => {

                this.address.countryId =
                    result?.account?.countryId;
            });
    }
}
    private async setNextAddressCode(): Promise<void> {
    try {
        const typeCode = this.entityObjectType; // "ADDRESS"

        const nextCode =
            await this._sycIdentifierDefinitionsServiceProxy
                .getNextEntityCode(
                    typeCode,
                    this.appSession.tenantId
                )
                .toPromise();

        this.addressCode =
            nextCode?.toString() ?? '';

    } catch (error) {
        console.error(
            'Error getting next address code',
            error
        );

        this.addressCode = '';
    }
}

    save() {
        this.saving = true;
        let tenancyName = this.appSession.tenancyName;
        this.address.code = tenancyName + "-" + this.addressCode;
      
        //  Assign country name if applicable
        const selectedCountry = this.allCountries.find(c => c.value === this.address.countryId);
        this.address.countryIdName = selectedCountry?.label ?? null;
      
        let addNew = this.address.id == null || this.address.id == undefined || this.address.id == 0;
      
        this._accountsServiceProxy.createOrEditAddress(this.address)
          .pipe(finalize(() => { this.saving = false; }))
          .subscribe((value) => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
            if (addNew) {
              this.addressAdded.emit(value);
            } else {
              this.addressUpdated.emit(value);
            }
          });
      }
      

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    cancel() {
        this.close()
        this.createOrEditaddressCanceled.emit()
    }

    checkAddresUsageCount(addressId: number, branchId: number) {
        return this._accountsServiceProxy.isAddressUsedByOtherBranch(addressId, branchId)
    }

    getCodeValue(code: string) {
        this.addressCode = code;
    }
}
