import { Component, ViewChild, Injector, Output, EventEmitter, Input} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycEntityObjectCategoriesServiceProxy, CreateOrEditSycEntityObjectCategoryDto ,SycEntityObjectCategorySydObjectLookupTableDto
					,SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto,
                    BranchDto,
                    AccountsServiceProxy,
                    LookupLabelDto,
                    AppEntitiesServiceProxy,
                    AppContactAddressDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { SelectAddressModalComponent } from '../../../selectAddress/selectAddress/selectAddress-modal.component';
@Component({
    selector: 'createOrEditBranchModal',
    styleUrls: ['./create-or-edit-branch-modal.component.css','./AccountInfo.component.scss'],
    templateUrl: './create-or-edit-branch-modal.component.html'
})
export class CreateOrEditBranchModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Input() billingAddressDef:LookupLabelDto
    @Input() directShippingAddressDef:LookupLabelDto
    @Input() distributionCenterAddressDef:LookupLabelDto
    @Input() mailingAddressDef:LookupLabelDto

    @Output() branchAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() branchUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectAddress: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    branch: BranchDto = new BranchDto();

    allPhoneTypes: LookupLabelDto[];
    allCurrencies: LookupLabelDto[];
    allLanguages: LookupLabelDto[];

    address1:AppContactAddressDto=new AppContactAddressDto();
    address2:AppContactAddressDto=new AppContactAddressDto();
    address3:AppContactAddressDto=new AppContactAddressDto();
    address4:AppContactAddressDto=new AppContactAddressDto();

    accountInfoLoded: any;
    phoneTypesLoaded: any;
    currSelectAddress: number;
    countryFlag='eg'
    inputObj1:any;
    // sydObjectName = '';
    // sycEntityObjectCategoryName = '';

	// allSydObjects: SycEntityObjectCategorySydObjectLookupTableDto[];
	// 					allSycEntityObjectCategorys: SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto[];
    entityObjectType:string ="TENANTBRANCH";
    stylesObj = {
        'width':"130px",
        'height':"47px"
      };
      branchCode:string="";
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
        if(this.inputObj1){
            this.inputObj1.setNumber('+91987654321');
         }
    }

    addressSelected(address){
        this.active = true;
        this.modal.show();

        let x:AppContactAddressDto;

        if(this.currSelectAddress==1){
            x = this.address1;
        }
        if(this.currSelectAddress==2){
            x = this.address2;
        }
        if(this.currSelectAddress==3){
            x = this.address3;
        }
        if(this.currSelectAddress==4){
            x = this.address4;
        }

        x.addressId=address.id;
        x.code=address.code;
        x.name=address.name;
        x.addressLine1=address.addressLine1;
        x.addressLine2=address.addressLine2;
        x.city=address.city;
        x.state=address.state;
        x.postalCode=address.postalCode;
        x.countryId=address.countryId;
        x.countryIdName=address.countryIdName;

    }

    show(accountId?:number,branchId?: number,parentId?:number): void {
        this.branchCode=""
        this.address1 = this.clearAddress();
        this.address2 = this.clearAddress();
        this.address3 = this.clearAddress();
        this.address4 = this.clearAddress();
        this.showMainSpinner();

        if (!branchId) {
            this.branch = new BranchDto();
            this.branch.accountId = accountId
            this.accountInfoLoded=true;
            this.setDefaultPhoneTypes();
            this.branch.id = branchId;
            this.branch.parentId = parentId;
            // this.sydObjectName = '';
            // this.sycEntityObjectCategoryName = '';

            this.active = true;
            this.modal.show();
            this.hideMainSpinner();
        } else {
            this._AccountsServiceProxy.getBranchForEdit(branchId).subscribe(result => {
                this.branch = result;
               var subCode = this.branch.code.indexOf("-");
               if (subCode>=0)
                 this.branchCode= this.branch.code.substring(subCode+1,this.branch.code.length); 
                else
                this.branchCode= this.branch.code

                if(this.branch.parentId) this.branch.accountId = accountId
                let x1 = this.branch.contactAddresses.find(x=>x.addressTypeId==this.billingAddressDef.value)
                if(x1!=undefined)this.address1=x1;

                let x2 = this.branch.contactAddresses.find(x=>x.addressTypeId==this.directShippingAddressDef.value)
                if(x2!=undefined)this.address2=x2;

                let x3 = this.branch.contactAddresses.find(x=>x.addressTypeId==this.distributionCenterAddressDef.value)
                if(x3!=undefined)this.address3=x3;

                let x4 = this.branch.contactAddresses.find(x=>x.addressTypeId==this.mailingAddressDef.value)
                if(x4!=undefined)this.address4=x4;

                this.accountInfoLoded=true;
                this.setDefaultPhoneTypes();
                this.hideMainSpinner();
                this.active = true;
                this.modal.show();
            });
        }

        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;
            this.phoneTypesLoaded=true;
            this.setDefaultPhoneTypes();

        });
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });



    }

    selectAddressClick(addressNumber){
        this.currSelectAddress = addressNumber;
        this.selectAddress.emit();
    }
    hasErrorphone1Number(e){
    }
    getNumberphone1Number(e){
        // this.branch.phone1Number=e;
    }
    telInputObjectphone1Number(obj){
        // this.inputObj1 = obj;
        // if (this.branch.phone1Number) {
        //   obj.setNumber(this.branch.phone1Number);
        // }
        // obj.setCountry(this.branch.phone1CountryKey);
        if(!this.branch.phone1CountryKey)
        this.branch.phone1CountryKey='us'
         obj.setCountry(this.branch.phone1CountryKey);


    }
    onCountryChangephone1Number(e){
        this.branch.phone1CountryKey=e.iso2
    }
    hasErrorphone2Number(e){
    }
    getNumberphone2Number(e){
        this.branch.phone2Number=e;
    }
    telInputObjectphone2Number(obj){
        if(!this.branch.phone2CountryKey)
        this.branch.phone2CountryKey='us'
         obj.setCountry(this.branch.phone2CountryKey);

    }
    onCountryChangephone2Number(e){
        this.branch.phone2CountryKey=e.iso2

    }
    hasErrorphone3Number(e){
    }
    getNumberphone3Number(e){
        this.branch.phone3Number=e;
    }
    telInputObjectphone3Number(obj){
        if(!this.branch.phone3CountryKey)
        this.branch.phone3CountryKey='us'
         obj.setCountry(this.branch.phone3CountryKey);
    }
    onCountryChangephone3Number(e){
        this.branch.phone3CountryKey=e.iso2

    }

    clearAddress(){
        let address =new AppContactAddressDto()

        address.code=''
        address.name=''
        address.addressLine1=''
        address.addressLine2=''
        address.city=''
        address.state=''
        address.postalCode=''

        return address
    }
    setDefaultPhoneTypes(): void {


        if(!this.accountInfoLoded || !this.phoneTypesLoaded) return;


        //set default phone types tobe displayed
        if(this.branch.phone1TypeId==0 || this.branch.phone1TypeId==null || this.branch.phone1TypeId==undefined){
            this.branch.phone1TypeId = this.allPhoneTypes.length > 0 ? this.allPhoneTypes[0].value : this.branch.phone1TypeId;
            this.branch.phone2TypeId = this.allPhoneTypes.length > 1 ? this.allPhoneTypes[1].value : this.branch.phone2TypeId;
            this.branch.phone3TypeId = this.allPhoneTypes.length > 2 ? this.allPhoneTypes[2].value : this.branch.phone3TypeId;
        }
    }

    save(): void {
        this.saving = true;
        let tenancyName =  this.appSession.tenancyName;
        if (!tenancyName)
            this.branch.code = this.branchCode;
        else
            this.branch.code = tenancyName + "-" + this.branchCode;


        this.branch.contactAddresses=[]
        if(this.address1.addressId>0){
            this.address1.addressTypeId = this.billingAddressDef.value
            this.branch.contactAddresses.push(this.address1)
        }
        if(this.address2.addressId>0){
            this.address2.addressTypeId = this.directShippingAddressDef.value
            this.branch.contactAddresses.push(this.address2)
        }
        if(this.address3.addressId>0){
            this.address3.addressTypeId=this.distributionCenterAddressDef.value
            this.branch.contactAddresses.push(this.address3)
        }
        if(this.address4.addressId>0){
            this.address4.addressTypeId=this.mailingAddressDef.value
            this.branch.contactAddresses.push(this.address4)
        }

            let addNew = this.branch.id == null || this.branch.id == undefined || this.branch.id == 0
            this._AccountsServiceProxy.createOrEditBranch(this.branch)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe((value) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                if(addNew){
                    this.branchAdded.emit(value);
                }
                else{
                    this.branchUpdated.emit(value);
                }
             });
    }



    close(): void {
        this.active = false;
        this.modal.hide();
    }

    getCodeValue(code: string) {
        this.branchCode= code;
      }

}
