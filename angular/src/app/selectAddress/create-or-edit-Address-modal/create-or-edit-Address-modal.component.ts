import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
    AccountsServiceProxy,
    LookupLabelDto,
    AppEntitiesServiceProxy,
    AppAddressDto,
    AppContactAddressDto
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
    contactAddress: AppContactAddressDto = new AppContactAddressDto();

    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
        super(injector);

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

    show(addressId?: number, branch?: any, accountId?: number, contactId?: number, addressTypeId?: number): void {
        this.branchId = branch?.node?.data?.branch?.id;
      
     
        this._AppEntitiesServiceProxy.getAllCountryForTableDropdown().subscribe(result => {
          this.allCountries = result;
          const noneOption: LookupLabelDto = Object.assign(new LookupLabelDto(), { label: "None", value: null });
          this.allCountries.unshift(noneOption);
        });
      
        const isPersonal = this.appSession?.tenant?.edition?.displayName === 'Personal Edition';
      
        if (!addressId) {
          this.address = new AppAddressDto();
          this.address.accountId = accountId;
      
       
          if (isPersonal) {
            this.contactAddress = new AppContactAddressDto();
            this.contactAddress.accountId = accountId!;
            this.contactAddress.contactId = contactId!;          
            this.contactAddress.addressTypeId = addressTypeId!;   
          }
      
          this.active = true;
          this.modal.show();
      
        } else {
          this._accountsServiceProxy.getAddressForEdit(addressId).subscribe(result => {
            this.address = result;
      
            const subCode = this.address.code?.indexOf("-") ?? -1;
            this.addressCode = subCode >= 0
              ? this.address.code!.substring(subCode + 1)
              : (this.address.code ?? '');
      
            if (isPersonal) {
              this.contactAddress = new AppContactAddressDto();
              this.contactAddress.accountId = this.address.accountId!;
              this.contactAddress.contactId = contactId!;
              this.contactAddress.addressTypeId = addressTypeId!;
              this.contactAddress.addressId = this.address.id;   
              this.contactAddress.code = this.address.code;
              this.contactAddress.name = this.address.name;
              this.contactAddress.addressLine1 = this.address.addressLine1;
              this.contactAddress.addressLine2 = this.address.addressLine2;
              this.contactAddress.city = this.address.city;
              this.contactAddress.state = this.address.state;
              this.contactAddress.postalCode = this.address.postalCode;
              this.contactAddress.countryId = this.address.countryId;
              this.contactAddress.countryIdName = this.address.countryIdName;
      
       
              this.contactAddress.addressFk = this.address; 
            }
      
            this.active = true;
            this.modal.show();
          });
        }
      
   
        if (!addressId) {
          this._accountsServiceProxy.getAccountForView(this.appSession?.user?.accountId, 5)
            .subscribe(result => {
              this.address.countryId = result?.account?.countryId;
      
              if (isPersonal) {
                this.contactAddress.countryId = this.address.countryId;
              }
            });
        }
      }
      
    // save() {
    //     this.saving = true;
    //     let tenancyName = this.appSession.tenancyName;
    //     this.address.code = tenancyName + "-" + this.addressCode;
      
      
    //     const selectedCountry = this.allCountries.find(c => c.value === this.address.countryId);
    //     this.address.countryIdName = selectedCountry?.label ?? null;
      
    //     let addNew = this.address.id == null || this.address.id == undefined || this.address.id == 0;
      
    //         this._accountsServiceProxy.createOrEditAddress(this.address)
    //         .pipe(finalize(() => { this.saving = false; }))
    //         .subscribe((value) => {
    //           this.notify.info(this.l('SavedSuccessfully'));
    //           this.close();
    //           if (addNew) {
    //             this.addressAdded.emit(value);
    //           } else {
    //             this.addressUpdated.emit(value);
    //           }
    //         });
       
       
    //   }

    save() {
        this.saving = true;
      
        const tenancyName = this.appSession.tenancyName;
        this.address.code = tenancyName + "-" + this.addressCode;
      
        const selectedCountry = this.allCountries?.find(c => c.value === this.address.countryId);
        this.address.countryIdName = selectedCountry?.label ?? null;
      
        const addNew = !this.address.id;
      
        const isPersonal = this.appSession?.tenant?.edition?.displayName === 'Personal Edition';
      
        if (!isPersonal) {
          this._accountsServiceProxy.createOrEditAddress(this.address)
            .pipe(finalize(() => this.saving = false))
            .subscribe(value => {
              this.notify.info(this.l('SavedSuccessfully'));
              this.close();
              addNew ? this.addressAdded.emit(value) : this.addressUpdated.emit(value);
            });
      
        } else {
        
          this.contactAddress.code = this.address.code;
          this.contactAddress.name = this.address.name;
          this.contactAddress.addressLine1 = this.address.addressLine1;
          this.contactAddress.addressLine2 = this.address.addressLine2;
          this.contactAddress.city = this.address.city;
          this.contactAddress.state = this.address.state;
          this.contactAddress.postalCode = this.address.postalCode;
          this.contactAddress.countryId = this.address.countryId;
          this.contactAddress.countryIdName = this.address.countryIdName;
      

          this.contactAddress.addressFk = this.address;
      
          this._accountsServiceProxy.createOrEditContactAddress(this.contactAddress)
            .pipe(finalize(() => this.saving = false))
            .subscribe(value => {
              this.notify.info(this.l('SavedSuccessfully'));
              this.close();
              addNew ? this.addressAdded.emit(value) : this.addressUpdated.emit(value);
            });
        }
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
